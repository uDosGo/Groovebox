# Changelog

## 1.0.0 — 2026-04-13

Independent **GrooveBox888** release ([repository](https://github.com/fredporter/GrooveBox888)). This repo versions on its own; it remains conceptually aligned with the uDos family but is no longer framed as an archived uDos v2/v3 submodule-only experiment.

### Added

- Songscribe-aligned dark shell (`app/static/songscribe-theme.css`), Lexend/Nunito, compact nav with collapsible Songscribe lane
- USXD handoff: `GET /api/interchange/surface-document`, `GET /api/usxd/surface` plus `interchange/*.json`
- Maintainer spine: `AGENTS.md`, `DEV.md`, `TASKS.md`, `docs/dev/*`, `.compost/README.md`, `.cursor/rules/groovebox-v4.mdc`
- `scripts/groovebox-ping-shake-pong.sh` (PING / SHAKE / PONG hygiene)
- Default Songscribe clone URL: [`fredporter/songscribe`](https://github.com/fredporter/songscribe) (`SONGSCRIBE_REPO_URL` override supported)
- Root **`VERSION`** file; **`package.json`** / workspace semver **1.0.0**

### Changed

- FastAPI title **GrooveBox888**; `/api/health` returns `service: groovebox888` and `version` from `VERSION`
- `app/songscribe` status includes `upstream_canonical` for OSS lineage

### Earlier (pre-1.0)

- Initial groovebox v2 scaffold, pattern library, Songscribe bridge examples
