#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

python3 - <<'PY'
from unittest import mock

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# Simulate a host without docker while ensuring local runtime path is still usable.
with mock.patch("app.songscribe_docker.docker_cli_available", return_value=False):
    docker_info = client.get("/api/songscribe/docker")
    if docker_info.status_code != 200:
        raise SystemExit("GET /api/songscribe/docker must return 200")
    docker_payload = docker_info.json()
    if docker_payload.get("docker_cli") is not False:
        raise SystemExit("docker_cli must be false in simulated no-docker check")

with mock.patch.dict("os.environ", {"GROOVEBOX_DOCKER_CONTROL": "0"}, clear=False):
    with mock.patch("app.main.songscribe_runtime_start", return_value={"ok": True, "runtime_mode": "local", "status": "accepted"}):
        local_start = client.post("/api/songscribe/runtime/start?mode=local")
        if local_start.status_code != 200:
            raise SystemExit("local runtime start must be available without docker")
        if not local_start.json().get("ok"):
            raise SystemExit("local runtime start must report ok=true")

    docker_start = client.post("/api/songscribe/runtime/start?mode=docker")
    if docker_start.status_code != 403:
        raise SystemExit("docker runtime mode must remain explicit opt-in (403 when disabled)")

print("verify-songscribe-runtime-non-docker: OK")
PY
