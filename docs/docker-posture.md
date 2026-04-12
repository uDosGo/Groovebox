# Docker posture (Groovebox)

## Post-08 O3 (family lifecycle registry)

Optional compatibility services for this repo are registered in
**`uDOS-dev/@dev/fixtures/shared-runtime-service-lifecycle.v1.json`**
(`groovebox-songscribe-ui`, `groovebox-songscribe-api`). They are **not** tier-1
host daemons; default operator paths stay non-Docker per the table below.

## Decision (non-Docker first)

| Component | Docker required? |
| --- | --- |
| **uDOS-groovebox app** (FastAPI + UI) | **No.** Run with `python3 -m uvicorn` via `scripts/run-groovebox-ui.sh`. |
| **Songscribe upstream UI** | **Optional.** Use Docker Compose under `containers/songscribe/` when you want the full Next.js Songscribe experience on **127.0.0.1:3000**. |

**Family migration posture:** Docker is transitional compatibility. Groovebox
phase-2 replacement checklist: `songscribe-docker-replacement-plan.md`.

Groovebox **validation, pattern compilation, exports, and Songscribe bridge API**
work **without** Docker. CI and local checks use `scripts/run-groovebox-checks.sh`
only.

## When to use Docker (compatibility only)

- Operators who want **parity** with upstream Songscribe editing features.
- Scenarios where installing Node dependencies on the host is undesirable; the
  compose file builds/runs the containerized app instead.

## When not to use Docker

- Minimal installs (Python-only).
- Headless automation: rely on markdown specs and `/api/*` without port 3000.

## Commands (reference)

```bash
# First-run / refresh Songscribe clone (also runs on first run-groovebox-ui.sh)
bash scripts/setup-groovebox-first-run.sh

# Optional: prepare clone only
bash scripts/setup-songscribe.sh

# Optional: run Songscribe
docker compose -f containers/songscribe/docker-compose.yml up

# Optional: Songscribe + songscribe-api (clone API into containers/songscribe/songscribe-api first)
docker compose -f containers/songscribe/docker-compose.yml -f containers/songscribe/docker-compose.stem.yml --profile stem up --build
```

Groovebox (always available without Docker):

```bash
bash scripts/run-groovebox-ui.sh
```

`run-groovebox-ui.sh` attempts **`docker compose up -d`** for Songscribe when
Docker is installed (disable with `GROOVEBOX_AUTO_SONGSCRIBE_DOCKER=0`).

Compose sets **`NEXT_PUBLIC_API_BASE_URL`** for the Next dev server (default
`http://host.docker.internal:8000` so a **songscribe-api** on the host is
reachable). Override when needed; on some Linux setups use your bridge IP or run
the API beside Songscribe in compose. See [songscribe-isolate-audio.md](songscribe-isolate-audio.md).

## Groovebox UI: Docker up / down / embed

When you use **`bash scripts/run-groovebox-ui.sh`** (FastAPI on **127.0.0.1**),
the Groovebox nav can call **`POST /api/songscribe/docker/start`** and **`stop`**
to run `docker compose … up -d` / `stop` on **`containers/songscribe/docker-compose.yml`**.
**Embed** loads Songscribe in an iframe under the same page.

## Runtime controls (local-first)

Groovebox now exposes non-Docker lifecycle controls:

- `GET /api/songscribe/runtime`
- `POST /api/songscribe/runtime/start?mode=local|docker|auto`
- `POST /api/songscribe/runtime/stop?mode=local|docker|auto`

`mode=local` is the default and preferred path for replacement migration.
`mode=docker` keeps compatibility behavior. `mode=auto` tries local first and
falls back to Docker when needed.

**Security:** control is **only allowed for loopback clients** and can be turned
on with **`GROOVEBOX_DOCKER_CONTROL=1`** (default is off). Do **not** expose
Groovebox on a LAN interface if you enable compatibility controls.

## Docker sunset criteria

Docker compatibility sections can be removed when all are true:

- Local runtime controls (`/api/songscribe/runtime/*`) are the only operator path
  needed for Songscribe bridge lifecycle.
- Groovebox checks pass in environments without Docker and no production-facing
  workflow depends on Compose.
- Shared family runtime/resource handlers cover Songscribe service lifecycle and
  health semantics to the level currently provided by compatibility overlays.

## Related

- [songscribe-contract.md](songscribe-contract.md)
- [product-checklist.md](product-checklist.md)
- [songscribe-docker-replacement-plan.md](songscribe-docker-replacement-plan.md)
