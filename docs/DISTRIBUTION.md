# Distribution — GrooveBox888 (Sonic-aligned)

GrooveBox888 follows the same **family disk contract** as **SonicScrewdriver** ([`docs/local-artifact-paths`](https://github.com/fredporter/SonicScrewdriver/blob/main/docs/local-artifact-paths.md), [uDos `foundation-distribution`](https://github.com/fredporter/uDosDev/blob/main/docs/foundation-distribution.md) when published).

## Clone layout (recommended)

| Path | Role |
| --- | --- |
| **`~/Code/GrooveBox888/`** | Canonical public clone ([`fredporter/GrooveBox888`](https://github.com/fredporter/GrooveBox888)) |
| **`~/Code/SonicScrewdriver/`** | Sonic CLI / USB / device DB ([`fredporter/SonicScrewdriver`](https://github.com/fredporter/SonicScrewdriver)) |
| **`~/Code/Ventoy/`** | Ventoy fork for bootable USB ([`fredporter/Ventoy`](https://github.com/fredporter/Ventoy)) |

Keep repos **siblings** under `~/Code/` so `config/workspaces.json` `${family_root}` patterns resolve predictably.

## Large assets (do not bloat git)

| Family path | Purpose |
| --- | --- |
| **`$HOME/.udos/library/`** | Shared mirrors, ISOs, bundles (Sonic standard) |
| **`$HOME/.udos/library/groovebox/`** | Default **GrooveBox888** audio payloads when `GROOVEBOX_AUDIO_ROOT` is unset |
| **`$HOME/.udos/library/bundles/groovebox888/`** | Optional **staged zip** of repo + sample packs for **offline USB** handoff |

Set **`GROOVEBOX_AUDIO_ROOT`** to force a different absolute root (second disk, lab share).

## Python environment

Same pattern as Sonic: use a **venv** or system Python with `fastapi` + `uvicorn` available. Example:

```bash
cd ~/Code/GrooveBox888
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn
bash scripts/run-groovebox-ui.sh
```

(A root `requirements.txt` may be added later; checks today assume imports succeed.)

## Hot USB / Ventoy operator bundle (convention)

1. Build or copy a **payload tree** under `library/bundles/groovebox888/` on the stick (or workstation mirror): clone tarball + `README-DISTRIBUTION.txt` pointing here.
2. On a workstation, unpack next to Sonic/Ventoy clones and set `GROOVEBOX_AUDIO_ROOT` to the USB path if samples live on removable media.
3. See **Sonic** [`docs/groovebox888-family-integration.md`](https://github.com/fredporter/SonicScrewdriver/blob/main/docs/groovebox888-family-integration.md) for the core-product checklist.

## Offline-first

Match **Sonic** / uDos **offline-first** posture: prefetch **FOSS** samples and docs while online; groovebox patterns and markdown remain **text-first** under your vault.

## Related

- [`QUICKSTART.md`](../QUICKSTART.md)  
- [`GROOVEBOX_SONIC_SOUND_CATALOG.md`](GROOVEBOX_SONIC_SOUND_CATALOG.md)  
- [`sound-library.md`](sound-library.md)  
