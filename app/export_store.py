from __future__ import annotations

from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _export_root() -> Path:
    return _repo_root() / "sessions" / "exports"


def save_export_file(name: str, content: bytes) -> dict[str, object]:
    root = _export_root()
    root.mkdir(parents=True, exist_ok=True)
    path = root / name
    path.write_bytes(content)
    return {
        "path": str(path.relative_to(_repo_root())),
        "bytes_written": len(content),
    }
