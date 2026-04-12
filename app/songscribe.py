from __future__ import annotations

import socket
import subprocess
from pathlib import Path


def songscribe_status(repo_root: Path) -> dict[str, object]:
    container_root = repo_root / "containers" / "songscribe"
    repo_path = container_root / "repo"
    compose_path = container_root / "docker-compose.yml"
    manifest_path = container_root / "container.json"

    commit = None
    if repo_path.exists():
        try:
            commit = (
                subprocess.run(
                    ["git", "-C", str(repo_path), "rev-parse", "--short", "HEAD"],
                    check=True,
                    capture_output=True,
                    text=True,
                )
                .stdout.strip()
            )
        except Exception:
            commit = None

    running = False
    try:
        with socket.create_connection(("127.0.0.1", 3000), timeout=0.5):
            running = True
    except OSError:
        running = False

    return {
        "configured": manifest_path.exists() and compose_path.exists(),
        "cloned": repo_path.exists(),
        "running": running,
        "repo_path": str(repo_path),
        "compose_path": str(compose_path),
        "commit": commit,
        "upstream": "https://github.com/gabe-serna/songscribe",
        "container_service": "songscribe",
        "browser_url": "http://127.0.0.1:3000",
    }
