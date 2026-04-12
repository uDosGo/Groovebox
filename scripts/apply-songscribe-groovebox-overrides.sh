#!/usr/bin/env bash
# Apply Groovebox-maintained fixes on top of the cloned Songscribe repo (MIT).
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SONG_ROOT="$REPO_ROOT/containers/songscribe/repo"
OVERRIDES="$REPO_ROOT/containers/songscribe/overrides"

if [ ! -f "$SONG_ROOT/utils/isolateAudio.ts" ]; then
  echo "Songscribe clone missing. Run: bash scripts/setup-songscribe.sh" >&2
  exit 1
fi

echo "Applying Groovebox overlay: utils/isolateAudio.ts" >&2
cp "$OVERRIDES/utils/isolateAudio.ts" "$SONG_ROOT/utils/isolateAudio.ts"

if [ -f "$OVERRIDES/patches/001-audioform-isolation-errors.patch" ]; then
  if grep -q "MISSING_API_BASE" "$SONG_ROOT/app/audio/AudioForm.tsx" 2>/dev/null; then
    echo "AudioForm.tsx already contains Groovebox error hints; skipping patch." >&2
  else
    echo "Applying patch: 001-audioform-isolation-errors.patch" >&2
    (cd "$SONG_ROOT" && patch -p1 -t <"$OVERRIDES/patches/001-audioform-isolation-errors.patch")
  fi
fi

echo "Done. Ensure .env.local exists (see containers/songscribe/env.local.example)." >&2
