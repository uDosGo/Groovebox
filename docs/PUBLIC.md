# Public, free, open-source posture

**GrooveBox888** is **MIT-licensed** ([`LICENSE`](../LICENSE)). You may use, study, modify, and distribute it under those terms.

## Audience

- **Beginners:** start at [`QUICKSTART.md`](../QUICKSTART.md) and [`wiki/unit-01-groovebox-basics.md`](../wiki/unit-01-groovebox-basics.md).  
- **Operators:** see [`getting-started.md`](getting-started.md) and [`activation.md`](activation.md).  
- **Contributors:** see [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Relationship to uDos

**uDos** (Universal Device Operating Surface) is the family umbrella. This repository is a **standalone** open-source project: it shares vocabulary and interchange ideas (for example **USXD** JSON under [`interchange/`](../interchange/)) but ships on its own release line (`VERSION` / `package.json`).

Teaching and value-ladder policy for the wider family are documented in uDos governance and in **[AgentDigital-docs](https://github.com/fredporter/AgentDigital-docs)** — not duplicated here.

## Privacy / network

The default Groovebox UI is **local-first** (`127.0.0.1`). Optional Songscribe and Docker flows may reach network services only when **you** configure them; see [`docker-posture.md`](docker-posture.md).
