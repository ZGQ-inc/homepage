@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ==================================================
echo   Cloudflare D1 留言板数据库初始化与 Worker 部署
echo ==================================================
echo.

set WORKER_DIR=%~dp0

echo [1/4] 安装依赖...
cd "%WORKER_DIR%"
call npm install
echo.

echo [2/4] 创建 D1 数据库 homepage-db ...
call npx wrangler d1 create homepage-db
echo.

echo [3/4] 初始化数据库表结构 (schema.sql) ...
call npx wrangler d1 execute homepage-db --file="%WORKER_DIR%schema.sql" --remote
echo.

echo [4/4] 部署 Python Worker ...
call npx wrangler deploy
echo.

echo 部署完成！请在 Cloudflare Dash 确认 Worker 状态。
pause
