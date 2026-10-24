# Experimental Render gateway for OpenMu-Client-Babylon.
# Hosts the browser client + WebSocket-to-TCP proxy. OpenMU/PostgreSQL run on a VPS.
FROM oven/bun:1.1.21 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# The app fetches this list at runtime; start.sh fills in the real backend hostname.
COPY render/serverlist.render.md /app/public/serverlist.md
RUN VITE_SERVER_LIST_URL=/serverlist.md bun run build

FROM oven/bun:1.1.21
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl gnupg debian-archive-keyring debian-keyring && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && \
    apt-get update && apt-get install -y --no-install-recommends caddy && \
    rm -rf /var/lib/apt/lists/*
COPY --from=build /app /app
COPY render/Caddyfile /etc/caddy/Caddyfile
COPY render/start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENV PORT=10000 CADDY_PORT=10000 HOSTNAME=127.0.0.1 PROXY_PORT=3001 TRACK_DB_PATH=memory
EXPOSE 10000
CMD ["/app/start.sh"]
