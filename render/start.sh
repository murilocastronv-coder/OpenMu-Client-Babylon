#!/usr/bin/env bash
set -euo pipefail

: "${PORT:=10000}"
: "${CADDY_PORT:=$PORT}"
: "${PROXY_PORT:=3001}"
: "${HOSTNAME:=127.0.0.1}"
: "${TRACK_DB_PATH:=memory}"

if [ -z "${OPENMU_HOST:-}" ]; then
  echo "FATAL: set OPENMU_HOST to the public DNS name/IP of the OpenMU VPS (without scheme or port)." >&2
  exit 1
fi
if [ -z "${GATEWAY_HOST:-}" ]; then
  echo "FATAL: set GATEWAY_HOST to this Render service's public hostname (without https://)." >&2
  exit 1
fi
if [ -z "${ALLOW_TARGETS:-}" ]; then
  echo "FATAL: ALLOW_TARGETS must list only trusted OpenMU host:port targets; refusing to start an open TCP relay." >&2
  exit 1
fi

case "$OPENMU_HOST" in *://*|*/*|*:* )
  echo "FATAL: OPENMU_HOST must be a bare DNS name or IPv4 address, without scheme, path or port." >&2
  exit 1
esac
case "$GATEWAY_HOST" in *://*|*/*|*:* )
  echo "FATAL: GATEWAY_HOST must be a bare Render hostname, without scheme, path or port." >&2
  exit 1
esac

# Generate the browser's server list from runtime environment variables.
sed -e "s/OPENMU_HOST/$OPENMU_HOST/g" -e "s/GATEWAY_HOST/$GATEWAY_HOST/g" \
  /app/render/serverlist.render.md > /app/dist/serverlist.md

export CADDY_PORT
export PORT="$PROXY_PORT"
export HOSTNAME="$HOSTNAME"
export TRACK_DB_PATH
export ADMIN_OPEN=off
export ADMIN_DEMO=off

bun run proxy &
PROXY_PID=$!

cleanup() {
  kill "$PROXY_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for the proxy to bind before accepting public requests.
for i in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:$PROXY_PORT/server.json" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    wait "$PROXY_PID"
    exit 1
  fi
  sleep 1
done

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
