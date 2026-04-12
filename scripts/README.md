# Scripts

- `run-groovebox-checks.sh` validates the repo spine, source JSON, examples,
  and basic boundary hygiene for `uDOS-groovebox`
- `setup-groovebox-first-run.sh` runs Songscribe clone setup once per machine
  (also invoked automatically on first `run-groovebox-ui.sh` unless skipped)
- `run-groovebox-ui.sh` runs first-run setup (unless `GROOVEBOX_SKIP_FIRST_RUN=1`),
  optionally `docker compose up -d` for Songscribe (`GROOVEBOX_AUTO_SONGSCRIBE_DOCKER=0`
  to disable), prints terminal hints when Docker cannot start Songscribe, then
  starts the local FastAPI UI for workspace browsing, pattern library, playback,
  exports, etc.
- `run-songscribe-ui.sh` starts the cloned Songscribe app directly with npm
- `setup-songscribe.sh` clones or refreshes the local Songscribe source
- `apply-songscribe-groovebox-overrides.sh` copies Groovebox `isolateAudio.ts`
  fix and patches clearer isolation error toasts (run after clone/reset)
- `verify-songscribe-health-probes.sh` validates required Groovebox/Songscribe
  health endpoint payload shape via FastAPI `TestClient`
- `verify-songscribe-runtime-non-docker.sh` verifies local runtime controls keep
  working when Docker is unavailable and compatibility mode remains opt-in
- `verify-songscribe-compose-compat.sh` runs optional Docker compatibility smoke
  check (`docker compose config`) when Docker is installed; otherwise skips

Groovebox UI (FastAPI on 127.0.0.1) exposes **Docker up/stop** for Songscribe
compose and an **embed** iframe — see `docs/docker-posture.md` and
`/api/songscribe/docker` routes.
