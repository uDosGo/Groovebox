#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

require_file() {
  if [ ! -f "$1" ]; then
    echo "missing required file: $1" >&2
    exit 1
  fi
}

cd "$REPO_ROOT"

require_file "$REPO_ROOT/README.md"
require_file "$REPO_ROOT/docs/architecture.md"
require_file "$REPO_ROOT/docs/boundary.md"
require_file "$REPO_ROOT/docs/getting-started.md"
require_file "$REPO_ROOT/docs/examples.md"
require_file "$REPO_ROOT/docs/activation.md"
require_file "$REPO_ROOT/docs/product-checklist.md"
require_file "$REPO_ROOT/docs/sound-library.md"
require_file "$REPO_ROOT/docs/songscribe-contract.md"
require_file "$REPO_ROOT/docs/songscribe-isolate-audio.md"
require_file "$REPO_ROOT/docs/songscribe-health-probes.md"
require_file "$REPO_ROOT/docs/groovebox-songscribe-convergence.md"
require_file "$REPO_ROOT/docs/docker-posture.md"
require_file "$REPO_ROOT/package.json"
require_file "$REPO_ROOT/packages/design-tokens/package.json"
require_file "$REPO_ROOT/app/__init__.py"
require_file "$REPO_ROOT/app/main.py"
require_file "$REPO_ROOT/app/bootstrap_status.py"
require_file "$REPO_ROOT/app/patterns.py"
require_file "$REPO_ROOT/app/spec_parser.py"
require_file "$REPO_ROOT/app/playback.py"
require_file "$REPO_ROOT/app/session_store.py"
require_file "$REPO_ROOT/app/workspaces.py"
require_file "$REPO_ROOT/app/songscribe.py"
require_file "$REPO_ROOT/app/songscribe_docker.py"
require_file "$REPO_ROOT/app/static/index.html"
require_file "$REPO_ROOT/app/static/groovebox-ui.css"
require_file "$REPO_ROOT/app/static/groovebox-ui.js"
require_file "$REPO_ROOT/containers/songscribe/README.md"
require_file "$REPO_ROOT/containers/songscribe/container.json"
require_file "$REPO_ROOT/containers/songscribe/docker-compose.yml"
require_file "$REPO_ROOT/containers/songscribe/env.local.example"
require_file "$REPO_ROOT/containers/songscribe/overrides/utils/isolateAudio.ts"
require_file "$REPO_ROOT/containers/songscribe/overrides/patches/001-audioform-isolation-errors.patch"
require_file "$REPO_ROOT/src/README.md"
require_file "$REPO_ROOT/src/pattern-library.json"
require_file "$REPO_ROOT/src/sample-bank.json"
require_file "$REPO_ROOT/src/synth-presets.json"
require_file "$REPO_ROOT/src/songscribe-bridge.json"
require_file "$REPO_ROOT/src/songscribe-request.json"
require_file "$REPO_ROOT/scripts/README.md"
require_file "$REPO_ROOT/tests/README.md"
require_file "$REPO_ROOT/scripts/run-groovebox-ui.sh"
require_file "$REPO_ROOT/scripts/run-songscribe-ui.sh"
require_file "$REPO_ROOT/scripts/setup-songscribe.sh"
require_file "$REPO_ROOT/scripts/setup-groovebox-first-run.sh"
require_file "$REPO_ROOT/scripts/apply-songscribe-groovebox-overrides.sh"
require_file "$REPO_ROOT/scripts/verify-songscribe-health-probes.sh"
require_file "$REPO_ROOT/scripts/verify-songscribe-runtime-non-docker.sh"
require_file "$REPO_ROOT/scripts/verify-songscribe-compose-compat.sh"
require_file "$REPO_ROOT/config/README.md"
require_file "$REPO_ROOT/config/workspaces.json"
require_file "$REPO_ROOT/examples/README.md"
require_file "$REPO_ROOT/examples/basic-pattern.json"
require_file "$REPO_ROOT/examples/basic-songscribe-pattern.json"
require_file "$REPO_ROOT/examples/compiled-demo-pattern.json"
require_file "$REPO_ROOT/examples/two-bar-pattern.json"
require_file "$REPO_ROOT/examples/demo-groovebox.md"
require_file "$REPO_ROOT/sessions/README.md"
require_file "$REPO_ROOT/sessions/compiled/README.md"
require_file "$REPO_ROOT/sessions/exports/README.md"
require_file "$REPO_ROOT/sessions/compiled/demo-groovebox-session.json"
require_file "$REPO_ROOT/tests/test_app_api.py"

python3 - <<'PY'
import json
from pathlib import Path

repo_root = Path(".").resolve()
library = json.loads((repo_root / "src" / "pattern-library.json").read_text(encoding="utf-8"))
sample_bank = json.loads((repo_root / "src" / "sample-bank.json").read_text(encoding="utf-8"))
synth_presets = json.loads((repo_root / "src" / "synth-presets.json").read_text(encoding="utf-8"))
bridge = json.loads((repo_root / "src" / "songscribe-bridge.json").read_text(encoding="utf-8"))
bridge_request = json.loads((repo_root / "src" / "songscribe-request.json").read_text(encoding="utf-8"))
pattern = json.loads((repo_root / "examples" / "basic-pattern.json").read_text(encoding="utf-8"))
songscribe_pattern = json.loads((repo_root / "examples" / "basic-songscribe-pattern.json").read_text(encoding="utf-8"))
compiled_pattern = json.loads((repo_root / "examples" / "compiled-demo-pattern.json").read_text(encoding="utf-8"))
two_bar_pattern = json.loads((repo_root / "examples" / "two-bar-pattern.json").read_text(encoding="utf-8"))

for name, payload in {
    "src/pattern-library.json": library,
    "src/sample-bank.json": sample_bank,
    "src/synth-presets.json": synth_presets,
    "src/songscribe-bridge.json": bridge,
    "src/songscribe-request.json": bridge_request,
}.items():
    missing = sorted({"version", "owner"} - payload.keys())
    if missing:
        raise SystemExit(f"{name} missing required fields: {missing}")

if library.get("library_type") != "pattern-library":
    raise SystemExit("src/pattern-library.json library_type must be pattern-library")
if library.get("owner") != "uDOS-groovebox":
    raise SystemExit("src/pattern-library.json owner must be uDOS-groovebox")
if not isinstance(library.get("exports"), list) or len(library["exports"]) < 3:
    raise SystemExit("src/pattern-library.json exports must list at least midi, wav, and notation")
if not isinstance(library.get("patterns"), list) or not library["patterns"]:
    raise SystemExit("src/pattern-library.json patterns must be a non-empty list")
if sample_bank.get("bank_type") != "sample-bank":
    raise SystemExit("src/sample-bank.json bank_type must be sample-bank")
if not isinstance(sample_bank.get("kits"), list) or not sample_bank["kits"]:
    raise SystemExit("src/sample-bank.json kits must be a non-empty list")
if synth_presets.get("preset_type") != "synth-bank":
    raise SystemExit("src/synth-presets.json preset_type must be synth-bank")
if not isinstance(synth_presets.get("presets"), list) or not synth_presets["presets"]:
    raise SystemExit("src/synth-presets.json presets must be a non-empty list")

if bridge.get("bridge_type") != "songscribe-pattern-bridge":
    raise SystemExit("src/songscribe-bridge.json bridge_type must be songscribe-pattern-bridge")
if bridge.get("output_format") != "groovebox-pattern":
    raise SystemExit("src/songscribe-bridge.json output_format must be groovebox-pattern")
if "transport-bridge" not in bridge.get("supported_modes", []):
    raise SystemExit("src/songscribe-bridge.json must support transport-bridge")
if bridge_request.get("request_type") != "songscribe-bridge-request":
    raise SystemExit("src/songscribe-request.json request_type must be songscribe-bridge-request")

required_pattern = {"pattern_id", "name", "tempo", "tracks", "owner"}
for name, payload in {
    "examples/basic-pattern.json": pattern,
    "examples/basic-songscribe-pattern.json": songscribe_pattern,
    "examples/two-bar-pattern.json": two_bar_pattern,
}.items():
    missing = sorted(required_pattern - payload.keys())
    if missing:
        raise SystemExit(f"{name} missing required fields: {missing}")
    if payload.get("owner") != "uDOS-groovebox":
        raise SystemExit(f"{name} owner must be uDOS-groovebox")
    tracks = payload.get("tracks")
    if not isinstance(tracks, list) or not tracks:
        raise SystemExit(f"{name} tracks must be a non-empty list")
    bars = int(payload.get("bars", 1))
    steps_per_bar = int(payload.get("steps_per_bar", 16))
    expected_steps = bars * steps_per_bar
    for track in tracks:
        if not {"track_id", "instrument", "steps"}.issubset(track):
            raise SystemExit(f"{name} tracks must include track_id, instrument, and steps")
        steps = track["steps"]
        if not isinstance(steps, list) or len(steps) != expected_steps:
            raise SystemExit(f"{name} tracks must use {expected_steps}-step arrays")
        if not all(step in (0, 1) for step in steps):
            raise SystemExit(f"{name} step arrays must contain only 0 or 1")
        automation = track.get("automation", {})
        if automation:
            if not isinstance(automation, dict):
                raise SystemExit(f"{name} track automation must be an object")
            for lane_name, lane_values in automation.items():
                if not isinstance(lane_values, list) or len(lane_values) != expected_steps:
                    raise SystemExit(f"{name} automation lane {lane_name} must use {expected_steps} values")

if two_bar_pattern.get("bars") != 2 or two_bar_pattern.get("steps_per_bar") != 16:
    raise SystemExit("examples/two-bar-pattern.json must declare 2 bars with 16 steps per bar")

if songscribe_pattern.get("songscribe", {}).get("bridge_owner") != "uDOS-groovebox":
    raise SystemExit("examples/basic-songscribe-pattern.json songscribe.bridge_owner must be uDOS-groovebox")
if compiled_pattern.get("schema") != "udos-groovebox-pattern/v0":
    raise SystemExit("examples/compiled-demo-pattern.json schema must be udos-groovebox-pattern/v0")
PY

python3 -m unittest tests/test_groovebox_examples.py
python3 -m unittest tests/test_app_api.py
bash "$REPO_ROOT/scripts/verify-songscribe-health-probes.sh"
bash "$REPO_ROOT/scripts/verify-songscribe-runtime-non-docker.sh"
bash "$REPO_ROOT/scripts/verify-songscribe-compose-compat.sh"

if command -v rg >/dev/null 2>&1; then
  if rg -n '/Users/fredbook/Code|~/Users/fredbook/Code' \
    "$REPO_ROOT/README.md" \
    "$REPO_ROOT/docs" \
    "$REPO_ROOT/app" \
    "$REPO_ROOT/src" \
    "$REPO_ROOT/tests" \
    "$REPO_ROOT/examples" \
    "$REPO_ROOT/config"; then
    echo "private local-root reference found in uDOS-groovebox" >&2
    exit 1
  fi
else
  if grep -R -nE '/Users/fredbook/Code|~/Users/fredbook/Code' \
    "$REPO_ROOT/README.md" \
    "$REPO_ROOT/docs" \
    "$REPO_ROOT/src" \
    "$REPO_ROOT/tests" \
    "$REPO_ROOT/examples" \
    "$REPO_ROOT/config" >/dev/null 2>&1; then
    echo "private local-root reference found in uDOS-groovebox" >&2
    exit 1
  fi
fi

echo "uDOS-groovebox checks passed"
