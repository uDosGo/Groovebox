from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _seed_pattern_sources() -> list[Path]:
    return sorted((_repo_root() / "examples").glob("*.json"))


def _session_pattern_root() -> Path:
    return _repo_root() / "sessions" / "patterns"


def _session_pattern_sources() -> list[Path]:
    root = _session_pattern_root()
    root.mkdir(parents=True, exist_ok=True)
    return sorted(root.glob("*.json"))


def _pattern_summary(payload: dict[str, Any], path: Path, scope: str) -> dict[str, Any]:
    tracks = payload.get("tracks", [])
    return {
        "pattern_id": payload["pattern_id"],
        "name": payload.get("name") or payload["pattern_id"],
        "tempo": payload.get("tempo"),
        "track_count": len(tracks) if isinstance(tracks, list) else None,
        "available": True,
        "document_path": str(path.relative_to(_repo_root())),
        "scope": scope,
    }


def _load_documents() -> dict[str, dict[str, Any]]:
    documents: dict[str, dict[str, Any]] = {}
    for path in _seed_pattern_sources():
        payload = _load_json(path)
        pattern_id = payload.get("pattern_id")
        if not pattern_id:
            continue
        documents[pattern_id] = {
            **payload,
            "path": str(path.relative_to(_repo_root())),
            "scope": "seed",
        }
    for path in _session_pattern_sources():
        payload = _load_json(path)
        pattern_id = payload.get("pattern_id")
        if not pattern_id:
            continue
        documents[pattern_id] = {
            **payload,
            "path": str(path.relative_to(_repo_root())),
            "scope": "session",
        }
    return documents


def load_library() -> dict[str, Any]:
    library_path = _repo_root() / "src" / "pattern-library.json"
    library = _load_json(library_path)
    documents = _load_documents()

    patterns: list[dict[str, Any]] = []
    seen: set[str] = set()
    for pattern in library.get("patterns", []):
        pattern_id = pattern["pattern_id"]
        seen.add(pattern_id)
        document = documents.get(pattern_id)
        summary = {
            **pattern,
            "available": document is not None,
            "document_path": document.get("path") if document else None,
            "scope": document.get("scope") if document else "seed",
        }
        if document and isinstance(document.get("tracks"), list):
            summary["track_count"] = len(document["tracks"])
            summary["tempo"] = document.get("tempo", pattern.get("tempo"))
        patterns.append(summary)

    for pattern_id, document in sorted(documents.items()):
        if pattern_id in seen:
            continue
        patterns.append(_pattern_summary(document, _repo_root() / document["path"], document["scope"]))

    return {
        **library,
        "library_path": str(library_path.relative_to(_repo_root())),
        "patterns": patterns,
    }


def get_pattern(pattern_id: str) -> dict[str, Any]:
    library = load_library()
    pattern = next((item for item in library["patterns"] if item["pattern_id"] == pattern_id), None)
    if pattern is None:
        raise KeyError(pattern_id)

    documents = _load_documents()
    document = documents.get(pattern_id)
    if document is None:
        raise FileNotFoundError(pattern_id)

    return {
        "pattern_id": pattern_id,
        "library": {
            "version": library["version"],
            "owner": library["owner"],
            "exports": library["exports"],
        },
        "summary": pattern,
        "document": document,
    }


def save_pattern_document(pattern: dict[str, Any]) -> dict[str, Any]:
    root = _session_pattern_root()
    root.mkdir(parents=True, exist_ok=True)
    pattern_id = pattern["pattern_id"]
    path = root / f"{pattern_id}.json"
    path.write_text(json.dumps(pattern, indent=2, sort_keys=True), encoding="utf-8")
    return {
        "pattern_id": pattern_id,
        "path": str(path.relative_to(_repo_root())),
    }
