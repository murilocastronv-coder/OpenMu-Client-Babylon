# Experimental Render gateway (client + WebSocket proxy)

This is a **test profile**, isolated in the `render-experimental-single-service` branch. It does not change the default branch or the existing Render service.

## What this profile runs

- Babylon browser client, served over Render's HTTP port (default 10000).
- The repository's Bun WebSocket-to-TCP proxy, privately bound to port 3001.
- Caddy routes `/ws` and `/server.json` to the proxy and serves the static client.
- The proxy refuses to start unless `ALLOW_TARGETS` is explicitly configured, to avoid creating a public open TCP relay.

## The real OpenMU server

The backend setup files are in [`server/`](../server/README.md). The backend installer starts the official OpenMU stack with PostgreSQL on a Linux VPS. Render Web Services are not suitable for exposing the arbitrary public TCP ports used by the OpenMU game servers, so this gateway must connect to a reachable backend host.

The official OpenMU client stack recommends Ubuntu 22.04+/Debian 12+, at least 4 GB RAM and 30 GB disk. See the [official installer guide](https://github.com/Ignies/OpenMu-Client-Babylon#installing-your-own-server).

## Deploy this gateway as a separate test service

1. In Render, create a **new** Web Service from this repository.
2. Select branch `render-experimental-single-service`.
3. Choose **Docker** runtime and Dockerfile path `render/Dockerfile`.
4. Set the following environment variables. The first two are also read during the Docker build:
   - `OPENMU_HOST`: public DNS name or IP of your OpenMU VPS, with no scheme or port.
   - `GATEWAY_HOST`: the public Render hostname, with no `https://` (for example `openmu-mobile-test.onrender.com`).
   - `ALLOW_TARGETS`: exact allowed OpenMU host/port targets, for example `mu.example.net:44406,mu.example.net:45901`. Replace the example host with your actual host.
5. Deploy the new service. Do not change or delete the current service until the test is verified.

The Docker build deliberately fails if `OPENMU_HOST` or `GATEWAY_HOST` is missing, rather than shipping a client with a fake server address. The generated client server list uses `wss://GATEWAY_HOST/ws` and ConnectServer port `44406`. Confirm the actual ports in your OpenMU admin panel before deployment.

## Important OpenMU configuration

- In the OpenMU admin panel, initialize the database for Season 6 Episode 3, create at least one game server, and start the ConnectServer and a GameServer.
- Configure OpenMU's endpoint/IP resolver to advertise the VPS's public hostname/IP, not loopback.
- The standard fresh OpenMU ports are ConnectServer `44406` for this open-source client and GameServer `45901`. Existing databases may retain older ports. See the [official ports reference](https://openmu-docs.munique.net/reference/ports/).
- Ensure the VPS firewall allows the gateway to reach every configured ConnectServer/GameServer target. Keep PostgreSQL private.

## What is not included in the gateway

This service does not run OpenMU, PostgreSQL, account registration, cash shop, marketplace or the admin backend. Those are part of the separate backend installer. Proxy tracking defaults to memory in this test profile and resets on restart.

## Validation checklist

- [ ] OpenMU and PostgreSQL report healthy on the VPS.
- [ ] The client server list shows Forgotten Lands.
- [ ] One player can log in and enter the world.
- [ ] A second independent browser/device can log in at the same time.
- [ ] Both players can see each other on the same map.
- [ ] Account/character data persists after backend restart.

**Status:** deployment files have been committed, but neither the backend nor this gateway has been deployed/validated yet. A real VPS public address is required to wire the client and proxy to the backend.
