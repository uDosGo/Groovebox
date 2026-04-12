# Cursor completion — GrooveBox888

Before merging a substantive change:

1. **`bash scripts/run-groovebox-checks.sh`** exits 0.
2. **`python3 -m unittest`** — covered by the script; fix failures in `tests/`.
3. If you touched static assets, smoke **`bash scripts/run-groovebox-ui.sh`** and load Compose + Vault in the browser.
4. If you changed Songscribe integration, confirm **`/api/songscribe/status`** and optional **`scripts/run-songscribe-ui.sh`** when relevant.

## Docs

- User-facing reference stays under **`docs/`**; workflow-only files stay under **`docs/dev/`**.
