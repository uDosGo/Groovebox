"""
spool_writer.py — Lightweight spool event logger for Groovebox.
Writes uCore-compatible spool events to sessions/spool/ directory.
Matches uCore SPOOL_SPEC shape: {timestamp, module, level, message, tags}.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _spool_dir() -> Path:
    d = _repo_root() / "sessions" / "spool"
    d.mkdir(parents=True, exist_ok=True)
    return d


def write_spool_event(
    module: str,
    level: str,
    message: str,
    tags: list[str] | None = None,
) -> dict[str, object]:
    """
    Write a spool event in uCore-compatible format.
    Events are appended to sessions/spool/groovebox-events.jsonl.
    """
    event: dict[str, object] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "module": module,
        "level": level,
        "message": message,
        "tags": list(tags or []),
    }
    spool_file = _spool_dir() / "groovebox-events.jsonl"
    with spool_file.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")
    return event


def read_spool_events(limit: int = 50) -> list[dict[str, object]]:
    """
    Read the most recent spool events (newest last).
    Returns up to `limit` events.
    """
    spool_file = _spool_dir() / "groovebox-events.jsonl"
    if not spool_file.is_file():
        return []
    lines = spool_file.read_text(encoding="utf-8").strip().splitlines()
    events = []
    for line in lines[-limit:]:
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events