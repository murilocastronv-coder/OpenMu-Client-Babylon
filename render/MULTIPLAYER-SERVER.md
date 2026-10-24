# Multiplayer backend for Render gateway

## Architecture

The Render gateway branch serves the Babylon client on the Render HTTP port and proxies WebSocket traffic to the OpenMU TCP endpoints. The game backend must be a real OpenMU installation; this repository already includes the upstream multi-service installer under `install/`.

Recommended topology for a public multiplayer game:

- **Render gateway:** client + WSS-to-TCP proxy (this branch's `render/Dockerfile`).
- **OpenMU backend:** the upstream OpenMU stack on a VPS with public/reachable ConnectServer and GameServer ports.
- **PostgreSQL:** the database managed by the OpenMU stack, persistent and private to that stack.
- **Registration/shop/admin:** deploy the upstream services together with OpenMU if those features are needed.

## Why OpenMU and PostgreSQL are not bundled into the Render web container

Render Web Services provide an HTTP/HTTPS entry point. A MU server uses additional game TCP ports and multiple cooperating services. Putting OpenMU, PostgreSQL, registration, cash shop, marketplace, admin, the proxy, and the browser app into a single 2 GB web-service container would be fragile, would lose database state without persistent storage, and does not automatically expose the game ports. The upstream installer documents a minimum of 4 GB RAM and 30 GB disk for the complete stack.

## Install the multiplayer backend on a VPS

Use a Linux VPS (Ubuntu 22.04+/Debian 12+) with at least 4 GB RAM and 30 GB disk. Run the upstream installer on that VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/Ignies/OpenMu-Client-Babylon/main/install/get.sh | sudo bash
```

The installer configures OpenMU, PostgreSQL, the proxy, registration, shop, admin, and the browser stack together. Create your own passwords during setup. Do not commit passwords or database URLs to GitHub.

After installation, run `mu status` and verify a test account can log in locally before pointing the public Render gateway at it.

## Connect the Render proxy to the backend

The proxy requires `ALLOW_TARGETS` to list exact `host:port` targets. Do not leave this variable empty and do not allow arbitrary hosts/ports. The host must be reachable from the Render gateway, and the allowlist must include every ConnectServer/GameServer target the client actually uses.

The client server-list entry must use the gateway's WSS URL, for example:

```text
[S6EP3:Your MU server:en](YOUR_CONNECT_SERVER_HOST:44405@wss://YOUR-GATEWAY.onrender.com/ws)
- 0: Your MU server
  - 0: Channel 1
```

Replace the example host with the real ConnectServer host. GameServer endpoints advertised during login must also be reachable by the proxy and included in the allowlist. Do not use documentation IPs as real addresses.

## Validation checklist

- [ ] OpenMU starts and PostgreSQL reports healthy on the backend host.
- [ ] The client can create an account and character.
- [ ] One player can log in through the Render WSS gateway.
- [ ] A second independent browser/device can log in at the same time.
- [ ] Both players can see each other in the same map.
- [ ] Restart the backend and confirm account/character data persists.
- [ ] Confirm the proxy rejects targets not explicitly allowlisted.

This guide does not claim that the multiplayer backend has been deployed or validated yet. It describes the supported split topology. Do not point production players at the test gateway until the checklist passes.
