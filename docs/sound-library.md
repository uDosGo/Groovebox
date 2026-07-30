---
title: "Sound library and artifact paths"
status: draft
last_updated: 2026-04-13T01:20:28+10:00
category: documentation
tags: [groovebox]
description: "This document is the **canonical map** for pattern metadata, samples, presets,"
---
# Sound library and artifact paths

This document is the **canonical map** for pattern metadata, samples, presets,
and where **audio-related outputs** land. It satisfies the “local browsable
sound library” and “stable locations” requirements for the **Groovebox**
product lane.

**Sonic alignment:** cataloguing and on-disk layout follow the same **`~/.udos/`**
family contract as **SonicScrewdriver** (see [`GROOVEBOX_SONIC_SOUND_CATALOG.md`](GROOVEBOX_SONIC_SOUND_CATALOG.md), [`DISTRIBUTION.md`](DISTRIBUTION.md)). Sonic’s **device database** (`~/.udos/sonic/device.db`) tracks **hardware**; Groovebox JSON + optional library roots track **sound sets** — complementary, not merged into SQLite yet.

## Pattern library (catalogue + documents)

| Role | Path | Notes |
| --- | --- | --- |
| **Library index** | `src/pattern-library.json` | Versioned catalogue: `pattern_id`, names, tempo hints, export hints. **Product:** Groovebox · **index `owner` field:** `uDOS-groovebox` (stable wire id). Validated by `scripts/run-groovebox-checks.sh`. |
| **Seed pattern JSON** | `examples/*.json` | Checked-in demos; merged into the library view with `scope: seed`. |
| **Session-saved patterns** | `sessions/patterns/*.json` | Created when the operator saves from the UI (`/api/patterns/save`). `scope: session` in API summaries. |

**Browsing:**

- **HTTP:** `GET /api/patterns` returns the merged library; `GET /api/patterns/{pattern_id}` returns the document + compiled + playback preview.
- **UI:** **Library** page (`#library`) loads the same API and lists availability per pattern.

Implementation reference: `app/pattern_library.py`.

## Sample bank and synth presets (sound metadata)

| Role | Path | Notes |
| --- | --- | --- |
| **Sample / drum metadata** | `src/sample-bank.json` | `bank_type: sample-bank`, `kits` list — URLs or logical names consumed by playback/export paths. |
| **Synth preset metadata** | `src/synth-presets.json` | `preset_type: synth-bank`, `presets` list for instrument lanes. |

These files are the **stable, diffable** sound-library layer: add kits and
presets here rather than hard-coding only inside Python. Playback code resolves
them when building preview and WAV output.

### Audio “drivers” (playback engines)

| Layer | Role | Status |
| --- | --- | --- |
| **Web Audio synthesis** | Built-in oscillators / noise for **synthetic-web-audio** kits | **Current** browser preview path |
| **Sample files** | WAV/FLAC under `GROOVEBOX_AUDIO_ROOT` / `~/.udos/library/groovebox/samples/` | **Operator-staged**; wire-up per kit `mode` (see `src/sample-bank.json`) |
| **SFZ / open instruments** | Text SFZ + samples ([sfzformat.com](https://sfzformat.com/)) | **Planned** — FOSS-friendly |
| **Native plugin hosts** (CLAP/VST) | Desktop lane for DAW-style plugins | **Out of scope** for browser UI; reserved under `plugins/` in distribution docs |

### Plugin and sample **resources** (free / open-source first)

Prefer **FOSS** and **clearly licensed** material:

- **Drum machines (style tags):** `808-style`, `909-style`, **groovebox-style** (303/404 *character* — educational naming; do not ship trademarked ROMs).
- **Chiptune / video-game era:** `nes-style`, `c64-style`, `arcade` — use royalty-safe or synthetic sources.
- **Metadata:** every downloadable pack should record **`source.license`** (SPDX or CC label) and optional **`source.url`**.

Kits in `src/sample-bank.json` may include optional **`lineage`**, **`source`**, and **`sonic.tags`** fields for filtering and Sonic-family crosswalk — see [`GROOVEBOX_SONIC_SOUND_CATALOG.md`](GROOVEBOX_SONIC_SOUND_CATALOG.md). The required kit field **`mode`** selects the playback path (e.g. `synthetic-web-audio`).

### Large library on disk (retrieval)

| Priority | Location |
| --- | --- |
| 1 | **`GROOVEBOX_AUDIO_ROOT`** if set (absolute path) |
| 2 | **`$UDOS_LIBRARY_DIR/groovebox/`** when aligned with Sonic ([`DISTRIBUTION.md`](DISTRIBUTION.md)) |
| 3 | In-repo **`src/`** JSON only (small, diffable) |

Retrieval for playback is **kit id → resolve path / synthetic**; cataloguing mirrors **Sonic-style** explicit paths under the family library root.

## Markdown project capture

| Role | Path | Notes |
| --- | --- | --- |
| **Groovebox markdown spec** | Operator-chosen files under configured **vault** / **binder** roots | Picked in **Vault** (`#vault`); edited on **Compose** (`#composer`). Roots: `config/workspaces.json`. Spec uses `groovebox-sections` and related fences per [getting-started.md](getting-started.md). |
| **Compiled session snapshot** | `sessions/compiled/*.json` | Saved via `/api/sessions/save`; includes `saved_at` metadata. |
| **Demo compiled session** | `sessions/compiled/demo-groovebox-session.json` | Checked-in reference shape. |

Markdown is the **project** format; JSON under `sessions/compiled/` is a
**derived** snapshot for reload and tooling.

## File exports (audio and notation)

| Output | Path | API |
| --- | --- | --- |
| **MIDI file** | `sessions/exports/{pattern_id}.mid` | `POST /api/exports/midi/file` |
| **Stereo WAV** | `sessions/exports/{pattern_id}.wav` | `POST /api/exports/wav/file` |
| **Plain notation** | `sessions/exports/{pattern_id}.notation.txt` | `POST /api/exports/notation/file` |
| **MML text** | `sessions/exports/{pattern_id}.mml.txt` | `POST /api/exports/mml/file` |
| **MusicXML** | `sessions/exports/{pattern_id}.musicxml` | `POST /api/exports/musicxml/file` |

All writes go through `app/export_store.py` → `sessions/exports/` (directory
created on demand).

## Workspace roots (browsing family trees)

`config/workspaces.json` lists `roots` with `id`, `label`, `path`, `kind`
(`vault` | `binder`). Paths may use `${family_root}/...`; resolution is
`app/workspaces.py` (repo parent directory = family root).

If the config file is missing, the app **discovers** `vault/` and `binder/`
folders under each immediate child of the family root (same parent as the
Groovebox / `~/Code/` sibling layout).

## Related

- [GROOVEBOX_SONIC_SOUND_CATALOG.md](GROOVEBOX_SONIC_SOUND_CATALOG.md) — Sonic device DB crosswalk
- [DISTRIBUTION.md](DISTRIBUTION.md) — packaging next to Sonic / USB
- [product-checklist.md](product-checklist.md)
- [songscribe-contract.md](songscribe-contract.md)
