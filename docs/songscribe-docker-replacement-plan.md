# Songscribe Docker replacement plan (phase-2)

## Status

- phase: **2 (in progress)**
- posture: Docker is **transitional compatibility**, not target runtime substrate
- family contract: `uDOS-dev/docs/shared-runtime-resource-contract.md`

## Goal

Keep Songscribe UX available while migrating operational responsibility from
Compose-centric flows toward shared uDOS runtime/resource capabilities.

## Scope

This plan covers Groovebox integration points only:

- Songscribe UI optional run lane
- songscribe-api integration path
- health and lifecycle expectations exposed to operators

It does **not** redesign upstream Songscribe internals.

## Current state

- Groovebox app runs without Docker (`scripts/run-groovebox-ui.sh`).
- Songscribe UI and stem API have optional Compose overlays.
- Docker control endpoints exist in Groovebox API and are loopback guarded.

## Target state

- Lifecycle operations are routed through shared runtime semantics first
  (`runtime.service.*` contract expectations).
- Docker overlays remain optional fallback only.
- Operator docs default to non-Docker path, with Docker as compatibility note.

## Migration checklist

### A. Control-plane alignment

- [x] Add Groovebox service/lifecycle mapping to the shared runtime service matrix
      as **optional compatibility services** (`uDOS-dev/@dev/fixtures/shared-runtime-service-lifecycle.v1.json`).
- [x] Define Groovebox/Songscribe health probe expectations in docs and checks
      (`docs/songscribe-health-probes.md`, `scripts/verify-songscribe-health-probes.sh`, wired into `run-groovebox-checks.sh`).

### B. Runtime behavior

- [x] Introduce non-Docker lifecycle handler path for Songscribe bridge start/stop
      in Groovebox (`/api/songscribe/runtime/start|stop`, local-first mode with
      optional `docker` or `auto` mode).
- [x] Keep loopback-only safety and explicit opt-in for any compatibility controls
      (`GROOVEBOX_DOCKER_CONTROL=1` required; runtime `docker|auto` paths enforce
      the same guard as `/api/songscribe/docker/*`).

### C. Validation

- [x] Add Groovebox checks that verify non-Docker preferred path still works when
      Docker is absent (`scripts/verify-songscribe-runtime-non-docker.sh`).
- [x] Keep optional Compose smoke checks as compatibility coverage
      (`scripts/verify-songscribe-compose-compat.sh`, skips cleanly when docker is unavailable).

### D. Broader family alignment (O3 tranche)

- [x] **`uDOS-host`** WordPress publish Compose registered as lifecycle
      **`ubuntu-wordpress-publish-stack`** with owner doc
      `uDOS-host/docs/docker-compose-compatibility.md` and header comments on
      the compose file.
- [x] **`uDOS-dev`** sibling verify `scripts/verify-o3-docker-compat-siblings.sh`
      (wired `run-dev-checks.sh`).

### D. Documentation and operator flow

- [x] Update `docker-posture.md` default narrative to “non-Docker first.”
- [x] Keep concise “when Docker is still needed” section with sunset criteria.

## Acceptance criteria for phase-2 close

- Non-Docker path is documented as default and validated in checks.
- Docker path is explicit fallback, not hidden dependency.
- No Tier-1-facing workflow requires Docker for basic Groovebox operation.

## Related

- `docker-posture.md`
- `songscribe-isolate-audio.md`
- `songscribe-contract.md`
- `uDOS-dev/docs/shared-runtime-resource-contract.md`
