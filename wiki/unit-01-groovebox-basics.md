# Unit 01: GrooveBox888 basics

## What this module is

**GrooveBox888** is an open-source (**MIT**) app for **pattern-first** sequencing, portable composition artifacts, and local-first music workflow. It lives in the **uDos** family but **versions on its own** ([repo](https://github.com/fredporter/GrooveBox888)).

## What you should learn

By the end of this unit you should be able to:

- explain what GrooveBox888 owns (and what it does not)
- run the repo checks and launch the local UI
- inspect the seeded pattern and bridge artifacts
- name one **USXD** interchange URL the app exposes

## Practical how-to

1. Follow [`QUICKSTART.md`](../QUICKSTART.md) or run:

```bash
bash scripts/run-groovebox-checks.sh
bash scripts/run-groovebox-ui.sh
```

2. Open **http://127.0.0.1:8766/** and switch between **Compose**, **Vault**, **Library**, and **Status**.

3. Optional: fetch interchange JSON (app running):

```bash
curl -s http://127.0.0.1:8766/api/interchange/surface-document | head -c 200
```

## Quick check

You pass this unit if you can answer:

- What does GrooveBox888 own?
- Which files define the seeded pattern and bridge artifacts?
- What stays outside this repo (shell, DAW-grade workstation, etc.)?

## Next

- [`docs/learning/README.md`](../docs/learning/README.md) — full learning map  
- [`docs/architecture.md`](../docs/architecture.md) — deeper structure  
