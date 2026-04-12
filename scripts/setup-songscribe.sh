#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$REPO_ROOT/containers/songscribe/repo"
# Default: family fork (override for upstream OSS, e.g. gabe-serna/songscribe.git)
SONGSCRIBE_REPO_URL="${SONGSCRIBE_REPO_URL:-https://github.com/fredporter/songscribe.git}"

mkdir -p "$(dirname "$TARGET_DIR")"

if [ ! -d "$TARGET_DIR/.git" ]; then
  git clone --depth 1 "$SONGSCRIBE_REPO_URL" "$TARGET_DIR"
else
  git -C "$TARGET_DIR" fetch --depth 1 origin main
  git -C "$TARGET_DIR" checkout main
  git -C "$TARGET_DIR" reset --hard origin/main
fi

echo "Songscribe ready at $TARGET_DIR (clone URL: $SONGSCRIBE_REPO_URL)"
