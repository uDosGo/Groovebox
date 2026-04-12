# GrooveBox888 — quick start (five minutes)

**Free, open-source** pattern groovebox for the **uDos** family. **Repository:** [github.com/fredporter/GrooveBox888](https://github.com/fredporter/GrooveBox888).

## You need

- **Python 3** with `pip` able to install `fastapi` and `uvicorn` (or use a venv and install from a `requirements.txt` if you add one later — today the checks assume deps available).
- A modern **browser** (Chrome, Firefox, Safari, Edge).

## Run the app

From the repo root:

```bash
bash scripts/run-groovebox-ui.sh
```

Open **http://127.0.0.1:8766/** (or the port shown in the terminal).

Use the top nav: **Compose**, **Vault**, **Library**, **Status**. Songscribe on port 3000 is optional; see [`docs/getting-started.md`](docs/getting-started.md).

## Optional: validate the tree

```bash
bash scripts/run-groovebox-checks.sh
```

## Learn next (beginner path)

1. **[`wiki/unit-01-groovebox-basics.md`](wiki/unit-01-groovebox-basics.md)** — first learning unit  
2. **[`docs/learning/README.md`](docs/learning/README.md)** — full intake map (Sonic-style hub)  
3. **[`docs/README.md`](docs/README.md)** — reference docs index  

## Next to Sonic / hot USB (optional)

If you use **SonicScrewdriver** for hardware and **`~/.udos/library/`** payloads, install GrooveBox888 as a **sibling clone** (e.g. `~/Code/GrooveBox888/`) and see **[`docs/DISTRIBUTION.md`](docs/DISTRIBUTION.md)** plus Sonic **[`groovebox888-family-integration`](https://github.com/fredporter/SonicScrewdriver/blob/main/docs/groovebox888-family-integration.md)**. Large **sample packs** belong under **`GROOVEBOX_AUDIO_ROOT`** or **`$UDOS_LIBRARY_DIR/groovebox/`**, not in git.

## License

**MIT** — see [`LICENSE`](LICENSE).
