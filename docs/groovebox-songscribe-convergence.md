# Groovebox ↔ Songscribe convergence (UI, library, rights)

This document frames **intended** integration work. It is a roadmap, not a
promise of current behaviour.

## Shared UI and Node in this repo

**Today:** Groovebox operator UI is **static HTML/CSS/JS** + **FastAPI**;
Songscribe is **Next.js + React** in `containers/songscribe/repo` (cloned,
gitignored).

**Direction:** Introduce a **small Node workspace** at the Groovebox repo root
(`package.json` + `packages/*`) so we can:

1. **Share design tokens** — CSS variables / Tailwind preset aligned with
   Songscribe’s stack (shadcn/Tailwind) without forking all of Songscribe.
2. **Embed or route** — Options (pick one per release):
   - **A.** Groovebox **iframe** or **new tab** only (current baseline).
   - **B.** Next.js **app route** in a forked or extended Songscribe tree that
     loads Groovebox static assets or calls Groovebox APIs.
   - **C.** New **`apps/groovebox-web`** (Next or Vite) that consumes FastAPI and
     reuses `packages/ui-*` components.

**Composer UX goal:** **Viewport-centred**, **above-the-fold** focus for
markdown / music code — fewer chrome distractions; align spacing, typography,
and panel rhythm with Songscribe’s centred layout patterns.

**Packages (scaffold):** see repo-root `package.json` and `packages/design-tokens/`.

## Sample library and uDOS feed / spool

Songscribe/Groovebox need an **offline-first sample and sound library** with:

- **Ingest** — mostly free, some paid, and open-source sources (user-configured
  allowlists / blocklists).
- **Control** — operator chooses what to fetch, retain, and delete; no silent
  “phone home” beyond configured sources.
- **Storage** — local paths under operator control (e.g. beside `~/.udos/` or
   repo `sessions/` / vault-adjacent dirs), compatible with **portable** Groovebox
   sessions.

**Alignment with family spool thinking:** see
`uDOS-dev/@dev/notes/candidates/logs-feeds-spool-family-candidate.md` and
`uDOS-core` docs on feeds/spool. A **music sample spool** is a specialised
instance of:

`ingest → classify → spool → transform → emit`

where **emit** might mean “register in `sample-bank.json`” or “expose to
Groovebox playback engine”.

**Not in scope yet:** a running crawler in this repo; first deliverable is
**contract + folder layout + policy hooks** (future: binder-tagged ingest jobs).

## Authoring and historical frontmatter (rights / provenance)

Rudimentary **YAML frontmatter** (or parallel `.meta.json`) for each collected
asset and for composed Groovebox specs:

| Field (example) | Purpose |
| --- | --- |
| `source_url` | Where the asset was obtained |
| `license` | SPDX or short label (`CC0`, `CC-BY`, `proprietary`, …) |
| `attribution` | Human-readable credit line |
| `ingested_at` | ISO timestamp |
| `inspiration_note` | Link to original work / idea (not necessarily a download) |
| `rights_restriction` | e.g. `no-redistribution`, `personal-only` |

Groovebox markdown specs already use frontmatter for tempo/bars; **extend** with
optional `sample_refs` / `provenance` blocks as the library lands.

## Immediate operator checklist

1. Stem isolation: [songscribe-isolate-audio.md](songscribe-isolate-audio.md)  
2. Songscribe API: run **songscribe-api** + `.env.local`  
3. After upstream pull: `bash scripts/apply-songscribe-groovebox-overrides.sh`  
