# Archived Reference Notes

These are the most useful archived v1 reference surfaces found while
reconstructing `uDOS-groovebox` as a standalone v2 repo.

## Strongest References

- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/modules/groovebox/manifest.json`
  defines Groovebox as a "Music Production Engine"
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/modules/groovebox/container.json`
  shows the old container contract, repo path, and service-interface shape
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/modules/groovebox/store.py`
  gives the clearest concrete v1 pattern-store behavior
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/config/catalog/library/songscribe/README-ARCHITECTURE.md`
  contains the deepest Groovebox-adjacent documentation, especially on
  Songscribe conversion, export formats, and bidirectional sync
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/config/catalog/library/songscribe/README.md`
  documents the user-facing Songscribe to Groovebox workflow
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/config/catalog/library/README.md`
  captures the high-level `Audio -> Songscribe -> MIDI -> Groovebox -> MML`
  pipeline
- `uDOS-dev/@dev/archive-imports/v1/uDOS-v1-8-archived/wizard/web/templates/catalog.html`
  shows there was also a Groovebox sound-pack catalog UI surface

## What The Archive Clearly Supports

- Groovebox was treated as a standalone music-production or sequencing engine
- pattern storage existed as plain JSON under memory-backed paths
- Songscribe integration was a first-class bridge, including parse, render, and
  pattern conversion routes
- Groovebox participated in export-oriented workflows such as MIDI and MML
- a sound-pack or sound-catalog concept existed alongside the sequencer itself

## What Is Still Missing

- a single Groovebox-only architecture document for the full product surface
- a v2-native ownership split between sequencing, exports, shell commands, and
  Wizard APIs
- a clean standalone contract for pattern schema, sound packs, and export lanes

This v2 repo scaffold therefore uses the archived references as signals, not as
an exact structure to copy forward.
