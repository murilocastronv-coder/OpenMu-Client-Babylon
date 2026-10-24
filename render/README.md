# Experimental Render gateway (client + WebSocket proxy)

This is a **test profile**, isolated in the `render-experimental-single-service` branch. It does not change the existing Render service or the default branch.

## What this profile runs

- Babylon browser client, built from this repository and served over HTTP on Render's `PORT` (default 10000).
- The repository's Bun WebSocket-to-TCP proxy, privately bound to port 3001.
- Caddy routes `/ws` and `/server.json` to the proxy and serves the static client.
- The proxy refuses to start unless `ALLOW_TARGETS` is explicitly configured, to avoid creating a public open TCP relay.

## Important: this is not the complete MU server

Render Web Services expose HTTP/HTTPS and WebSocket traffic on the assigned HTTP port. They do not expose arbitrary public TCP/UDP game ports like a VPS. This image therefore **does not run OpenMU or PostgreSQL inside this container**. It needs a reachable OpenMU ConnectServer/GameServer endpoint and a PostgreSQL database hosted separately. OpenMU must be configured to advertise addresses and ports that the proxy can actually reach. Do not point the client directly at an internal-only address.

The upstream all-in-one installer uses multiple services (PostgreSQL, OpenMU, proxy, registration, shop, marketplace, admin/web) and recommends at least 4 GB RAM and 30 GB disk. A 2 GB Render service is not a supported or reliable place to collapse that entire stack into one process/container. The registration site and full admin/shop services are not provided by this gateway image.

## Deploy as a separate test service

1. In Render, create a **new** Web Service from this repository.
2. Select branch `render-experimental-single-service`.
3. Choose **Docker** runtime and Dockerfile path `render/Dockerfile`.
4. Use at least the 2 GB plan for a basic gateway test; this is not a capacity guarantee for a full MU world.
5. Add environment variable `ALLOW_TARGETS` with a comma-separated allowlist of the exact host:port pairs the proxy is allowed to dial. Example: `203.0.113.10:44405,203.0.113.10:55901`. Replace the documentation IP with your real reachable server addresses. Never use `0.0.0.0`, wildcards, or arbitrary target rules.
6. Deploy the new test service. Do not change or delete the current service until the test is verified.

## Connect the client to the proxy

The server list entry uses this format (replace the example address and Render hostname):

```text
[S6EP3:Forgotten Lands:Browser MU server:en](203.0.113.10:44405@wss://YOUR-TEST-SERVICE.onrender.com/ws)
- 0: Forgotten Lands
  - 0: Channel 1
```

The host/port before `@` is the OpenMU ConnectServer address as reachable by the proxy, not the Render web-service address. GameServer addresses sent back by OpenMU must also be reachable and allowlisted. The server list is part of the client build; configure it before building the client for your actual server. This branch deliberately does not guess your server IP, ports, database URL, or credentials.

## Database, registration, admin and persistence

- Keep PostgreSQL on a separate managed database or alongside OpenMU on a VPS; do not put database passwords in Git.
- The proxy's tracking journal defaults to memory in this profile and resets on restart.
- This profile does not create accounts, provision GM permissions, or install OpenMU migrations. Those are provided by the upstream multi-service installer and must be configured against the same OpenMU database.
- Use Render environment variables for secrets. Do not commit passwords, tokens, or production connection strings.

## Multiplayer backend

See [MULTIPLAYER-SERVER.md](./MULTIPLAYER-SERVER.md) for the real OpenMU + PostgreSQL topology, setup steps, and multiplayer validation checklist.

## Why the full stack is not in this Dockerfile

The upstream setup uses Docker Compose, an OpenMU release image and plugins, PostgreSQL, several Bun services, and Caddy. Render deploys a Dockerfile as one service and does not provide Compose networking or public arbitrary game ports for a Web Service. Running PostgreSQL plus OpenMU plus all web services inside a single 2 GB container would be fragile and would still not solve public TCP/UDP exposure. For a real public multiplayer server, keep the browser gateway on Render and run OpenMU + PostgreSQL on a VPS with at least 4 GB RAM, or use the upstream installer on that VPS.
