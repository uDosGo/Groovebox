# uDevFramework

The universal scaffold, specs, and settings for the Sonic Family ecosystem.

## What's Inside

- **scaffold/** – Project template with linting, CI, and structure
- **specs/** – Living architecture documents
- **scripts/** – Reusable automation
- **rules/** – Agent behavior guidelines
- **templates/** – File generators
- **bin/udev** – CLI tool for using the framework

## Quick Start

```bash
# Install the CLI
./bin/udev install

# Create a new project
udev init my-new-project

# Update existing project to latest framework
udev update .
```

## Implementation Status

**Current Version:** v1.2.0

| Area | Status | Notes |
|------|--------|-------|
| **CLI Core** | ✅ Working | Help, spec, rule commands |
| **Templating** | 🟡 Planned | Specification complete |
| **Layer System** | 🟡 Planned | Design phase |
| **Flavour System** | 🟡 Planned | Not implemented |

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for full details.

## Philosophy

- **Universal spine** – Consistent directory structure across all repos
- **Agent-aware** – Rules and specs that AI agents can follow
- **Self-documenting** – Specs are the source of truth
- **Batteries included** – Linting, testing, CI out of the box

## License

MIT