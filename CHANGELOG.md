# Changelog

## 2.2.1 — 2026-04-13

### Changed

- **README** — product identity: **GrooveBox888** vs stable wire id `uDOS-groovebox` on JSON `owner` fields  
- **`@dev/README.md`** — GrooveBox888 title; family governance pointer to uDosDev (sibling `uDosConnect/uDosDev`)
- **`docs/PUBLIC.md`**, **`AGENTS.md`** — **Tool family** monetization boundary: locked **[`UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1`](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1.md)** (free tools vs commercial products)

## 2.2.0 — 2026-04-13

### Added

- **`docs/GROOVEBOX_SONIC_SOUND_CATALOG.md`** — kits ↔ Sonic device-db mental model, `~/.udos/library/groovebox/` layout, FOSS-first retro style tags  
- **`docs/DISTRIBUTION.md`** — sibling clones (`~/Code/`), venv, hot USB / `library/bundles/groovebox888/`, link to Sonic integration  
- **`config/groovebox-library.example.json`** — example env-relative library root hints  

### Changed

- **`docs/sound-library.md`** — audio “drivers”, plugin/SFZ resources, retrieval priority (`GROOVEBOX_AUDIO_ROOT`, `UDOS_LIBRARY_DIR`), Sonic cross-links  
- **`src/sample-bank.json`** — optional `lineage`, `source`, `sonic.tags` on example kits (documentation / future filtering)  

## 2.1.0 — 2026-04-13

### Added

- **`QUICKSTART.md`** — five-minute beginner path to the local UI  
- **`docs/learning/README.md`** — Sonic-style **learning intake hub** (public uDos links, no private monorepo required)  
- **`docs/PUBLIC.md`** — free / OSS / beginner audience and privacy posture  
- **`CONTRIBUTING.md`** — contributor expectations  
- **`LICENSE`** — **MIT**  

### Changed

- **`docs/README.md`**, **`wiki/README.md`**, **`wiki/unit-01-groovebox-basics.md`** — GrooveBox888 branding and learning cross-links  
- **`README.md`** — version **2.1.0**, Quickstart + learning intake up front  

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
