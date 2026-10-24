# Experimental single-service OpenMU multiplayer deployment

This image is intended to make a first multiplayer test possible in one Render Web Service:
- Babylon browser client at `/`
- WebSocket-to-TCP gateway at `/ws`
- OpenMU game process and its TCP listeners in the same container
- OpenMU admin/API routes forwarded to port 8080

## Render configuration

Create a **new** Web Service from branch `render-experimental-single-service`:
- Runtime: Docker
- Dockerfile: `render/Dockerfile-fullstack`
- Region: Frankfurt
- Health check path: `/healthz`
- Public HTTP port: Render's `PORT` (default 10000)

Start with `DB_MODE=demo` for a live multiplayer smoke test. Demo mode is in-memory: accounts and progress reset after restarts. For persistent gameplay, configure `DB_MODE=postgres`, `DB_HOST`, `DB_ADMIN_USER`, and `DB_ADMIN_PW` to a PostgreSQL instance. Do not commit database credentials to GitHub.

## Client server list

The client entry is configured for the public service URL `https://openmu-multiplayer.onrender.com` and a loopback target reached only through the pinned WebSocket proxy. If Render assigns a different hostname, update the target URL in `serverlist.md` before building.

## Important constraints

Render's account service limit can prevent creation of another service. If that happens, this repository branch is prepared but no deploy is running; free services may also sleep or have resource limits. The current production service is not changed by this experiment.

## Smoke test

1. Wait for `/healthz` to return `ok`.
2. Open the game and use a test account available in OpenMU demo mode.
3. Log in from two separate browsers/devices.
4. Confirm both characters can enter the same map and see each other.
5. Restart the service and confirm the demo warning: demo progress is not persistent.
