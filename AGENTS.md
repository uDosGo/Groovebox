# Agent notes — GrooveBox888

**Release:** **2.1.0** (see root `VERSION` / `package.json`). **MIT** — [`LICENSE`](LICENSE). **GrooveBox888** is the **uDos** groovebox lane: FastAPI + static UI, pattern library, Songscribe bridge, exports. **uDos** = Universal Device Operating Surface (canonical spelling in new copy).

## Where to look

| Doc | Role |
| --- | --- |
| [`TASKS.md`](TASKS.md) | Engineering backlog (Task Forge / `docs/dev/TASK.md` syntax) |
| [`DEV.md`](DEV.md) | Commands, checks, UI entrypoints |
| [`QUICKSTART.md`](QUICKSTART.md) | Five-minute beginner run |
| [`docs/learning/README.md`](docs/learning/README.md) | Sonic-style learning intake + public uDos links |
| [`docs/README.md`](docs/README.md) | Stable reference index |
| [`docs/dev/WORKFLOW.md`](docs/dev/WORKFLOW.md) | UDN: `.local/` → `TASKS.md` → `.compost/` |
| [`docs/architecture.md`](docs/architecture.md) | Product architecture |
| [`docs/groovebox-songscribe-convergence.md`](docs/groovebox-songscribe-convergence.md) | Songscribe + UI roadmap |

## Family context

- Governance and v4 specs: sibling **[`uDosConnect/uDosDev`](../uDosConnect/uDosDev)** (when present), or [uDosDev on GitHub](https://github.com/fredporter/uDosDev).
- **USXD / interchange:** [`UniversalSurfaceXD`](../UniversalSurfaceXD) — this repo exposes `GET /api/interchange/surface-document` and `GET /api/usxd/surface` for handoff JSON under [`interchange/`](interchange/).
- **Songscribe:** default clone **[fredporter/songscribe](https://github.com/fredporter/songscribe)**; upstream **[gabe-serna/songscribe](https://github.com/gabe-serna/songscribe)**. Override with `SONGSCRIBE_REPO_URL` in `scripts/setup-songscribe.sh`.

## Habits

- Tracked intent → **`TASKS.md`**. Scratch → **`.local/`** (gitignored). Replaced trees → **`.compost/`** (see [`.compost/README.md`](.compost/README.md)).
- Gate: **`bash scripts/run-groovebox-checks.sh`**. Hygiene cycle: **`bash scripts/groovebox-ping-shake-pong.sh`**.
