#!/usr/bin/env bash
# check-spool-schema.sh — Validates Groovebox spool events against uCore SPOOL_SPEC contract.
# Usage: bash scripts/check-spool-schema.sh
# Exit 0 = all events valid, Exit 1 = schema drift detected.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPOOL_FILE="$REPO_ROOT/sessions/spool/groovebox-events.jsonl"
ERRORS=0

echo "=== Groovebox Spool Schema Check ==="
echo ""

# Required fields per uCore SPOOL_SPEC
REQUIRED_FIELDS=("timestamp" "module" "level" "message" "tags")
VALID_LEVELS=("debug" "info" "warn" "error")

if [[ ! -f "$SPOOL_FILE" ]]; then
  echo "✅ No spool file found — nothing to check (this is OK for fresh repos)"
  exit 0
fi

echo "📄 Checking: $SPOOL_FILE"
echo ""

LINE_NUM=0
while IFS= read -r line; do
  LINE_NUM=$((LINE_NUM + 1))
  if [[ -z "$line" ]]; then
    continue
  fi

  # Validate JSON
  if ! echo "$line" | python3 -m json.tool > /dev/null 2>&1; then
    echo "❌ Line $LINE_NUM: Invalid JSON"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Check required fields
  for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$line" | python3 -c "import sys,json; d=json.load(sys.stdin); assert '$field' in d" 2>/dev/null; then
      echo "❌ Line $LINE_NUM: Missing required field '$field'"
      ERRORS=$((ERRORS + 1))
    fi
  done

  # Validate level
  LEVEL=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin).get('level',''))" 2>/dev/null)
  if [[ -n "$LEVEL" ]]; then
    VALID=false
    for vl in "${VALID_LEVELS[@]}"; do
      [[ "$LEVEL" == "$vl" ]] && VALID=true
    done
    if [[ "$VALID" == false ]]; then
      echo "❌ Line $LINE_NUM: Invalid level '$LEVEL' (must be one of: ${VALID_LEVELS[*]})"
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # Validate tags is array
  if ! echo "$line" | python3 -c "import sys,json; d=json.load(sys.stdin); assert isinstance(d.get('tags'), list)" 2>/dev/null; then
    echo "❌ Line $LINE_NUM: 'tags' must be an array"
    ERRORS=$((ERRORS + 1))
  fi

done < "$SPOOL_FILE"

echo ""
echo "=== Results ==="
echo "Lines checked: $LINE_NUM"
echo "Errors found:  $ERRORS"
echo ""

if [[ $ERRORS -gt 0 ]]; then
  echo "❌ Schema drift detected! $ERRORS validation error(s)."
  exit 1
else
  echo "✅ All spool events conform to uCore SPOOL_SPEC."
  exit 0
fi