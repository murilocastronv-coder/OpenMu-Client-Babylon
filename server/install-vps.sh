#!/usr/bin/env bash
set -Eeuo pipefail

# Installs the official OpenMU Client Babylon stack on a Linux VPS.
# Run as root on Ubuntu 22.04+/Debian 12+ with at least 4 GB RAM and 30 GB disk.
if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root: sudo bash server/install-vps.sh" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates
fi

echo "Installing the official OpenMU stack (OpenMU + PostgreSQL + WebSocket proxy + web services)."
echo "The installer will ask you to set passwords. Do not reuse public passwords."
exec bash -c 'curl -fsSL https://raw.githubusercontent.com/Ignies/OpenMu-Client-Babylon/main/install/get.sh | bash'
