# Songscribe health probes (Groovebox)

## Purpose

Define minimum health/status expectations for Groovebox + Songscribe integration
without requiring Docker as default runtime.

## Probe endpoints (Groovebox API)

| Endpoint | Expected role | Required fields |
| --- | --- | --- |
| `GET /api/health` | Groovebox service heartbeat | `status`, `service` |
| `GET /api/bootstrap/status` | Startup/config summary | `songscribe`, `docker`, `groovebox_startup` |
| `GET /api/songscribe/status` | Songscribe integration status | `configured`, `cloned`, `running`, `browser_url` |
| `GET /api/songscribe/docker` | Docker fallback capability status | `compose_exists`, `docker_cli`, `can_control` |

## Policy

- Non-Docker path is primary; checks must pass even when Docker is absent.
- Docker-related endpoint checks are capability/status checks only (not “must be
  running” checks).
- Docker control is explicit opt-in (`GROOVEBOX_DOCKER_CONTROL=1`) and remains
  loopback-only for start/stop endpoints, including runtime compatibility modes.
- Failing Songscribe runtime on `127.0.0.1:3000` is not a hard failure for base
  Groovebox operation unless explicitly running a Songscribe compatibility test.

## Validation

Run:

```bash
bash scripts/verify-songscribe-health-probes.sh
```

This script validates endpoint shape/required keys through FastAPI `TestClient`
and does not require Docker.
