#!/usr/bin/env bash
# 一键部署 / 更新脚本。首次跑会装 systemd 单元；之后每次跑都是
# git pull → npm ci → next build → restart service。
#
# 用法（在 ECS 上）：
#   cd /opt/page
#   ./deploy.sh

set -euo pipefail

APP_DIR=/opt/page
SERVICE=page
PORT=9999
LOG_FILE=/var/log/page.log
UNIT_FILE="/etc/systemd/system/$SERVICE.service"

cd "$APP_DIR"

# ---------- 1. 前置检查 ----------
[ "$(id -u)" -eq 0 ] || { echo "ERROR: 请用 root 跑（首次部署需要写 systemd 单元）"; exit 1; }

command -v node >/dev/null || { echo "ERROR: 未装 Node.js"; exit 1; }
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_MAJOR" -ge 20 ] || { echo "ERROR: 需要 Node.js >= 20，当前 $(node -v)"; exit 1; }

# 内存提醒（2GB 机器跑 next build 没 swap 大概率 OOM）
TOTAL_MB=$(free -m | awk '/^Mem:/{print $2}')
SWAP_MB=$(free -m | awk '/^Swap:/{print $2}')
if [ "$TOTAL_MB" -lt 3500 ] && [ "$SWAP_MB" -lt 2000 ]; then
  echo "WARN: 内存 ${TOTAL_MB}MB + swap ${SWAP_MB}MB 偏低，next build 可能 OOM。"
  echo "      建议先开 swap：fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
fi

# ---------- 2. 用国内 npm 镜像（仅本进程，不污染全局） ----------
export npm_config_registry=https://registry.npmmirror.com

# ---------- 3. 拉最新代码 ----------
if [ -d .git ]; then
  echo "==> git pull"
  git pull --ff-only
fi

# ---------- 4. 装依赖（包含 dev，build 需要） ----------
echo "==> npm ci"
npm ci

# ---------- 5. build ----------
echo "==> npm run build"
npm run build

# ---------- 6. standalone 模式下，手动把 static / public 拷到产物目录 ----------
echo "==> copy public + .next/static into .next/standalone"
rm -rf .next/standalone/public .next/standalone/.next/static
cp -r public .next/standalone/ 2>/dev/null || true
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

# ---------- 7. 首次部署：安装 systemd 单元 ----------
if [ ! -f "$UNIT_FILE" ]; then
  echo "==> install systemd unit at $UNIT_FILE"
  cat > "$UNIT_FILE" <<EOF
[Unit]
Description=Page · 石子凡个人作品集 (Next.js standalone)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOSTNAME=0.0.0.0
ExecStart=/usr/bin/node $APP_DIR/.next/standalone/server.js
Restart=always
RestartSec=5
StandardOutput=append:$LOG_FILE
StandardError=append:$LOG_FILE

[Install]
WantedBy=multi-user.target
EOF
  touch "$LOG_FILE"
  systemctl daemon-reload
  systemctl enable "$SERVICE"
fi

# ---------- 8. 启动 / 重启 ----------
echo "==> systemctl restart $SERVICE"
systemctl restart "$SERVICE"

# ---------- 9. 健康检查 ----------
echo "==> waiting for /api/health (up to 30s)..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
    PUBLIC_IP=$(curl -fsS --max-time 2 https://api.ipify.org 2>/dev/null || echo "<your-public-ip>")
    echo ""
    echo "✓ Service is up"
    echo "  Local:  http://127.0.0.1:$PORT"
    echo "  Public: http://$PUBLIC_IP:$PORT  (确保安全组开放 $PORT)"
    echo ""
    echo "  Logs:    tail -f $LOG_FILE"
    echo "  Status:  systemctl status $SERVICE"
    echo "  Restart: systemctl restart $SERVICE"
    exit 0
  fi
  sleep 1
done

echo "✗ Service did not become healthy within 30s"
echo "  journalctl -u $SERVICE -n 100 --no-pager"
echo "  tail -100 $LOG_FILE"
exit 1
