# Sound library and artifact paths

This document is the **canonical map** for pattern metadata, samples, presets,
and where **audio-related outputs** land. It satisfies the “local browsable
sound library” and “stable locations” requirements for the Groovebox product
lane.

## Pattern library (catalogue + documents)

| Role | Path | Notes |
| --- | --- | --- |
| **Library index** | `src/pattern-library.json` | Versioned catalogue: `pattern_id`, names, tempo hints, export hints. **Owner:** `uDOS-groovebox`. Validated by `scripts/run-groovebox-checks.sh`. |
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
folders under each immediate child of the family root (same parent as
`uDOS-groovebox`).

## Related

- [product-checklist.md](product-checklist.md)
- [songscribe-contract.md](songscribe-contract.md)
