# GrooveBox888

**Free, open-source (MIT)** pattern groovebox for the **uDos** (Universal Device Operating Surface) family: local **FastAPI** + static UI, optional **Songscribe** bridge, pattern library, exports, and **USXD** interchange JSON.

| | |
| --- | --- |
| **Version** | **2.1.0** — see `VERSION` · `package.json` |
| **License** | [MIT](LICENSE) |
| **Repository** | [github.com/fredporter/GrooveBox888](https://github.com/fredporter/GrooveBox888) |
| **Quick start** | **[`QUICKSTART.md`](QUICKSTART.md)** (about five minutes) |
| **Learning intake** | **[`docs/learning/README.md`](docs/learning/README.md)** (Sonic-style hub: beginner path + public uDos links) |

**Family context:** this repo **versions independently**. Public uDos governance and teaching surfaces: [uDosDev](https://github.com/fredporter/uDosDev), [AgentDigital-docs](https://github.com/fredporter/AgentDigital-docs) (`docs/public/`). Optional local sibling: `uDosConnect/uDosDev` when you have it checked out.

**Contributing:** [`CONTRIBUTING.md`](CONTRIBUTING.md) · **Public posture:** [`docs/PUBLIC.md`](docs/PUBLIC.md)

---

# uDOS-groovebox (product)

## Purpose

Pattern-first music sequencing, transport bridges, and portable composition
artifacts for uDos.

## Ownership

- groovebox pattern structures and library shape
- transport bridge surfaces between Songscribe and pattern data
- portable sequencing examples, exports, and music-oriented config
- local-first composition workflows that do not require a network runtime

## Non-Goals

- canonical shell command ownership
- Wizard API or provider ownership
- DAW-grade audio workstation UI ownership
- canonical runtime semantics that belong in `uDOS-core`

## Spine

- `app/`
- `containers/`
- `src/`
- `docs/`
- `tests/`
- `scripts/`
- `config/`
- `examples/`

## Local Development

Keep musical artifacts text-first, deterministic, and portable across shell,
Wizard, and local export tooling.

## Family Relation

Groovebox should own composition and pattern artifacts that Shell and Wizard
can consume without inheriting sequencing ownership. Songscribe bridges may live
here, while shell command routing remains outside this repo.

The current MVP includes:

- a local web UI for workspace browsing, pattern-library import/save, and
  markdown-driven sequencing, including multi-bar step patterns and automation
  lanes
- visual composer editing for section-local phrase cells, automation lanes,
  arrangement repeats, transition tags, and timeline-aware section switching,
  with markdown kept in sync through a dedicated `groovebox-sections` fence
- backend-generated transport events, phrase semantics, song-mode arrangement,
  and Web Audio playback preview
- MIDI JSON inspection plus file-producing `.mid` and `.wav` exports under
  `sessions/exports/`
- stereo WAV rendering with instrument-aware panning and transition-shaped dynamics
- plain-text notation export for phrase review and diffable arrangement output
- MusicXML export for structured notation interchange
- MML export for text-first sequence interchange
- a Songscribe container lane under `containers/songscribe/`
- binder and vault workspace browsing through checked-in config

## Node workspace (optional)

Root `package.json` defines **`packages/*`** for future shared UI tokens with
Songscribe. The Groovebox app stays Python/FastAPI; run **`npm install`** only
when developing those packages. See **`docs/groovebox-songscribe-convergence.md`**.

## Product docs

- `docs/product-checklist.md` — release and operator checklist
- `docs/sound-library.md` — pattern library, samples, presets, exports
- `docs/songscribe-contract.md` — Songscribe API and operations
- `docs/docker-posture.md` — when Docker is optional vs required

## Maintainer workflow

- **`AGENTS.md`** — agent / Cursor map · **`DEV.md`** — commands · **`TASKS.md`** — backlog · **`docs/dev/WORKFLOW.md`** — `.local/` / compost discipline

## Activation

The repo activation path is documented in `docs/activation.md`.

Run the current repo validation entrypoint with:

```bash
bash scripts/run-groovebox-checks.sh
```

Run the local UI with:

```bash
bash scripts/run-groovebox-ui.sh
```
