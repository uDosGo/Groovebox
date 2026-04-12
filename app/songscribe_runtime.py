from __future__ import annotations

import os
import signal
import socket
import subprocess
import time
from pathlib import Path

from app.songscribe_docker import songscribe_docker_start, songscribe_docker_stop


def _state_dir(root: Path) -> Path:
    return root / "sessions" / "runtime"


def _pid_file(root: Path) -> Path:
    return _state_dir(root) / "songscribe-local.pid"


def _log_file(root: Path) -> Path:
    return _state_dir(root) / "songscribe-local.log"


def _songscribe_repo(root: Path) -> Path:
    return root / "containers" / "songscribe" / "repo"


def _songscribe_runner(root: Path) -> Path:
    return root / "scripts" / "run-songscribe-ui.sh"


def _local_control_enabled() -> bool:
    return os.environ.get("GROOVEBOX_LOCAL_SONGSCRIBE_CONTROL", "1").strip().lower() not in ("0", "false", "no", "off")


def _runtime_mode() -> str:
    mode = os.environ.get("GROOVEBOX_SONGSCRIBE_RUNTIME_MODE", "local").strip().lower()
    if mode not in ("local", "docker", "auto"):
        return "local"
    return mode


def _is_port_open(port: int = 3000) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False


def _is_pid_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def _read_pid(path: Path) -> int | None:
    if not path.is_file():
        return None
    try:
        return int(path.read_text(encoding="utf-8").strip())
    except (ValueError, OSError):
        return None


def _write_pid(path: Path, pid: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{pid}\n", encoding="utf-8")


def _remove_pid(path: Path) -> None:
    try:
        path.unlink()
    except FileNotFoundError:
        pass


def songscribe_runtime_status(root: Path) -> dict[str, object]:
    pid_path = _pid_file(root)
    pid = _read_pid(pid_path)
    return {
        "preferred_mode": _runtime_mode(),
        "local_control_enabled": _local_control_enabled(),
        "songscribe_repo_exists": _songscribe_repo(root).is_dir(),
        "runner_exists": _songscribe_runner(root).is_file(),
        "local_pid": pid,
        "local_pid_running": bool(pid and _is_pid_running(pid)),
        "port_3000_open": _is_port_open(3000),
    }


def _start_local(root: Path) -> dict[str, object]:
    if not _local_control_enabled():
        return {"ok": False, "mode": "local", "status": "forbidden", "detail": "local control disabled"}

    if not _songscribe_repo(root).is_dir():
        return {"ok": False, "mode": "local", "status": "missing-repo", "detail": "songscribe repo missing"}
    runner = _songscribe_runner(root)
    if not runner.is_file():
        return {"ok": False, "mode": "local", "status": "missing-runner", "detail": "run-songscribe-ui.sh missing"}

    if _is_port_open(3000):
        return {"ok": True, "mode": "local", "status": "already-running", "detail": "port 3000 already open"}

    pid_path = _pid_file(root)
    log_path = _log_file(root)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("ab") as out:
        proc = subprocess.Popen(
            [str(runner)],
            cwd=str(root),
            stdout=out,
            stderr=out,
            start_new_session=True,
        )
    _write_pid(pid_path, proc.pid)

    # short wait for startup signal; if not ready yet we still return accepted
    for _ in range(6):
        if _is_port_open(3000):
            return {"ok": True, "mode": "local", "status": "started", "pid": proc.pid}
        time.sleep(0.5)

    return {"ok": True, "mode": "local", "status": "accepted", "pid": proc.pid, "detail": "startup pending"}


def _stop_local(root: Path) -> dict[str, object]:
    pid_path = _pid_file(root)
    pid = _read_pid(pid_path)
    if not pid:
        return {"ok": True, "mode": "local", "status": "not-running"}
    if not _is_pid_running(pid):
        _remove_pid(pid_path)
        return {"ok": True, "mode": "local", "status": "stale-pid-cleared", "pid": pid}
    os.kill(pid, signal.SIGTERM)
    _remove_pid(pid_path)
    return {"ok": True, "mode": "local", "status": "stopped", "pid": pid}


def songscribe_runtime_start(root: Path, mode: str | None = None) -> dict[str, object]:
    use_mode = (mode or _runtime_mode()).lower()
    if use_mode == "docker":
        result = songscribe_docker_start(root)
        return {"runtime_mode": "docker", **result}
    if use_mode == "auto":
        local = _start_local(root)
        if local.get("ok"):
            return {"runtime_mode": "local", **local}
        docker = songscribe_docker_start(root)
        return {"runtime_mode": "docker-fallback", "local_attempt": local, **docker}
    local = _start_local(root)
    return {"runtime_mode": "local", **local}


def songscribe_runtime_stop(root: Path, mode: str | None = None) -> dict[str, object]:
    use_mode = (mode or _runtime_mode()).lower()
    if use_mode == "docker":
        result = songscribe_docker_stop(root)
        return {"runtime_mode": "docker", **result}
    if use_mode == "auto":
        local = _stop_local(root)
        docker = songscribe_docker_stop(root)
        return {"runtime_mode": "auto", "local": local, "docker": docker, "ok": bool(local.get("ok")) and bool(docker.get("ok"))}
    local = _stop_local(root)
    return {"runtime_mode": "local", **local}
