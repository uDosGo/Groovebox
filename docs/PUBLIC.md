---
title: "Public, free, open-source posture"
status: draft
last_updated: 2026-04-13T01:20:28+10:00
category: documentation
tags: [groovebox]
description: "**Groovebox** is **MIT-licensed** ([`LICENSE`](../LICENSE)). You may use, study, modify, and distribute it under t..."
---
# Public, free, open-source posture

**Groovebox** is **MIT-licensed** ([`LICENSE`](../LICENSE)). You may use, study, modify, and distribute it under those terms.

## Audience

- **Beginners:** start at [`QUICKSTART.md`](../QUICKSTART.md) and [`wiki/unit-01-groovebox-basics.md`](../wiki/unit-01-groovebox-basics.md).  
- **Operators:** see [`getting-started.md`](getting-started.md) and [`activation.md`](activation.md).  
- **Contributors:** see [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Relationship to uDos

**uDos** (Universal Device Operating Surface) is the family umbrella. This repository is a **standalone** open-source project: it shares vocabulary and interchange ideas (for example **USXD** JSON under [`interchange/`](../interchange/)) but ships on its own release line (`VERSION` / `package.json`).

Teaching and value-ladder policy for the wider family are documented in uDos governance and in **[AppStoreDocs](https://github.com/fredporter/AppStoreDocs)** — not duplicated here.

## Monetization (tool lane)

**Groovebox** stays **MIT / free at the point of use** — no paywalls, no “pro” edition of the same app, no feature gating. Optional support is **donation-style** (“buy me a beer”) if you want to say thanks; see the locked family spec **[UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_MONETIZATION_AND_ETHICS_v4.5.1.md)** in **uDosDev** (sibling clone: `uDosConnect/uDosDev`). Commercial uDos **products** (native apps) use a separate model — see that spec for the boundary.

## Privacy / network

The default Groovebox UI is **local-first** (`127.0.0.1`). Optional Songscribe and Docker flows may reach network services only when **you** configure them; see [`docker-posture.md`](docker-posture.md).
