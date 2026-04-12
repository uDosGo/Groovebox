from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _session_root() -> Path:
    return _repo_root() / "sessions" / "compiled"


def list_sessions() -> list[dict[str, Any]]:
    root = _session_root()
    root.mkdir(parents=True, exist_ok=True)
    sessions = []
    for path in sorted(root.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        sessions.append(
            {
                "name": path.stem,
                "path": str(path.relative_to(_repo_root())),
                "title": payload.get("title", path.stem),
                "tempo": payload.get("tempo"),
                "saved_at": payload.get("saved_at"),
            }
        )
    return sessions


def save_session(name: str, pattern: dict[str, Any]) -> dict[str, Any]:
    root = _session_root()
    root.mkdir(parents=True, exist_ok=True)
    safe_name = "".join(char for char in name.lower().replace(" ", "-") if char.isalnum() or char in {"-", "_"}).strip("-") or "session"
    path = root / f"{safe_name}.json"
    payload = {
        **pattern,
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    return {
        "name": safe_name,
        "path": str(path.relative_to(_repo_root())),
        "saved_at": payload["saved_at"],
    }
