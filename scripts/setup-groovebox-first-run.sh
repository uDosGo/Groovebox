#!/usr/bin/env bash
# First-time Groovebox setup: clone Songscribe upstream into containers/songscribe/repo.
# Idempotent: safe to re-run (setup-songscribe.sh refreshes an existing clone).

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Groovebox first-run: preparing Songscribe clone..." >&2
bash "$REPO_ROOT/scripts/setup-songscribe.sh"
bash "$REPO_ROOT/scripts/apply-songscribe-groovebox-overrides.sh"
echo "Groovebox first-run: Songscribe path ready at containers/songscribe/repo" >&2
echo "For stem isolation: copy containers/songscribe/env.local.example to repo/.env.local and run songscribe-api." >&2
echo "Start the app with: bash scripts/run-groovebox-ui.sh" >&2
