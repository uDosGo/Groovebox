from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def songscribe_compose_file(root: Path | None = None) -> Path:
    r = root or _repo_root()
    return (r / "containers" / "songscribe" / "docker-compose.yml").resolve()


def docker_control_enabled() -> bool:
    return os.environ.get("GROOVEBOX_DOCKER_CONTROL", "0").strip().lower() not in ("0", "false", "no", "off")


def docker_cli_available() -> bool:
    return shutil.which("docker") is not None


def loopback_client_ok(host: str | None) -> bool:
    if not host:
        return False
    h = host.lower()
    if h in ("127.0.0.1", "::1", "localhost"):
        return True
    # Starlette / httpx TestClient
    if h == "testclient":
        return True
    return False


def _run_compose(root: Path, args: list[str], timeout: int = 120) -> subprocess.CompletedProcess[str]:
    compose_file = songscribe_compose_file(root)
    if not compose_file.is_file():
        raise FileNotFoundError("songscribe docker-compose.yml missing")
    try:
        compose_file.relative_to(root.resolve())
    except ValueError as exc:  # pragma: no cover - defensive
        raise RuntimeError("invalid compose path") from exc
    cmd = ["docker", "compose", "-f", str(compose_file), *args]
    return subprocess.run(
        cmd,
        cwd=str(root),
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def docker_status_payload(root: Path | None = None) -> dict[str, object]:
    r = root or _repo_root()
    cf = songscribe_compose_file(r)
    return {
        "control_enabled_env": docker_control_enabled(),
        "docker_cli": docker_cli_available(),
        "compose_file": str(cf.relative_to(r)) if cf.is_file() else None,
        "compose_exists": cf.is_file(),
    }


def songscribe_docker_start(root: Path | None = None) -> dict[str, object]:
    r = root or _repo_root()
    proc = _run_compose(r, ["up", "-d"], timeout=180)
    ok = proc.returncode == 0
    return {
        "ok": ok,
        "returncode": proc.returncode,
        "stdout": (proc.stdout or "")[-4000:],
        "stderr": (proc.stderr or "")[-4000:],
    }


def songscribe_docker_stop(root: Path | None = None) -> dict[str, object]:
    r = root or _repo_root()
    proc = _run_compose(r, ["stop"], timeout=120)
    ok = proc.returncode == 0
    return {
        "ok": ok,
        "returncode": proc.returncode,
        "stdout": (proc.stdout or "")[-4000:],
        "stderr": (proc.stderr or "")[-4000:],
    }


