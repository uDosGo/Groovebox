# Workflow (UDN) — GrooveBox888

Aligned with the family **Universal Dev Notes** pattern (see sibling repos such as UniversalSurfaceXD `docs/dev/WORKFLOW.md`).

## Zones

| Zone | Path | Role |
| --- | --- | --- |
| **System** | Git-tracked tree | Shipping code and canonical docs |
| **Local** | `.local/` (gitignored) | Private notes, experiments, scratch |
| **Compost** | `.compost/` (gitignored, policy in `.compost/README.md`) | Superseded copies before delete |

## Flow

```text
.local → TASKS.md → implementation → .compost (when replacing)
```

## Single task surface

Root **`TASKS.md`** is the only required engineering backlog file. Syntax: **[TASK.md](TASK.md)**.
