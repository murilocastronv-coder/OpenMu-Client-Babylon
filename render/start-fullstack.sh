#!/usr/bin/env bash
set -euo pipefail

: "${PORT:=10000}"
: "${PROXY_PORT:=3001}"
: "${OPENMU_HTTP_PORT:=8080}"
: "${DB_MODE:=demo}"
: "${RESOLVE_IP:=127.127.127.127}"

export ASPNETCORE_URLS="http://+:$OPENMU_HTTP_PORT"
export RESOLVE_IP
export PORT="$PROXY_PORT"
export HOSTNAME=127.0.0.1
export PRESENCE_PORT=3002
export PRESENCE_HOST=127.0.0.1
export TRACK_DB_PATH="${TRACK_DB_PATH:-memory}"
export ADMIN_OPEN=off
export ADMIN_DEMO=off

if [[ "$DB_MODE" == "postgres" ]]; then
  : "${DB_HOST:?Set DB_HOST for persistent PostgreSQL mode}"
  : "${DB_ADMIN_USER:?Set DB_ADMIN_USER for persistent PostgreSQL mode}"
  : "${DB_ADMIN_PW:?Set DB_ADMIN_PW for persistent PostgreSQL mode}"
  OPENMU_ARGS=(-autostart)
else
  echo "WARNING: DB_MODE=demo. Multiplayer is live, but accounts and progress reset when the service restarts."
  OPENMU_ARGS=(-demo -autostart)
fi

# Keep the public relay pinned to only the OpenMU game ports in this same container.
export ALLOW_TARGETS="127.0.0.1:44406,127.0.0.1:45901,127.0.0.1:45902,127.0.0.1:45903,127.0.0.1:45904,127.0.0.1:45905,127.0.0.1:45906"

(cd /openmu && dotnet /openmu/MUnique.OpenMU.Startup.dll "${OPENMU_ARGS[@]}") &
OPENMU_PID=$!
PROXY_PID=""

cleanup() {
  kill "$OPENMU_PID" ${PROXY_PID:+"$PROXY_PID"} 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give OpenMU a moment to initialize its listeners before starting the relay.
sleep 8
bun run /client/proxy/main.ts &
PROXY_PID=$!

export CADDY_PORT="${PUBLIC_PORT:-10000}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
