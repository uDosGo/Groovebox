# Getting Started

1. Read `docs/README.md`.
2. Run the repo checks.
3. Run the local UI (first launch clones Songscribe automatically — see below).
4. Inspect the seeded artifacts.

## First-run install (Songscribe)

The upstream Songscribe app is **not** committed; it is cloned into
`containers/songscribe/repo` on first use.

**Automatic:** `bash scripts/run-groovebox-ui.sh` runs
`scripts/setup-groovebox-first-run.sh` once (tracked by `.groovebox-local/first-run-complete`).
Set `GROOVEBOX_SKIP_FIRST_RUN=1` to skip if you manage the clone yourself.

**Manual:** `bash scripts/setup-groovebox-first-run.sh`

On startup, the script tries **`docker compose up -d`** for Songscribe when Docker
is available. If Docker is missing or compose fails, the terminal prints commands
to run Songscribe with Docker or `run-songscribe-ui.sh`; the Groovebox UI shows
the same hint in a banner. Set `GROOVEBOX_AUTO_SONGSCRIBE_DOCKER=0` to never
invoke compose from this script.

## Validate The Repo

Run:

```bash
bash scripts/run-groovebox-checks.sh
```

## Run The Local UI

```bash
bash scripts/run-groovebox-ui.sh
```

The local UI is a **single-column** shell. Use the top nav (or URLs
`#composer`, `#vault`, `#library`, `#overview`) to switch pages: **Compose**
(full spec + composer + markdown + playback), **Vault** (workspace file tree),
**Library** (pattern catalogue), **Status** (Songscribe/workspace summary).

The local UI now supports:

- selecting a phrase brush and clicking cells to stamp step symbols
- selecting an automation brush and clicking cells to stamp lane values
- dragging across cells to paint phrase and automation values
- transforming phrase lanes with `Invert` and `Randomize`
- transforming automation lanes with `Smooth`, `Flatten`, and `Randomize`
- editing arrangement sections and repeat counts from the Composer panel
- assigning section transitions and deriving fill sections from the arrangement editor
- inspecting the expanded song form from the arrangement timeline strip
- exporting MusicXML from the same pattern and timeline data used for playback
- rendering stereo WAV output with transition-aware dynamics and instrument panning
- switching the active Composer section to edit section-local track content
- duplicating, clearing, and filling tracks from Composer actions
- undoing and redoing Composer edits from buttons or standard shortcuts
- keeping the markdown spec synchronized with visual edits

## Inspect The Seeded Artifacts

- `src/pattern-library.json` for the canonical checked-in pattern library shape
- `src/songscribe-bridge.json` for the text-to-pattern bridge surface
- `examples/basic-pattern.json` for the smallest standalone pattern example
- `examples/two-bar-pattern.json` for the first extended multi-bar example
- `examples/basic-songscribe-pattern.json` for a bridge-backed example
- `docs/reference-notes.md` for the archived v1 sources that informed this repo
- `config/workspaces.json` for the binder and vault roots exposed in the file browser
- `containers/songscribe/` for the Songscribe clone and container lane

## Phrase Symbols

- `x` regular hit
- `X` accented hit
- `o` ghost hit
- `=` extend the previous active step
- `^` raised phrase note
- `v` lowered phrase note

## Automation Lanes

Track automation uses extra markdown bullets with a dotted lane name, for
example:

```md
- bass.cutoff: 56789ABC|89ABCDEF
- bass.level: BBBBAAAA|88889999
```

Supported lanes today are `cutoff`, `resonance`, `level`, and `pan`. Values
use single hex-style symbols (`0` through `F`) mapped across a 0.0 to 1.0
range, with `.` holding the previous value.

For MIDI export, these lanes currently map to:

- `cutoff` -> CC 74
- `resonance` -> CC 71
- `level` -> CC 7
- `pan` -> CC 10

## Arrangement

Song mode is declared in frontmatter with an `arrangement` line:

```md
---
bars: 2
arrangement: intro*1@lift, verse*2@drop, outro*1@fill
---
```

Arrangement now expands the song timeline with real section-local phrase and
automation content, so playback and exports follow the actual section sequence
instead of repeating one shared loop.

Section entries can carry an optional transition suffix with `@cut`, `@lift`,
`@drop`, or `@fill`. The Composer exposes the same field in the arrangement
editor and uses it in the timeline strip plus notation, MusicXML, and export
metadata.

WAV rendering now follows those same transitions too: `lift`, `drop`, and
`fill` shape brightness and dynamics during offline render, and the renderer
uses simple instrument-aware stereo placement instead of a mono sketch mix.

Section-local track material is carried in a dedicated fenced block that the
Composer maintains automatically:

~~~md
```groovebox-sections
{
  "sections": [
    { "label": "intro", "tracks": [...] },
    { "label": "verse", "tracks": [...] }
  ]
}
```
~~~

That fence lets save/load/export round-trip distinct phrase and automation
content per arrangement section instead of flattening everything back into one
shared loop.
