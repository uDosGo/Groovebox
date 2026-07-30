---
title: "Groovebox ↔ uCore Developer Tools Parity"
status: active
last_updated: 2026-07-09
category: dev-tools
tags: [groovebox, ucore, devtools, parity]
---

# Groovebox ↔ uCore Developer Tools Parity

Maps each Groovebox dev command and diagnostic surface to its uCore equivalent.

## Analysis Tools

| Groovebox Capability | Groovebox Command/Endpoint | uCore Equivalent | Status |
|---------------------|---------------------------|------------------|--------|
| Health check | `GET /api/health` | `GET /health` | ✅ Compatible |
| Bootstrap status | `GET /api/bootstrap/status` | `GET /api/server/health` | Compatible shape |
| Diagnostics events | `GET /api/diagnostics/events` | Spool log reader | ✅ SPOOL_SPEC aligned |
| Runtime health | `GET /api/songscribe/runtime` | `GET /api/server/services` | Compatible shape |
| Pattern validation | `POST /api/spec/parse` | N/A (Groovebox-native) | — |
| Compile check | `POST /api/spec/compile` | N/A (Groovebox-native) | — |

## Maintenance Tools

| Groovebox Capability | Groovebox Command/Endpoint | uCore Equivalent | Status |
|---------------------|---------------------------|------------------|--------|
| Dependency audit | `npm audit` | `pnpm audit` | Equivalent |
| Python lint | `ruff check app/` | `ruff check backend/` | Equivalent |
| Type check | `vue-tsc --noEmit` | `vue-tsc --noEmit` | ✅ Same tool |
| Build | `vite build` | `vite build` | ✅ Same tool |
| Spool log viewer | `/api/diagnostics/events` | `spool_maintenance` skill | Compatible |
| Schema drift check | `scripts/check-spool-schema.sh` | Schema validation in CI | ✅ Aligned |

## Workflow Tools

| Groovebox Capability | Groovebox Command/Endpoint | uCore Equivalent | Status |
|---------------------|---------------------------|------------------|--------|
| Task tracking | `.tasker.dev-flow.yaml` | `.tasker.dev-flow.yaml` | ✅ Same format |
| Sprint planning | YAML lanes + tasks | YAML lanes + tasks | ✅ Same format |
| Dev server | `npm run dev` (Vite :8888) | `pnpm dev` (Vite :5173) | Aligned |
| Proxy API | Vite proxy `/api` → FastAPI | Vite proxy `/api` → uCore | ✅ Same pattern |

## Orchestration Tools

| Groovebox Capability | Groovebox Command/Endpoint | uCore Equivalent | Status |
|---------------------|---------------------------|------------------|--------|
| Docker compose | `POST /api/songscribe/docker/start` | `container_manager.py` | Compatible lifecycle |
| Runtime start | `POST /api/songscribe/runtime/start` | `surface_manager.py` | Compatible lifecycle |
| Runtime stop | `POST /api/songscribe/runtime/stop` | `surface_manager.py` | Compatible lifecycle |
| Surface registry | `GET /api/surfaces` | `GET /api/surfaces` | ✅ Same endpoint name |

## Gap Summary

| Gap | Plan |
|-----|------|
| No `surface_repair` equivalent | Patterns self-heal on parse via `spec_parser.py` |
| No `ucore_secret_get/list` | Not needed — Groovebox has no secrets management |
| No skill scheduler | Defer to uCore snackmachine for scheduled exports |
| No `/api/mcp/tools` dynamic discovery | Static `mcp-groovebox-manifest.json` suffices; dynamic can be added |
| CI schema drift check not wired to GitHub Actions | `scripts/check-spool-schema.sh` exists; needs `.github/workflows/` integration |