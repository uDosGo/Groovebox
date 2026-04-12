#!/usr/bin/env bash
# PING → SHAKE → PONG — local hygiene for GrooveBox888 (family feeds/spool verbs, repo FILE-TREE pattern).
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

MODE="${1:-all}"

ping() {
  echo "=== PING (inspect) ==="
  git status -sb 2>/dev/null || true
  echo ""
  du -sh .groovebox-local containers/songscribe/repo 2>/dev/null || true
  find . -name '.pytest_cache' -type d 2>/dev/null | head -5 || true
  find . \( -path './.git' -o -path './containers/songscribe/repo' -o -path './node_modules' \) -prune -o -name '__pycache__' -type d -print 2>/dev/null | head -8 || true
}

shake() {
  echo "=== SHAKE (clear ephemeral) ==="
  find . \( -path './.git' -o -path './containers/songscribe/repo' -o -path './node_modules' \) -prune -o -name '.DS_Store' -delete 2>/dev/null || true
  rm -rf .pytest_cache
  find . \( -path './.git' -o -path './containers/songscribe/repo' -o -path './node_modules' \) -prune -o -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
  echo "Caches cleared (not removing containers/songscribe/repo or .groovebox-local — use compost or manual rm)."
}

pong() {
  echo "=== PONG (verify) ==="
  bash "$REPO_ROOT/scripts/run-groovebox-checks.sh"
}

case "$MODE" in
  ping) ping ;;
  shake) shake ;;
  pong) pong ;;
  all) ping; echo ""; shake; echo ""; pong ;;
  *) echo "usage: $0 [ping|shake|pong|all]" >&2; exit 2 ;;
esac
