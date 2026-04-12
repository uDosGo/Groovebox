# uDOS-groovebox Architecture

`uDOS-groovebox` is the public sequencing lane for music-oriented artifacts in
the uDOS family.

## Core Model

- pattern libraries are stored as plain JSON so they can be read by shell,
  Wizard, and local tooling without binary coupling
- Songscribe bridges describe how text notation becomes Groovebox-ready pattern
  structures
- examples stay export-oriented and local-first so composition data remains
  portable across environments
- a local FastAPI surface serves static **browser UI** assets (`app/static/`),
  spec parser, pattern library APIs, playback transport preview, MIDI JSON
  inspection, and file export lanes; the UI is a **single-column** shell with
  hash routes (**Compose**, **Vault**, **Library**, **Status**)
- workspace browsing is bounded to configured `vault` and `binder` roots rather
  than the whole family filesystem (tree on **Vault**; editing on **Compose**)

## Dependency Direction

- `uDOS-groovebox` may consume `uDOS-core` contracts and stable family docs
- Shell and broker or execution layers may consume Groovebox pattern surfaces
- `uDOS-groovebox` must not own shell commands, provider routing, or network
  transport policy

## Archived v1 Signals

The archived v1 codebase carried Groovebox as a module with:

- a pattern store under `modules/groovebox/store.py`
- Songscribe transport bridging via Wizard routes
- a service registry hook for Groovebox sequencing and export engines

This v2 repo keeps those ideas while narrowing the public surface to checked-in
pattern definitions, bridge contracts, validation artifacts, and a minimal local
operator UI.

## Product references

- Pattern catalogue, samples, presets, and export paths: [sound-library.md](sound-library.md)
- Songscribe HTTP contract and operator flow: [songscribe-contract.md](songscribe-contract.md)
- Release checklist: [product-checklist.md](product-checklist.md)
