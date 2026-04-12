#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

python3 - <<'PY'
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

checks = [
    ("/api/health", {"status", "service"}),
    ("/api/bootstrap/status", {"songscribe", "docker", "groovebox_startup"}),
    ("/api/songscribe/status", {"configured", "cloned", "running", "browser_url"}),
    ("/api/songscribe/docker", {"compose_exists", "docker_cli", "can_control"}),
]

for route, required in checks:
    response = client.get(route)
    if response.status_code != 200:
        raise SystemExit(f"{route} status_code={response.status_code} (expected 200)")
    payload = response.json()
    missing = sorted(required - payload.keys())
    if missing:
        raise SystemExit(f"{route} missing required fields: {missing}")

print("verify-songscribe-health-probes: OK")
PY
