#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/containers/songscribe/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "verify-songscribe-compose-compat: missing compose file" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "verify-songscribe-compose-compat: skipped (docker CLI not installed)"
  exit 0
fi

if docker compose -f "$COMPOSE_FILE" config >/dev/null 2>&1; then
  echo "verify-songscribe-compose-compat: OK"
  exit 0
fi

echo "verify-songscribe-compose-compat: docker compose config failed" >&2
exit 1
