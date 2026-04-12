# Songscribe Container Lane

This folder hosts the local clone and container metadata for the Groovebox
Songscribe bridge.

## Current Model

- upstream repo: `https://github.com/gabe-serna/songscribe`
- local clone target: `containers/songscribe/repo`
- compose entrypoint: `docker-compose.yml`
- setup script: `scripts/setup-songscribe.sh`

## Usage

Clone or refresh the local source:

```bash
scripts/setup-songscribe.sh
```

Start the local containerized app when Docker is available:

```bash
docker compose -f containers/songscribe/docker-compose.yml up
```

**Stem stack (UI + songscribe-api in Docker):** clone the API once, then merge the overlay:

```bash
cd containers/songscribe
git clone https://github.com/gabe-serna/songscribe-api.git songscribe-api
cd ../..
docker compose -f containers/songscribe/docker-compose.yml -f containers/songscribe/docker-compose.stem.yml --profile stem up --build
```

The `songscribe-api` directory is **gitignored**. The first build can be slow.

**Stem isolation / YouTube / MIDI:** the Songscribe UI needs
**[songscribe-api](https://github.com/gabe-serna/songscribe-api)** running and
reachable from the **browser**. For Docker Songscribe on macOS/Windows, compose
defaults `NEXT_PUBLIC_API_BASE_URL` to `http://host.docker.internal:8000`
(override if your API port differs). For `npm run dev` on the host, use
`containers/songscribe/env.local.example` → `repo/.env.local`.

After cloning or resetting Songscribe, apply Groovebox fixes to `isolateAudio`:

```bash
bash scripts/apply-songscribe-groovebox-overrides.sh
```

See **`docs/songscribe-isolate-audio.md`** in this repo.
