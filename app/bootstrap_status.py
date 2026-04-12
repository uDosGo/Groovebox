from __future__ import annotations

import os
import shutil
from pathlib import Path

from app.songscribe import songscribe_status


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def bootstrap_status(repo_root: Path | None = None) -> dict[str, object]:
    root = repo_root or _repo_root()
    song = songscribe_status(root)
    compose_path = root / "containers" / "songscribe" / "docker-compose.yml"
    docker_cli = shutil.which("docker") is not None
    launch = os.environ.get("GROOVEBOX_SONGSCRIBE_DOCKER_STATUS", "").strip()
    hint = os.environ.get("GROOVEBOX_SONGSCRIBE_HINT", "").strip()
    return {
        "songscribe": song,
        "docker": {
            "cli_on_path": docker_cli,
            "compose_file_exists": compose_path.is_file(),
        },
        "groovebox_startup": {
            "docker_launch_status": launch,
            "hint": hint,
        },
    }
