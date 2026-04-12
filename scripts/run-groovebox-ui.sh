#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT="${PORT:-8766}"

cd "$REPO_ROOT"

MARKER_DIR="$REPO_ROOT/.groovebox-local"
FIRST_RUN_MARKER="$MARKER_DIR/first-run-complete"

if [ "${GROOVEBOX_SKIP_FIRST_RUN:-0}" != "1" ] && [ ! -f "$FIRST_RUN_MARKER" ]; then
  if ! mkdir -p "$MARKER_DIR" 2>/dev/null; then
    echo "Warning: could not create $MARKER_DIR — first-run marker skipped; Groovebox UI will still start." >&2
  fi
  if [ -d "$REPO_ROOT/containers/songscribe/repo/.git" ]; then
    touch "$FIRST_RUN_MARKER" 2>/dev/null || true
  else
    echo "" >&2
    echo "=== Groovebox first-run ===" >&2
    if bash "$REPO_ROOT/scripts/setup-groovebox-first-run.sh"; then
      touch "$FIRST_RUN_MARKER" 2>/dev/null || true
    else
      echo "First-run Songscribe setup failed (network/git). Fix and re-run, or run:" >&2
      echo "  bash scripts/setup-groovebox-first-run.sh" >&2
    fi
    echo "" >&2
  fi
fi

SONGSCRIBE_COMPOSE="$REPO_ROOT/containers/songscribe/docker-compose.yml"
export GROOVEBOX_SONGSCRIBE_DOCKER_STATUS=""
export GROOVEBOX_SONGSCRIBE_HINT=""

if [ "${GROOVEBOX_AUTO_SONGSCRIBE_DOCKER:-1}" != "0" ] && [ -f "$SONGSCRIBE_COMPOSE" ] && [ -d "$REPO_ROOT/containers/songscribe/repo/.git" ]; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    if docker compose -f "$SONGSCRIBE_COMPOSE" up -d >/dev/null 2>&1; then
      export GROOVEBOX_SONGSCRIBE_DOCKER_STATUS="ok"
    else
      export GROOVEBOX_SONGSCRIBE_DOCKER_STATUS="failed"
      export GROOVEBOX_SONGSCRIBE_HINT="Docker is available but Songscribe did not start. From uDOS-groovebox run: docker compose -f containers/songscribe/docker-compose.yml up"
    fi
  else
    export GROOVEBOX_SONGSCRIBE_DOCKER_STATUS="no_docker"
    export GROOVEBOX_SONGSCRIBE_HINT="Songscribe is not running. With Docker: docker compose -f containers/songscribe/docker-compose.yml up  — without Docker: bash scripts/run-songscribe-ui.sh"
  fi
else
  export GROOVEBOX_SONGSCRIBE_DOCKER_STATUS="skipped"
  if [ ! -d "$REPO_ROOT/containers/songscribe/repo/.git" ]; then
    export GROOVEBOX_SONGSCRIBE_HINT="Songscribe not cloned yet. Run: bash scripts/setup-groovebox-first-run.sh"
  fi
fi

if [ -d "$REPO_ROOT/containers/songscribe/repo/.git" ]; then
  if [ "${GROOVEBOX_SONGSCRIBE_DOCKER_STATUS}" != "ok" ] && [ -n "${GROOVEBOX_SONGSCRIBE_HINT}" ]; then
    echo "" >&2
    echo "=== Songscribe (optional UI on port 3000) ===" >&2
    echo "${GROOVEBOX_SONGSCRIBE_HINT}" >&2
    echo "" >&2
  fi
fi

python3 -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
