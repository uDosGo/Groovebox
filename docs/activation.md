# uDOS-groovebox Activation

Groovebox is active as the family sequencing and composition lane.

## Activated Surfaces

- `src/` as the checked-in pattern and bridge definition lane
- `examples/` as the smallest public pattern examples
- `scripts/run-groovebox-checks.sh` as the repo validation entrypoint
- `tests/` as the JSON and boundary validation lane
- `config/` as the checked-in non-secret config example lane

## Validation Contract

Run:

```bash
bash scripts/run-groovebox-checks.sh
```

This path verifies the required repo surfaces, checks source and example
pattern records, and validates the seeded Songscribe bridge lane.

## Operational requirements

- **Runtime:** Python 3 with dependencies used by `app/` and `tests/` (FastAPI,
  uvicorn, etc.).
- **Network:** Default UI binds **127.0.0.1** (see `scripts/run-groovebox-ui.sh`,
  overridable `PORT`). Optional Songscribe uses **127.0.0.1:3000** when Docker is
  running.
- **Filesystem:** For workspace browsing, keep `uDOS-groovebox` next to sibling
  repos if using `${family_root}` paths in `config/workspaces.json` (see
  [sound-library.md](sound-library.md)).
- **Validation:** `bash scripts/run-groovebox-checks.sh` before merge or release.

Full operator checklist: [product-checklist.md](product-checklist.md).

## Boundary Rule

Groovebox does not own shell command dispatch, provider registration, network
API ownership, generic music transcription orchestration, or canonical runtime
contracts.
