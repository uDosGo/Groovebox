# Groovebox product checklist

Use this as the **release and operator gate** for `uDOS-groovebox`: it turns the
repo from a concept outline into a **checkable product** with stable surfaces.

## Product definition

**uDOS-groovebox** is a **local-first** pattern sequencer and export lane for the
uDOS family:

- **Operator surface:** a browser UI (FastAPI + static assets) for editing
  step patterns, arrangement, and markdown specs, with Web Audio preview.
- **Data plane:** JSON pattern documents, a checked-in **pattern library**
  catalogue, **sample** and **synth preset** metadata, and **markdown** as the
  source of truth for projects.
- **Exports:** MIDI, WAV, MusicXML, MML, and plain notation as files under
  `sessions/exports/` (see [Sound library and artifact paths](sound-library.md)).
- **Songscribe lane:** optional upstream UI in Docker; Groovebox always offers
  markdown parsing and `/api/songscribe/*` without requiring that UI (see
  [Songscribe processing contract](songscribe-contract.md)).
- **Workspace browser:** read/write selected **vault** and **binder** roots from
  `config/workspaces.json` so markdown projects live next to family material.

**Non-goals** remain as in [boundary.md](boundary.md) (no shell ownership,
no Wizard HTTP policy ownership, no DAW-grade workstation scope).

## Preconditions

| # | Check |
| --- | --- |
| 1 | **Python 3** with `fastapi`, `uvicorn`, and test dependencies available (see `tests/` imports). |
| 2 | Repo clone is beside sibling family repos if you use default `config/workspaces.json` (`${family_root}/...` paths). |
| 3 | **Songscribe:** first `bash scripts/run-groovebox-ui.sh` runs `setup-groovebox-first-run.sh` (clone into `containers/songscribe/repo`), or run that script manually. Optional **Docker** for Songscribe ([docker-posture.md](docker-posture.md)). |

## Automated verification

| # | Check |
| --- | --- |
| 1 | From repo root: `bash scripts/run-groovebox-checks.sh` exits **0**. |

## Operator smoke (local UI)

| # | Check |
| --- | --- |
| 1 | `bash scripts/run-groovebox-ui.sh` starts **uvicorn** on **127.0.0.1** (default port **8766**, overridable with `PORT`). |
| 2 | Browser: open `http://127.0.0.1:8766/` (or chosen `PORT`) and confirm the **Groovebox** shell loads: top nav (**Compose**, **Vault**, **Library**, **Status**), stacked cards on **Compose** (spec actions, composer, markdown editor, playback). **Vault** / **Library** expose the file tree and pattern list on their own pages. |
| 3 | **Songscribe** strip in the header: status text and **Open** / Docker / **Embed** controls; if the upstream UI is not up, a **banner** shows the same hint as the terminal ([getting-started.md](getting-started.md) § First-run install). |

## Documentation completeness (Workspace 04)

| # | Document |
| --- | --- |
| 1 | [sound-library.md](sound-library.md) — library layout and browsing. |
| 2 | [songscribe-contract.md](songscribe-contract.md) — API and operations. |
| 3 | [docker-posture.md](docker-posture.md) — when Docker is required vs optional. |
| 4 | [activation.md](activation.md) — validation entrypoint and ops summary. |

## Release hygiene

| # | Check |
| --- | --- |
| 1 | No machine-specific absolute paths in `README.md`, `docs/`, `app/`, `src/`, `examples/`, `config/` (enforced by `run-groovebox-checks.sh`). |
| 2 | Session outputs under `sessions/exports/`, `sessions/patterns/`, `sessions/compiled/` are **runtime-generated**; only documented demos stay in git where already checked in. |

## Related

- [getting-started.md](getting-started.md)
- [architecture.md](architecture.md)
