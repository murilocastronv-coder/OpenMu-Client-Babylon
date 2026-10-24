# Forgotten Lands — real multiplayer backend

This folder prepares the **actual OpenMU server**, not a fake multiplayer simulation. The game server and PostgreSQL must run on a Linux VPS because Render Web Services do not expose the arbitrary public TCP ports that OpenMU needs.

## 1. Start the server

Provision Ubuntu 22.04+ or Debian 12+ with at least 4 GB RAM and 30 GB disk. Point a terminal at the VPS and run from the repository root:

```bash
sudo bash server/install-vps.sh
```

The official installer configures OpenMU, PostgreSQL, the WebSocket-to-TCP proxy, registration, and the web/admin services. Follow its prompts and create your own passwords. Never commit passwords or database URLs to GitHub.

Official setup documentation: https://github.com/Ignies/OpenMu-Client-Babylon#installing-your-own-server

## 2. Configure OpenMU

After setup, use `mu status` and `mu logs`. In the admin panel, initialize the database for **Season 6 Episode 3**, create at least one game server, and start the connect server plus a game server. The server's public endpoint resolver must advertise the VPS public host/IP, not loopback. The default OpenMU ports for this client are ConnectServer `44406` and GameServer `45901`; confirm the actual ports in the admin panel.

Official OpenMU port reference: https://openmu-docs.munique.net/reference/ports/

## 3. Connect the Render client gateway

On the Render **gateway** service, configure:

- `OPENMU_HOST`: the public DNS name or IP of the VPS, without protocol or port.
- `GATEWAY_HOST`: the public Render hostname, without `https://` (for example `openmu-mobile-test.onrender.com`).
- `ALLOW_TARGETS`: exact allowed targets, at minimum `OPENMU_HOST:44406,OPENMU_HOST:45901` with the real host substituted.

Do not use a wildcard or leave `ALLOW_TARGETS` empty on a public proxy. The gateway's Docker build uses `OPENMU_HOST` and `GATEWAY_HOST` to generate the client server list. Rebuild the gateway after changing either build argument.

The VPS firewall must allow the gateway to reach the configured OpenMU TCP ports. Keep PostgreSQL private. The connect server must advertise the public VPS address for the game server; otherwise players will disconnect after choosing the channel.

## 4. Verify multiplayer

1. Open the Render client and log in with a newly created account.
2. Create a character and enter the world.
3. Log in from a second browser/device with another account.
4. Confirm both characters are visible on the same map.
5. Restart the VPS and confirm characters/accounts remain saved.

**Status:** these files are committed as deployment preparation. The backend is not live until the installer has been run on a VPS with a reachable public address and the Render gateway has been built with that address.
