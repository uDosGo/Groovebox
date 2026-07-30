from __future__ import annotations

from pathlib import Path

from app.spool_writer import write_spool_event


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _export_root() -> Path:
    return _repo_root() / "sessions" / "exports"


def save_export_file(name: str, content: bytes) -> dict[str, object]:
    root = _export_root()
    root.mkdir(parents=True, exist_ok=True)
    path = root / name
    path.write_bytes(content)
    result = {
        "path": str(path.relative_to(_repo_root())),
        "bytes_written": len(content),
    }
    write_spool_event(
        module="export",
        level="info",
        message=f"Exported {name} ({len(content)} bytes)",
        tags=["export", name.split(".")[-1] if "." in name else "file"],
    )
    return result
