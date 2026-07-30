---
title: "Groovebox Skill Catalog"
status: active
last_updated: 2026-07-09
category: skills
tags: [groovebox, skills, mcp, ucore]
---

# Groovebox Skill Catalog

Maps Groovebox-native capabilities to uCore skill conventions for MCP discovery and tool routing.

## Skill Taxonomy

| Category | uCore Prefix | Groovebox Prefix |
|----------|-------------|------------------|
| Health | `ucore_health_` | `groovebox_health` |
| Compile/Parse | — | `groovebox_pattern_` |
| Playback | — | `groovebox_playback_` |
| Export | — | `groovebox_export_` |
| Runtime Ops | `ucore_surface_` | `groovebox_songscribe_` |
| File I/O | `ucore_spool_` | `groovebox_workspace_` |
| Diagnostics | `ucore_spool_maintenance` | `groovebox_diagnostics_` |

## Groovebox-Native Skills

### Pattern Composition

| Skill ID | MCP Tool Name | Endpoint | uCore Compatible |
|----------|-------------|----------|-----------------|
| `groovebox.pattern.compile` | `groovebox_pattern_compile` | `POST /api/spec/compile` | No (Groovebox-specific format) |
| `groovebox.pattern.parse` | `groovebox_pattern_parse` | `POST /api/spec/parse` | No |
| `groovebox.pattern.save` | `groovebox_pattern_save` | `POST /api/patterns/save` | No |
| `groovebox.libray.list` | `groovebox_patter_library_list` | `GET /api/patterns` | No |
| `groovebox.libray.get` | `groovebox_pattern_get` | `GET /api/patterns/{id}` | No |

### Playback & Transport

| Skill ID | MCP Tool Name | Endpoint | uCore Compatible |
|----------|-------------|----------|-----------------|
| `groovebox.playback.preview` | `groovebox_playback_preview` | `POST /api/playback/preview` | No |

### Export

| Skill ID | MCP Tool Name | Endpoint | uCore Compatible |
|----------|-------------|----------|-----------------|
| `groovebox.export.midi` | `groovebox_export_midi` | `POST /api/exports/midi` | Shared (MIDI is universal) |
| `groovebox.export.wav` | `groovebox_export_wav` | `POST /api/exports/wav/file` | Shared |
| `groovebox.export.notation` | `groovebox_export_notation` | `POST /api/exports/notation/file` | No |
| `groovebox.export.mml` | `groovebox_export_mml` | `POST /api/exports/mml/file` | No |
| `groovebox.export.musicxml` | `groovebox_export_musicxml` | `POST /api/exports/musicxml/file` | Shared |

### Songscribe Bridge

| Skill ID | MCP Tool Name | Endpoint | uCore Compatible |
|----------|-------------|----------|-----------------|
| `groovebox.songscribe.status` | `groovebox_songscribe_status` | `GET /api/songscribe/status` | No |
| `groovebox.songscribe.bridge` | `groovebox_songscribe_bridge` | `POST /api/songscribe/bridge` | No |
| `groovebox.songscribe.runtime.start` | `groovebox_songscribe_runtime_start` | `POST /api/songscribe/runtime/start` | No |
| `groovebox.songscribe.runtime.stop` | `groovebox_songscribe_runtime_stop` | `POST /api/songscribe/runtime/stop` | No |
| `groovebox.songscribe.docker.start` | `groovebox_songscribe_docker_start` | `POST /api/songscribe/docker/start` | No |
| `groovebox.songscribe.docker.stop` | `groovebox_songscribe_docker_stop` | `POST /api/songscribe/docker/stop` | No |

## uCore-Compatible Skills (Shared Contract)

### Health & System

| Skill ID | MCP Tool Name | Endpoint | Notes |
|----------|-------------|----------|-------|
| `groovebox.health` | `groovebox_health` | `GET /api/health` | Same envelope shape as uCore |
| `groovebox.bootstrap.status` | `groovebox_bootstrap_status` | `GET /api/bootstrap/status` | Similar to uCore surface health |

### Diagnostics & Events (Spool-Aligned)

| Skill ID | MCP Tool Name | Endpoint | Notes |
|----------|-------------|----------|-------|
| `groovebox.diagnostics.events` | `groovebox_diagnostics_events` | `GET /api/diagnostics/events` | uCore SPOOL_SPEC shape |
| `groovebox.diagnostics.health` | `groovebox_diagnostics_health` | `GET /api/songscribe/runtime` | Runtime lifecycle compatible |

### File I/O (Workspace)

| Skill ID | MCP Tool Name | Endpoint | Notes |
|----------|-------------|----------|-------|
| `groovebox.workspace.list` | `groovebox_workspace_list` | `GET /api/workspaces/roots` | Similar to uCore vault discovery |
| `groovebox.workspace.tree` | `groovebox_workspace_tree` | `GET /api/workspaces/tree` | Similar |
| `groovebox.workspace.read` | `groovebox_workspace_read` | `GET /api/workspaces/file` | Similar |
| `groovebox.workspace.write` | `groovebox_workspace_write` | `PUT /api/workspaces/file` | Similar |

### Session

| Skill ID | MCP Tool Name | Endpoint | Notes |
|----------|-------------|----------|-------|
| `groovebox.session.list` | `groovebox_session_list` | `GET /api/sessions` | Groovebox-specific format |
| `groovebox.session.save` | `groovebox_session_save` | `POST /api/sessions/save` | Groovebox-specific format |

## Event Taxonomy

All spool events emitted by Groovebox follow the uCore SPOOL_SPEC contract:

```
{timestamp: ISO8601, module: string, level: debug|info|warn|error, message: string, tags: string[]}
```

| Module | Events | Trigger |
|--------|--------|---------|
| `export` | export complete | Any `/api/exports/*/file` call |
| `songscribe.docker` | start/stop, success/failure | Docker compose up/down |
| `songscribe.runtime` | start/stop (local, docker, auto, docker-fallback) | Runtime lifecycle changes |

## Compatibility Gap Analysis

| Gap | Resolution |
|-----|-----------|
| Groovebox has no `ucore_surface_repair` equivalent | Pattern repairs handled by `spec_parser.py` on parse |
| Groovebox has no built-in skill scheduler | Defer to uCore snackmachine scheduler for scheduled exports |
| Snackbar store is frontend-only (no `/api/snacks` POST) | Groovebox snackbar is UI-only; spool events serve as backend audit trail |
| No `/api/mcp/tools` discovery endpoint | MCP manifest serves as static discovery; dynamic discovery can be added |