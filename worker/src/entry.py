from workers import WorkerEntrypoint, Response
from js import fetch, Object
import json
import html
import re
from urllib.parse import urlparse, parse_qs

class Default(WorkerEntrypoint):
    """
    Cloudflare Python Worker for ZGQ Inc. Homepage.
    Features:
      1. NewRetroWave Audio Stream CORS Proxy (/api/proxy/stream) with Range streaming
      2. Cloudflare D1 Guestbook (/api/messages) with Turnstile anti-bot verification
    """

    async def fetch(self, request):
        method = request.method
        parsed = urlparse(str(request.url))
        pathname = parsed.path

        # Route 1: Audio Stream CORS Proxy for NewRetroWave Radio
        if pathname.startswith("/api/proxy/") or pathname == "/stream":
            audio_cors_headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=604800, immutable"
            }

            if method == "OPTIONS":
                return Response("", status=204, headers=audio_cors_headers)

            query_params = parse_qs(parsed.query)
            song_param = query_params.get("song", [""])[0]
            url_param = query_params.get("url", [""])[0]

            if song_param:
                clean_song = re.sub(r'[^a-zA-Z0-9_\-\.]', '', song_param)
                target_url = f"https://backend.nrwmusic.stream/uploads/354fg6wGRd5s4J/{clean_song}"
            elif url_param:
                if url_param.startswith("https://backend.nrwmusic.stream/") or url_param.startswith("http://backend.nrwmusic.stream/"):
                    target_url = url_param
                else:
                    return Response(
                        json.dumps({"error": "Forbidden target origin"}, ensure_ascii=False),
                        status=403,
                        headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
                    )
            else:
                return Response(
                    json.dumps({"error": "Missing 'song' or 'url' parameter"}, ensure_ascii=False),
                    status=400,
                    headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
                )

            # Pass client Range header if requested
            range_header = None
            try:
                range_header = request.headers.get("range") or request.headers.get("Range")
            except Exception:
                pass

            try:
                if range_header:
                    fetch_opts = Object.fromEntries([
                        ("method", method),
                        ("headers", Object.fromEntries([
                            ("Range", str(range_header))
                        ]))
                    ])
                    sub_res = await fetch(target_url, fetch_opts)
                else:
                    fetch_opts = Object.fromEntries([
                        ("method", method)
                    ])
                    sub_res = await fetch(target_url, fetch_opts)

                sub_status = int(sub_res.status)
                resp_headers = dict(audio_cors_headers)

                try:
                    ct = sub_res.headers.get("content-type")
                    resp_headers["Content-Type"] = str(ct) if ct else "audio/mpeg"
                except Exception:
                    resp_headers["Content-Type"] = "audio/mpeg"

                try:
                    cl = sub_res.headers.get("content-length")
                    if cl:
                        resp_headers["Content-Length"] = str(cl)
                except Exception:
                    pass

                try:
                    cr = sub_res.headers.get("content-range")
                    if cr:
                        resp_headers["Content-Range"] = str(cr)
                except Exception:
                    pass

                if method == "HEAD":
                    return Response("", status=sub_status, headers=resp_headers)

                return Response(sub_res.body, status=sub_status, headers=resp_headers)

            except Exception as proxy_err:
                return Response(
                    json.dumps({"error": f"Stream Proxy Error: {str(proxy_err)}"}, ensure_ascii=False),
                    status=502,
                    headers={"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
                )

        # Standard security & CORS headers for API
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Max-Age": "86400",
            "Content-Type": "application/json; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block"
        }

        # Handle CORS Preflight
        if method == "OPTIONS":
            return Response("", status=204, headers=cors_headers)

        try:
            # Route 1: GET - Query latest approved guestbook messages
            if method == "GET":
                # Auto-ensure table structure exists on first run
                await self.env.DB.prepare("""
                    CREATE TABLE IF NOT EXISTS guestbook (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nickname TEXT NOT NULL,
                        contact TEXT DEFAULT '',
                        content TEXT NOT NULL,
                        ip TEXT DEFAULT '',
                        user_agent TEXT DEFAULT '',
                        is_approved INTEGER DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """).run()

                # Parameterized query to prevent any SQL injection
                stmt = self.env.DB.prepare(
                    "SELECT id, nickname, contact, content, created_at FROM guestbook WHERE is_approved = 1 ORDER BY created_at DESC LIMIT 50"
                )
                result = await stmt.all()

                messages = []
                if hasattr(result, "results") and result.results:
                    for row in result.results:
                        r_id = getattr(row, "id", None) or (row.get("id") if isinstance(row, dict) else None)
                        r_nick = getattr(row, "nickname", "") or (row.get("nickname") if isinstance(row, dict) else "")
                        r_contact = getattr(row, "contact", "") or (row.get("contact") if isinstance(row, dict) else "")
                        r_content = getattr(row, "content", "") or (row.get("content") if isinstance(row, dict) else "")
                        r_date = str(getattr(row, "created_at", "") or (row.get("created_at") if isinstance(row, dict) else ""))

                        messages.append({
                            "id": r_id,
                            "nickname": str(r_nick),
                            "contact": str(r_contact),
                            "content": str(r_content),
                            "created_at": r_date
                        })

                return Response(
                    json.dumps({
                        "success": True,
                        "count": len(messages),
                        "messages": messages
                    }, ensure_ascii=False),
                    status=200,
                    headers=cors_headers
                )

            # Route 2: POST - Submit a new guestbook message with strict defenses
            elif method == "POST":
                raw_text = await request.text()
                if not raw_text:
                    return Response(
                        json.dumps({"success": False, "error": "请求体不能为空"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )

                try:
                    body = json.loads(raw_text)
                except Exception:
                    return Response(
                        json.dumps({"success": False, "error": "无效的 JSON 数据格式"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )

                raw_nickname = str(body.get("nickname", "")).strip()
                raw_contact = str(body.get("contact", "")).strip()
                raw_content = str(body.get("content", "")).strip()
                turnstile_token = str(body.get("turnstile_token") or body.get("cf-turnstile-response") or body.get("token") or "").strip()

                # Anti-Spam & Bot Protection: Cloudflare Turnstile Verification
                if not turnstile_token:
                    return Response(
                        json.dumps({"success": False, "error": "请先完成人机安全验证 (Turnstile)"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )

                # Anti-Injection & Content Validation:
                # 1. Content validation
                if not raw_content:
                    return Response(
                        json.dumps({"success": False, "error": "留言内容不能为空"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )
                if len(raw_content) > 500:
                    return Response(
                        json.dumps({"success": False, "error": "留言过长，请控制在 500 字符以内"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )
                if len(raw_content) < 2:
                    return Response(
                        json.dumps({"success": False, "error": "留言内容过短，请至少输入 2 个字符"}, ensure_ascii=False),
                        status=400,
                        headers=cors_headers
                    )

                # 2. Nickname & Contact validation
                if not raw_nickname:
                    raw_nickname = "神秘访客"
                elif len(raw_nickname) > 32:
                    raw_nickname = raw_nickname[:32]

                if len(raw_contact) > 64:
                    raw_contact = raw_contact[:64]

                # 3. Anti-XSS Sanitization (HTML Escaping)
                clean_nickname = html.escape(raw_nickname, quote=True)
                clean_contact = html.escape(raw_contact, quote=True)
                clean_content = html.escape(raw_content, quote=True)

                # Strip zero-width and potentially malicious control bytes
                clean_content = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', clean_content)

                # 4. Extract Client IP & User Agent for rate limiting and verification
                client_ip = ""
                user_agent = ""
                try:
                    client_ip = request.headers.get("cf-connecting-ip") or request.headers.get("x-real-ip") or ""
                    user_agent = request.headers.get("user-agent") or ""
                except Exception:
                    pass

                # 5. Cloudflare Turnstile Server-side Verification
                turnstile_secret = getattr(self.env, "TURNSTILE_SECRET_KEY", None)
                if not turnstile_secret:
                    return Response(
                        json.dumps({"success": False, "error": "服务端未配置 TURNSTILE_SECRET_KEY 密钥"}, ensure_ascii=False),
                        status=500,
                        headers=cors_headers
                    )

                verify_payload = {
                    "secret": str(turnstile_secret),
                    "response": str(turnstile_token)
                }
                if client_ip:
                    verify_payload["remoteip"] = str(client_ip)

                try:
                    verify_opts = Object.fromEntries([
                        ("method", "POST"),
                        ("headers", Object.fromEntries([
                            ("Content-Type", "application/json")
                        ])),
                        ("body", json.dumps(verify_payload))
                    ])
                    verify_res = await fetch(
                        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                        verify_opts
                    )
                    verify_text = await verify_res.text()
                    verify_data = json.loads(str(verify_text))
                    if not verify_data.get("success"):
                        error_codes = verify_data.get("error-codes", [])
                        return Response(
                            json.dumps({
                                "success": False,
                                "error": "人机安全验证未通过，请重新验证",
                                "error_codes": error_codes
                            }, ensure_ascii=False),
                            status=403,
                            headers=cors_headers
                        )
                except Exception as verify_err:
                    return Response(
                        json.dumps({"success": False, "error": f"安全验证服务通信异常: {str(verify_err)}"}, ensure_ascii=False),
                        status=502,
                        headers=cors_headers
                    )

                # 6. Rate Limiting Protection (Anti-Spam Flooding: 15s per IP)
                if client_ip:
                    try:
                        check_stmt = self.env.DB.prepare(
                            "SELECT id FROM guestbook WHERE ip = ? AND datetime(created_at) > datetime('now', '-15 seconds') LIMIT 1"
                        ).bind(client_ip)
                        recent = await check_stmt.first()
                        if recent:
                            return Response(
                                json.dumps({"success": False, "error": "发言太快了，请稍候 15 秒后再试哦~"}, ensure_ascii=False),
                                status=429,
                                headers=cors_headers
                            )
                    except Exception:
                        pass

                # 7. Strictly Parameterized SQL INSERT (Defense against SQL Injection)
                # Ensure table exists
                await self.env.DB.prepare("""
                    CREATE TABLE IF NOT EXISTS guestbook (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nickname TEXT NOT NULL,
                        contact TEXT DEFAULT '',
                        content TEXT NOT NULL,
                        ip TEXT DEFAULT '',
                        user_agent TEXT DEFAULT '',
                        is_approved INTEGER DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """).run()

                insert_stmt = self.env.DB.prepare(
                    "INSERT INTO guestbook (nickname, contact, content, ip, user_agent, is_approved) VALUES (?, ?, ?, ?, ?, ?)"
                ).bind(clean_nickname, clean_contact, clean_content, client_ip[:45], user_agent[:200], 1)

                await insert_stmt.run()

                return Response(
                    json.dumps({
                        "success": True,
                        "message": "留言发表成功！",
                        "data": {
                            "nickname": clean_nickname,
                            "contact": clean_contact,
                            "content": clean_content
                        }
                    }, ensure_ascii=False),
                    status=201,
                    headers=cors_headers
                )

            else:
                return Response(
                    json.dumps({"success": False, "error": f"Method {method} not allowed"}, ensure_ascii=False),
                    status=405,
                    headers=cors_headers
                )

        except BaseException as e:
            import traceback
            tb = traceback.format_exc()
            return Response(
                json.dumps({
                    "success": False,
                    "error": f"Server Error: {str(e)}",
                    "traceback": tb
                }, ensure_ascii=False),
                status=500,
                headers=cors_headers
            )
