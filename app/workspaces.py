from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _family_root() -> Path:
    return _repo_root().parent


def _discover_roots() -> list[dict[str, str]]:
    roots: list[dict[str, str]] = []
    for candidate in sorted(_family_root().glob("*")):
        for child_name in ("vault", "binder"):
            child = candidate / child_name
            if child.is_dir():
                roots.append(
                    {
                        "id": f"{candidate.name}-{child_name}",
                        "label": f"{candidate.name}/{child_name}",
                        "path": str(child),
                        "kind": child_name,
                    }
                )
    return roots


def load_workspace_config() -> list[dict[str, str]]:
    config_path = _repo_root() / "config" / "workspaces.json"
    if not config_path.exists():
        return _discover_roots()
    payload = json.loads(config_path.read_text(encoding="utf-8"))
    roots = payload.get("roots", [])
    resolved: list[dict[str, str]] = []
    for root in roots:
        path = root["path"]
        if path.startswith("${family_root}/"):
            path = str(_family_root() / path.removeprefix("${family_root}/"))
        resolved.append({**root, "path": path})
    return resolved


def get_root(root_id: str) -> dict[str, str]:
    for root in load_workspace_config():
        if root["id"] == root_id:
            return root
    raise KeyError(root_id)


def _resolve_within(root_path: Path, relative_path: str) -> Path:
    candidate = (root_path / relative_path).resolve()
    if candidate != root_path and root_path not in candidate.parents:
        raise ValueError("path escapes workspace root")
    return candidate


def list_tree(root_id: str, relative_path: str = "") -> dict[str, Any]:
    root = get_root(root_id)
    root_path = Path(root["path"]).resolve()
    target = _resolve_within(root_path, relative_path)
    if not target.exists():
        raise FileNotFoundError(relative_path)
    if not target.is_dir():
        raise NotADirectoryError(relative_path)

    children = []
    for child in sorted(target.iterdir(), key=lambda item: (item.is_file(), item.name.lower())):
        if child.name.startswith(".") or child.name in {"node_modules", "__pycache__"}:
            continue
        relative_child = child.relative_to(root_path).as_posix()
        children.append(
            {
                "name": child.name,
                "path": relative_child,
                "type": "directory" if child.is_dir() else "file",
                "size": child.stat().st_size if child.is_file() else None,
            }
        )

    return {
        "root": root,
        "current_path": "." if not relative_path else relative_path,
        "children": children,
    }


def read_file(root_id: str, relative_path: str) -> dict[str, Any]:
    root = get_root(root_id)
    root_path = Path(root["path"]).resolve()
    target = _resolve_within(root_path, relative_path)
    if not target.is_file():
        raise FileNotFoundError(relative_path)
    text = target.read_text(encoding="utf-8")
    return {
        "root": root,
        "path": relative_path,
        "content": text,
        "name": target.name,
    }


def write_file(root_id: str, relative_path: str, content: str) -> dict[str, Any]:
    root = get_root(root_id)
    root_path = Path(root["path"]).resolve()
    target = _resolve_within(root_path, relative_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    return {
        "root": root,
        "path": relative_path,
        "bytes_written": len(content.encode("utf-8")),
    }
