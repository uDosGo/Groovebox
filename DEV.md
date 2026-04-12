# GrooveBox888 — developer entry

**Release line:** root **`VERSION`** (also `package.json` **version**). Current: **2.2.1**. **License:** [MIT](LICENSE).

## Commands

| Command | Purpose |
| --- | --- |
| `bash scripts/run-groovebox-checks.sh` | Repo spine, JSON invariants, unit tests, Songscribe probe scripts |
| `bash scripts/run-groovebox-ui.sh` | FastAPI on `127.0.0.1:8766` (override `PORT`) |
| `bash scripts/setup-songscribe.sh` | Clone/refresh Songscribe into `containers/songscribe/repo` |
| `bash scripts/groovebox-ping-shake-pong.sh` | PING → SHAKE → PONG local hygiene (see script) |

## Stack

- **Python 3** + FastAPI (`app/main.py`), static UI under `app/static/`.
- Optional **Node** for `packages/*` design tokens (`npm install` at repo root when touching workspaces).

## Interchange / USXD

- Checked-in JSON: [`interchange/`](interchange/).
- Runtime: `GET /api/interchange/surface-document`, `GET /api/usxd/surface`.

## Doc index

- [`docs/README.md`](docs/README.md) — stable reference.
- [`docs/dev/WORKFLOW.md`](docs/dev/WORKFLOW.md) — workflow and zones.
- [`docs/dev/CURSOR_COMPLETION_CHECKLIST.md`](docs/dev/CURSOR_COMPLETION_CHECKLIST.md) — milestone gate.
