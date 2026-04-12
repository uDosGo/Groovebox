# Agent notes — GrooveBox888

**Release:** **2.2.1** (see root `VERSION` / `package.json`). **MIT** — [`LICENSE`](LICENSE). **GrooveBox888** is the **uDos** groovebox lane: FastAPI + static UI, pattern library, Songscribe bridge, exports. **uDos** = Universal Device Operating Surface (canonical spelling in new copy).

## Where to look

| Doc | Role |
| --- | --- |
| [`TASKS.md`](TASKS.md) | Engineering backlog (Task Forge / `docs/dev/TASK.md` syntax) |
| [`DEV.md`](DEV.md) | Commands, checks, UI entrypoints |
| [`QUICKSTART.md`](QUICKSTART.md) | Five-minute beginner run |
| [`docs/learning/README.md`](docs/learning/README.md) | Sonic-style learning intake + public uDos links |
| [`docs/README.md`](docs/README.md) | Stable reference index |
| [`docs/PUBLIC.md`](docs/PUBLIC.md) | Free / OSS audience; **tool vs commercial** boundary ([`UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1`](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1.md)) |
| [`docs/dev/WORKFLOW.md`](docs/dev/WORKFLOW.md) | UDN: `.local/` → `TASKS.md` → `.compost/` |
| [`docs/architecture.md`](docs/architecture.md) | Product architecture |
| [`docs/DISTRIBUTION.md`](docs/DISTRIBUTION.md) | Sonic-aligned install, `~/.udos/library/`, USB bundles |
| [`docs/GROOVEBOX_SONIC_SOUND_CATALOG.md`](docs/GROOVEBOX_SONIC_SOUND_CATALOG.md) | Kits ↔ Sonic device-db style; library roots |
| [`docs/groovebox-songscribe-convergence.md`](docs/groovebox-songscribe-convergence.md) | Songscribe + UI roadmap |

## Family context

- Governance and v4 specs: sibling **[`uDosConnect/uDosDev`](../uDosConnect/uDosDev)** (when present), or [uDosDev on GitHub](https://github.com/fredporter/uDosDev).
- **USXD / interchange:** [`UniversalSurfaceXD`](../UniversalSurfaceXD) — this repo exposes `GET /api/interchange/surface-document` and `GET /api/usxd/surface` for handoff JSON under [`interchange/`](interchange/).
- **Songscribe:** default clone **[fredporter/songscribe](https://github.com/fredporter/songscribe)**; upstream **[gabe-serna/songscribe](https://github.com/gabe-serna/songscribe)**. Override with `SONGSCRIBE_REPO_URL` in `scripts/setup-songscribe.sh`.

## Habits

- Tracked intent → **`TASKS.md`**. Scratch → **`.local/`** (gitignored). Replaced trees → **`.compost/`** (see [`.compost/README.md`](.compost/README.md)).
- Gate: **`bash scripts/run-groovebox-checks.sh`**. Hygiene cycle: **`bash scripts/groovebox-ping-shake-pong.sh`**.
