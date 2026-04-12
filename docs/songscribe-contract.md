# Songscribe processing contract

Groovebox integrates **Songscribe** in two ways:

1. **Markdown fence** — A fenced code block tagged `songscribe` (see tests and
   UI) is parsed by `app/spec_parser.py` / `compile_pattern_document` like the
   rest of the Groovebox markdown spec. No separate network call is required for
   pattern compilation.
2. **Optional upstream app** — A clone under `containers/songscribe/repo` and
   optional **Docker Compose** on **port 3000** for the upstream Next.js UI.

This document locks the **HTTP contract** and **operator flow** for Workspace
04.

## Status surface

**`GET /api/songscribe/status`**

Returns a JSON object (see `app/songscribe.py`):

| Field | Meaning |
| --- | --- |
| `configured` | `container.json` and `docker-compose.yml` exist under `containers/songscribe/`. |
| `cloned` | `containers/songscribe/repo` exists (local git checkout). |
| `running` | TCP connect to **127.0.0.1:3000** succeeded (short timeout). |
| `repo_path` | Absolute path string to the clone directory. |
| `compose_path` | Path to compose file. |
| `commit` | Short `git rev-parse HEAD` of the clone, or `null`. |
| `upstream` | Upstream git URL string for documentation. |
| `container_service` | Logical name: `songscribe`. |
| `browser_url` | `http://127.0.0.1:3000` when advertising the container UI. |

The Groovebox browser UI reads this endpoint to show **Songscribe** readiness.

## Bridge surface (markdown in, pattern out)

**`POST /api/songscribe/bridge`**

- **Request body:** `{ "markdown": "<full markdown including songscribe fence>" }` (same shape as other spec endpoints).
- **Processing:** `parse_markdown_spec` → `compile_pattern_document` → `build_playback_preview`.
- **Response:** JSON object containing:
  - `songscribe`: same object as **`GET /api/songscribe/status`**
  - `pattern`: compiled pattern document
  - `playback`: playback preview payload

**Contract note:** The bridge endpoint **does not** call the Songscribe
container. It proves the **Groovebox** side of the “text → pattern → preview”
pipeline. Running Songscribe in Docker is **optional** for richer editing UI.

## Startup hints (`run-groovebox-ui.sh`)

When you start Groovebox via `scripts/run-groovebox-ui.sh`, the shell may set:

- `GROOVEBOX_SONGSCRIBE_DOCKER_STATUS` — `ok`, `no_docker`, `failed`, `skipped`
- `GROOVEBOX_SONGSCRIBE_HINT` — text copied into **`GET /api/bootstrap/status`**
  for the browser banner

Set `GROOVEBOX_AUTO_SONGSCRIBE_DOCKER=0` to skip `docker compose up -d`. Plain
`uvicorn` does not set these variables; the UI still uses live Songscribe status.

## Operational flow

| Step | Action |
| --- | --- |
| 1 | (Optional) `bash scripts/setup-songscribe.sh` — clone or refresh `containers/songscribe/repo`. |
| 2 | (Optional) `docker compose -f containers/songscribe/docker-compose.yml up` — start upstream UI on port **3000**. |
| 3 | Run Groovebox: `bash scripts/run-groovebox-ui.sh` — default **8766**. |
| 4 | Confirm `GET /api/songscribe/status` and the UI status line match expectations. |

Alternative UI helper: `bash scripts/run-songscribe-ui.sh` (see `scripts/README.md`).

## Checked-in bridge metadata

| File | Role |
| --- | --- |
| `src/songscribe-bridge.json` | Declares `bridge_type`, `supported_modes`, input/output formats. |
| `src/songscribe-request.json` | Request contract marker for tooling. |
| `examples/basic-songscribe-pattern.json` | Pattern example with `songscribe.bridge_owner: uDOS-groovebox`. |

## Related

- [songscribe-isolate-audio.md](songscribe-isolate-audio.md) — **songscribe-api** + `NEXT_PUBLIC_API_BASE_URL` + Groovebox overlay
- [groovebox-songscribe-convergence.md](groovebox-songscribe-convergence.md) — shared UI / sample spool / frontmatter roadmap
- `containers/songscribe/README.md`
- [docker-posture.md](docker-posture.md)
- [sound-library.md](sound-library.md)
