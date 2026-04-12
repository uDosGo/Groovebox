from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.bootstrap_status import bootstrap_status
from app.export_store import save_export_file
from app.exports import build_midi_export, build_midi_file, build_mml_export, build_musicxml_export, build_notation_export, build_wav_file
from app.pattern_library import get_pattern, load_library, save_pattern_document
from app.patterns import build_pattern_document, compile_pattern_document, compile_pattern_from_document, slugify
from app.playback import build_playback_preview
from app.session_store import list_sessions, save_session
from app.songscribe import songscribe_status
from app.songscribe_docker import (
    docker_cli_available,
    docker_control_enabled,
    docker_status_payload,
    loopback_client_ok,
    songscribe_compose_file,
    songscribe_docker_start,
    songscribe_docker_stop,
)
from app.songscribe_runtime import songscribe_runtime_start, songscribe_runtime_status, songscribe_runtime_stop
from app.spec_parser import parse_markdown_spec
from app.workspaces import list_tree, load_workspace_config, read_file, write_file


REPO_ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = REPO_ROOT / "app" / "static"

app = FastAPI(title="uDOS Groovebox", version="0.1.0")
app.mount("/static", StaticFiles(directory=STATIC_ROOT), name="static")


class MarkdownPayload(BaseModel):
    markdown: str


class WorkspaceWritePayload(BaseModel):
    root_id: str
    path: str
    content: str


class SessionSavePayload(BaseModel):
    name: str
    markdown: str


class PatternSavePayload(BaseModel):
    name: str
    markdown: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "uDOS-groovebox"}


@app.get("/api/bootstrap/status")
def bootstrap() -> dict[str, object]:
    """Songscribe + Docker hints from startup (env set by run-groovebox-ui.sh) and live status."""
    return bootstrap_status(REPO_ROOT)


@app.get("/api/songscribe/docker")
def songscribe_docker_info(request: Request) -> dict[str, object]:
    """Whether this browser session may start/stop Songscribe via docker compose (loopback only)."""
    host = request.client.host if request.client else None
    base = docker_status_payload(REPO_ROOT)
    can = (
        docker_control_enabled()
        and loopback_client_ok(host)
        and docker_cli_available()
        and bool(base.get("compose_exists"))
    )
    return {**base, "loopback_client": host, "loopback_ok": loopback_client_ok(host), "can_control": can}


def _assert_can_control_songscribe_docker(request: Request) -> None:
    if not docker_control_enabled():
        raise HTTPException(status_code=403, detail="Docker control disabled (GROOVEBOX_DOCKER_CONTROL=0)")
    host = request.client.host if request.client else None
    if not loopback_client_ok(host):
        raise HTTPException(
            status_code=403,
            detail="Docker control only allowed from loopback; bind Groovebox to 127.0.0.1",
        )
    if not docker_cli_available():
        raise HTTPException(status_code=503, detail="docker CLI not found on PATH")
    if not songscribe_compose_file(REPO_ROOT).is_file():
        raise HTTPException(status_code=404, detail="containers/songscribe/docker-compose.yml not found")


@app.post("/api/songscribe/docker/start")
def songscribe_docker_start_route(request: Request) -> dict[str, object]:
    _assert_can_control_songscribe_docker(request)
    return songscribe_docker_start(REPO_ROOT)


@app.post("/api/songscribe/docker/stop")
def songscribe_docker_stop_route(request: Request) -> dict[str, object]:
    _assert_can_control_songscribe_docker(request)
    return songscribe_docker_stop(REPO_ROOT)


@app.get("/api/songscribe/runtime")
def songscribe_runtime_info() -> dict[str, object]:
    return songscribe_runtime_status(REPO_ROOT)


@app.post("/api/songscribe/runtime/start")
def songscribe_runtime_start_route(request: Request, mode: str = "local") -> dict[str, object]:
    if mode.lower() in ("docker", "auto"):
        _assert_can_control_songscribe_docker(request)
    return songscribe_runtime_start(REPO_ROOT, mode=mode)


@app.post("/api/songscribe/runtime/stop")
def songscribe_runtime_stop_route(request: Request, mode: str = "local") -> dict[str, object]:
    if mode.lower() in ("docker", "auto"):
        _assert_can_control_songscribe_docker(request)
    return songscribe_runtime_stop(REPO_ROOT, mode=mode)


@app.get("/api/workspaces")
def workspaces() -> dict[str, object]:
    return {"roots": load_workspace_config()}


@app.get("/api/patterns")
def patterns() -> dict[str, object]:
    return {"library": load_library()}


@app.get("/api/patterns/{pattern_id}")
def pattern_detail(pattern_id: str) -> dict[str, object]:
    try:
        payload = get_pattern(pattern_id)
        compiled = compile_pattern_from_document(payload["document"])
        return {
            **payload,
            "compiled": compiled,
            "playback": build_playback_preview(compiled),
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown pattern")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Pattern document not found")


@app.post("/api/patterns/save")
def pattern_save(payload: PatternSavePayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    document = build_pattern_document(parsed)
    if payload.name.strip():
        document["name"] = payload.name.strip()
        document["pattern_id"] = slugify(payload.name.strip())
    saved = save_pattern_document(document)
    compiled = compile_pattern_from_document(document)
    return {
        **saved,
        "compiled": compiled,
        "playback": build_playback_preview(compiled),
    }


@app.get("/api/workspaces/tree")
def workspace_tree(root_id: str, path: str = "") -> dict[str, object]:
    try:
        return list_tree(root_id, path)
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown workspace root")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Path not found")
    except NotADirectoryError:
        raise HTTPException(status_code=400, detail="Path is not a directory")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")


@app.get("/api/workspaces/file")
def workspace_file(root_id: str, path: str) -> dict[str, object]:
    try:
        return read_file(root_id, path)
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown workspace root")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")


@app.put("/api/workspaces/file")
def workspace_file_write(payload: WorkspaceWritePayload) -> dict[str, object]:
    try:
        return write_file(payload.root_id, payload.path, payload.content)
    except KeyError:
        raise HTTPException(status_code=404, detail="Unknown workspace root")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")


@app.post("/api/spec/parse")
def spec_parse(payload: MarkdownPayload) -> dict[str, object]:
    return parse_markdown_spec(payload.markdown)


@app.post("/api/playback/preview")
def playback_preview(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    return build_playback_preview(compiled)


@app.post("/api/spec/compile")
def spec_compile(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    return compile_pattern_document(parsed)


@app.post("/api/exports/midi")
def midi_export(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    playback = build_playback_preview(compiled)
    return build_midi_export(compiled, playback)


@app.post("/api/exports/midi/file")
def midi_export_file(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    playback = build_playback_preview(compiled)
    saved = save_export_file(f"{compiled['pattern_id']}.mid", build_midi_file(compiled, playback))
    return {
        "schema": "udos-groovebox-midi-file/v0",
        "format": "midi-file",
        "pattern_id": compiled["pattern_id"],
        "title": compiled["title"],
        "tempo": compiled["tempo"],
        **saved,
    }


@app.post("/api/exports/wav/file")
def wav_export_file(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    playback = build_playback_preview(compiled)
    saved = save_export_file(f"{compiled['pattern_id']}.wav", build_wav_file(compiled, playback))
    return {
        "schema": "udos-groovebox-wav-file/v0",
        "format": "wav-file",
        "pattern_id": compiled["pattern_id"],
        "title": compiled["title"],
        "tempo": compiled["tempo"],
        **saved,
    }


@app.post("/api/exports/notation/file")
def notation_export_file(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    notation = build_notation_export(compiled)
    saved = save_export_file(f"{compiled['pattern_id']}.notation.txt", notation["notation"].encode("utf-8"))
    return {
        "schema": "udos-groovebox-notation-file/v0",
        "format": "notation-file",
        "pattern_id": compiled["pattern_id"],
        "title": compiled["title"],
        **saved,
    }


@app.post("/api/exports/mml/file")
def mml_export_file(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    export = build_mml_export(compiled)
    saved = save_export_file(
        f"{compiled['pattern_id']}.mml.txt",
        ("\n".join(track["mml"] for track in export["tracks"]) + "\n").encode("utf-8"),
    )
    return {
        "schema": "udos-groovebox-mml-file/v0",
        "format": "mml-file",
        "pattern_id": compiled["pattern_id"],
        "title": compiled["title"],
        **saved,
    }


@app.post("/api/exports/musicxml/file")
def musicxml_export_file(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    export = build_musicxml_export(compiled)
    saved = save_export_file(
        f"{compiled['pattern_id']}.musicxml",
        (export["musicxml"] + "\n").encode("utf-8"),
    )
    return {
        "schema": "udos-groovebox-musicxml-file/v0",
        "format": "musicxml-file",
        "pattern_id": compiled["pattern_id"],
        "title": compiled["title"],
        **saved,
    }


@app.get("/api/songscribe/status")
def songscribe() -> dict[str, object]:
    return songscribe_status(REPO_ROOT)


@app.post("/api/songscribe/bridge")
def songscribe_bridge(payload: MarkdownPayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    return {
        "songscribe": songscribe_status(REPO_ROOT),
        "pattern": compiled,
        "playback": build_playback_preview(compiled),
    }


@app.get("/api/sessions")
def sessions() -> dict[str, object]:
    return {"sessions": list_sessions()}


@app.post("/api/sessions/save")
def session_save(payload: SessionSavePayload) -> dict[str, object]:
    parsed = parse_markdown_spec(payload.markdown)
    compiled = compile_pattern_document(parsed)
    return save_session(payload.name, compiled)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_ROOT / "index.html")
