# Sessions

This directory holds Groovebox session artifacts owned by this repo. Canonical
layout is documented in [docs/sound-library.md](../docs/sound-library.md).

- `compiled/` — compiled markdown-to-pattern session snapshots (`/api/sessions/save`)
- `exports/` — generated files: `.mid`, `.wav`, `.musicxml`, `.mml.txt`, `.notation.txt`
- `patterns/` — pattern JSON saved from the UI (`/api/patterns/save`)

Checked-in demos may appear under `compiled/` for validation. Export and
session JSON under `exports/` and `patterns/` are **operator-generated**; commit
only what you intend to share (they are not in `.gitignore` by default).
