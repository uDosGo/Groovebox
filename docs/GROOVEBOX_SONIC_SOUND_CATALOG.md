---
title: "GrooveBox888 ↔ Sonic device DB — sound catalog alignment"
status: draft
last_updated: 2026-04-13T01:20:28+10:00
category: documentation
tags: [audio, cli, groovebox, sonic]
description: "This document maps **GrooveBox888** sound-library concepts to **Sonic v4** inventory style ([`SONIC_v4_device-databas..."
---
# GrooveBox888 ↔ Sonic device DB — sound catalog alignment

This document maps **GrooveBox888** sound-library concepts to **Sonic v4** inventory style ([`SONIC_v4_device-database`](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/SONIC_v4_device-database.md)) and family **`~/.udos/`** paths ([Sonic `local-artifact-paths.md`](https://github.com/fredporter/SonicScrewdriver/blob/main/docs/local-artifact-paths.md)).

## Mental model

| Sonic (hardware) | GrooveBox888 (sound) |
| --- | --- |
| `devices` rows — one machine | **Sound sets** / **kits** — one logical instrument or drum palette |
| `manufacturer` / `model` | **`lineage.style`** / **`lineage.era`** — *educational* labels (e.g. 808-style drums, 90s groovebox-style), not product endorsements |
| `notes` (operator text) | **`catalog.notes`**, **`license`** / **`source`** fields |
| SQLite `device.db` | **JSON** in-repo (`src/sample-bank.json`, `src/synth-presets.json`) + optional **manifest** under library root |
| Community / provenance | **Free and open-source** samples first; CC0 / CC-BY / SPDX in metadata |

GrooveBox888 does **not** write into `~/.udos/sonic/device.db`. Alignment is **spec / path / tagging** so operators and future tooling can correlate “this laptop (Sonic)” with “this sound bundle (Groovebox)”.

## Library root (family standard)

| Variable / path | Role |
| --- | --- |
| **`UDOS_LIBRARY_DIR`** | Family default: **`$HOME/.udos/library`** (see Sonic docs). |
| **`GROOVEBOX_AUDIO_ROOT`** | Optional override: absolute path where Groovebox stores **large** samples / plugin payloads **outside** the git clone. |
| **Default if unset** | **`$UDOS_LIBRARY_DIR/groovebox/`** — see [`DISTRIBUTION.md`](DISTRIBUTION.md). |

Suggested subfolders under the effective root:

| Path | Contents |
| --- | --- |
| `samples/` | WAV/FLAC/OGG one-shots and loops (regime: user-supplied; prefer FOSS) |
| `sfz/` | [SFZ](https://sfzformat.com/) instruments (open format; free banks common) |
| `presets/` | Groovebox-specific JSON or preset exports |
| `plugins/` | Reserved: **native** plugin hosts (CLAP/VST) — **not** used by the browser UI today; documented for future desktop lane |
| `manifests/` | Optional `catalog.json` listing kits with hashes + licenses |

## Catalog fields (kits / sound sets)

Extend `src/sample-bank.json` kits with optional objects (ignored by minimal playback if absent):

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `lineage.style` | string | `tr-808-style`, `groovebox-303-style`, `chiptune-nes` | Retro / education tags |
| `lineage.era` | string | `1980s`, `1990s`, `8-bit` | For filtering and teaching |
| `source.license` | string | `CC0`, `CC-BY-4.0`, `MIT`, `proprietary` | Required before redistributing a pack |
| `source.url` | string | HTTPS | Where the operator obtained files |
| `sonic.tags` | string[] | `drum-machine`, `video-game`, `analog-model` | Crosswalk to Sonic operator vocabulary |
| `mode` | string | `synthetic-web-audio`, `sample-file`, `sfz` | **Today:** synthetic + sample hooks in app code paths (required on each kit in `sample-bank.json`) |

### Heritage examples (documentation only)

Operators often want **808-style** kicks, **303/404-style** grooves, and **classic video-game** bleeps. Use **style** labels; ship **royalty-clear** or **synthetic** sources only. Trademarked gear names refer to *sonic character*, not bundled proprietary ROMs.

## Retrieval / indexing

1. **In-repo:** `src/sample-bank.json` + `src/synth-presets.json` are the **canonical catalogue** for the open-source tree.
2. **On disk:** optional `manifests/catalog.json` under `GROOVEBOX_AUDIO_ROOT` for large libraries (future: `GET /api/library/manifest` stub).
3. **Sonic CLI:** use `sonic device list` for hardware; use Groovebox **Library** page + vault for projects — correlation is **human** until a shared SQLite bridge is specified.

## Related

- [`sound-library.md`](sound-library.md) — full path map  
- [`DISTRIBUTION.md`](DISTRIBUTION.md) — install next to Sonic / Ventoy USB  
- [`docs/learning/README.md`](learning/README.md) — beginner hub  
