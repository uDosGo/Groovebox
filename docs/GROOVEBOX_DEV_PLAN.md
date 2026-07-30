---
title: "Groovebox Dev Plan (uCore Integration + Tasker Flow)"
status: active
last_updated: 2026-07-08T12:00:00+10:00
category: planning
tags: [groovebox, ucore, tasker, usx, mcp]
description: "Execution plan for integrating Groovebox with uCore developer tools, tasker dev-flow, USX Vue style kit, skills, and snackbar/MCP surfaces."
---

# Groovebox Dev Plan (2026-07)

This is the active engineering plan for migrating Groovebox onto shared uCore
Developer Tooling conventions while keeping Groovebox local-first and
operator-safe.

## Goals

1. Adopt uCore-style development workflow with tasker as the canonical task lane.
2. Refactor UI toward USX Vue style-kit compatibility and reusable tokens.
3. Integrate uCore Skills and MCP-compatible service entry points.
4. Align Groovebox eventing with snackbar + spool observability patterns.

## Source of Truth

- Task flow model: `../../uCore/.tasker.dev-flow.yaml`
- Dev tools posture: `../../uCore/docs/DEVMODE_CODE_ANALYSIS_SKILLS.md`
- MCP conventions: `../../uCore/docs/MCP_SETUP.md` and `../../uCore/docs/mcp-policy.md`
- Snackbar and spool model: `../../uCore/docs/SNACKS_SYSTEM_SPEC.md`, `../../uCore/docs/SPOOL_SPEC.md`, and `../../uCore/docs/FEED_SYSTEM_SPEC.md`

## Workstream A - uCore Developer Tools Integration

### Scope

- Standardize Groovebox dev commands and diagnostics around the same categories
  used in uCore (analysis, maintenance, workflow, and orchestration).
- Introduce explicit wrappers/hooks for shared services where Groovebox needs
  telemetry, lifecycle control, and quality checks.

### Deliverables

1. A dev-tools map in repo docs that names each Groovebox command and the uCore
   equivalent capability.
2. Service adapters for spool and feed event writing with a stable event shape:
   `timestamp`, `module`, `level`, `message`, `tags`.
3. CI checks for shared-contract drift (event fields and lifecycle state names).

### Exit Criteria

- Groovebox emits machine-readable operational events compatible with uCore
  spool tooling.
- At least one end-to-end workflow uses uCore-style tool orchestration from
  dev action to logged event.

## Workstream B - Adopt Tasker Dev Flow

### Scope

- Add a Groovebox-local `.tasker.dev-flow.yaml` (repo-specific) based on uCore
  schema shape.
- Move planning from ad-hoc notes into lane-based task IDs and sprint metadata.

### Deliverables

1. Initial lanes:
   - `ui-refactor`
   - `skills-mcp`
   - `runtime-snackbar`
   - `maintenance`
2. Task UID conventions: `task.groovebox.<lane>.<nnn>`.
3. Weekly sprint block with `start`, `end`, `status`, and completion counters.

### Exit Criteria

- Dev planning updates are made in `.tasker.dev-flow.yaml` first.
- Major roadmap items are represented as task IDs with status transitions.

## Workstream C - Full USX Vue Style Kit Refactor

### Scope

- Migrate UI primitives from static ad-hoc styling toward USX-compatible token
  usage and Vue component structure.
- Preserve current Groovebox behavior while replacing visual/structure layers.

### Target Architecture

1. Introduce a Vue shell path for the operator UI while preserving existing
   FastAPI API contracts.
2. Move theme constants to shared token files compatible with uCore USX token
   package practices.
3. Refactor panel/layout primitives first (shell, nav, cards, sidebars), then
   composer widgets and transport controls.

### Exit Criteria

- Core operator surfaces render with shared token variables.
- No UI route relies on one-off inline style systems for major layout blocks.

## Workstream D - uCore Skills + MCP Integration

### Scope

- Define Groovebox MCP tool surfaces that mirror uCore skill posture where it
  makes sense (query, transform, export, diagnostics).
- Keep Groovebox-specific audio composition logic in Groovebox-owned skills,
  but expose with consistent MCP naming and metadata.

### Deliverables

1. Skill catalog doc: Groovebox-native skills vs shared uCore-compatible skills.
2. MCP manifest update for Groovebox tools with source, category, and safety
   notes.
3. Skill execution events bridged into spool and visible in debugging outputs.

### Exit Criteria

- Groovebox skills are discoverable and callable through MCP with stable
  naming and response envelopes.
- Failed skill runs produce structured snackbar/spool telemetry.

## Workstream E - Snackbar + MCP Runtime Operations

### Scope

- Add snackbar-aligned runtime status and action feedback to Groovebox
  operations (runtime start/stop, import/export, skill run outcomes).
- Ensure runtime controls and tool calls remain local-safe and auditable.

### Deliverables

1. Event taxonomy for runtime, skill, and export events.
2. API response envelope shape for success/error/warn messages that can feed
   snackbar UI components.
3. Basic operator diagnostics panel showing recent event stream summaries.

### Exit Criteria

- Operator-visible actions generate consistent feedback with actionable detail.
- MCP and runtime failures are traceable via spool logs and status endpoints.

## Phase Plan

### Phase 1 (Week 1): Foundation

- Create `.tasker.dev-flow.yaml` for Groovebox.
- Define service contracts for spool/feed event shape.
- Draft skill inventory and MCP naming map.

### Phase 2 (Week 2): Integration

- Implement snackbar event envelopes for runtime and skills.
- Land first shared service adapters for spool/feed writes.
- Start USX shell/token migration for top-level layouts.

### Phase 3 (Week 3-4): Refactor and Stabilize

- Complete primary operator-surface refactor path.
- Consolidate dev tooling docs + tasker status reporting.
- Add regression tests for API envelopes and event schema.

## Risks and Mitigations

- Risk: UI refactor interrupts operator workflows.
  Mitigation: Keep API contracts stable and ship behind route-level rollout flags.
- Risk: MCP/skills drift across repos.
  Mitigation: Add schema checks and naming lint in CI.
- Risk: Event noise overload in spool/snackbar.
  Mitigation: Introduce event severity levels and rate-limited debug events.

## Definition of Done

1. Groovebox planning and sprint tracking run through tasker dev-flow.
2. Shared uCore developer-tool patterns are documented and operational.
3. USX Vue style-kit migration is complete for primary operator surfaces.
4. Skills and MCP endpoints are integrated with structured snackbar/spool
   observability.
