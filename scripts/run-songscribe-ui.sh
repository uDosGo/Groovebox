#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SONGSCRIBE_ROOT="$REPO_ROOT/containers/songscribe/repo"
PORT="${PORT:-3000}"

if [ ! -f "$SONGSCRIBE_ROOT/package.json" ]; then
  echo "Songscribe repo missing. Run ./scripts/setup-songscribe.sh first." >&2
  exit 1
fi

cd "$SONGSCRIBE_ROOT"
npm install
npm run dev -- --hostname 127.0.0.1 --port "$PORT"
