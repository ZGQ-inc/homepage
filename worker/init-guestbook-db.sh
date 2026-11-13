#!/usr/bin/env bash
set -e

echo "=== Cloudflare D1 留言板数据库初始化与 Worker 部署 ==="
WORKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WORKER_DIR"

echo "[1/4] 安装依赖..."
npm install

echo "[2/4] 创建 D1 数据库 homepage-db ..."
npx wrangler d1 create homepage-db || true

echo "[3/4] 初始化数据库表结构 (schema.sql) ..."
npx wrangler d1 execute homepage-db --file="$WORKER_DIR/schema.sql" --remote || true

echo "[4/4] 部署 Python Worker ..."
npx wrangler deploy

echo "部署完成！"
