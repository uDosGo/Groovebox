# Interchange (USXD / UniversalSurfaceXD)

Portable JSON for **lab composer** and **usxd/0.1** alignment.

| File | Role |
| --- | --- |
| `surface-groovebox-shell.json` | `surface-document` style stack (`meta.profileId`: `udos.groovebox888`) |
| `usxd-groovebox-panel.json` | Minimal `usxd/0.1` surface (`schemaVersion`, `grid`, `render`) |

**HTTP:** served from the running Groovebox app:

- `GET /api/interchange/surface-document`
- `GET /api/usxd/surface`

Validate USXD subsets against **[uDosGo](https://github.com/fredporter/uDosGo)** `packages/schemas/usxd-surface.schema.json` when changing shape. Surface-document schema: **[UniversalSurfaceXD](https://github.com/fredporter/UniversalSurfaceXD)** `interchange/schemas/surface-document.schema.json`.
