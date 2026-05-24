# Songscribe stem isolation (“Error Isolating Audio”)

The Songscribe **frontend** (Next.js in `containers/songscribe/repo`) does **not**
perform stem separation in the browser. It calls a **separate Python API**
([`gabe-serna/songscribe-api`](https://github.com/gabe-serna/songscribe-api)) for:

- `POST /split-audio` — multi-track separation  
- `POST /align-audio` — solo / vocal alignment  
- `POST /yt-to-mp3` — YouTube → audio (when using a link)  
- `POST /audio-to-midi` — audio → MIDI  

Those URLs are built from **`NEXT_PUBLIC_API_BASE_URL`**. If it is unset or wrong,
isolation fails and you see **“Uh oh! Error Isolating Audio!”**.

## Fix (local dev)

1. Clone and run **songscribe-api** per its README (Python env, models, port — often **8000**).
2. In the Songscribe repo (`containers/songscribe/repo`), create **`.env.local`**:
   - Copy **`containers/songscribe/env.local.example`** from this repo, or set:
   - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` (match your API bind URL; no trailing slash required).
3. **Restart** the Next dev server (`npm run dev` or Docker compose) so Next picks up env.
4. Ensure the browser can reach the API (**CORS** must allow your Songscribe origin).

## Groovebox overlay (bugfix + clearer errors)

Upstream `utils/isolateAudio.ts` passed **`response.blob()` (a Promise)** into
`JSZip.loadAsync` and did not **await** zip extraction, so stems could fail or
race. This repo ships:

- **`containers/songscribe/overrides/utils/isolateAudio.ts`** — corrected async flow  
- **`containers/songscribe/overrides/patches/001-audioform-isolation-errors.patch`** — clearer toast messages for missing API URL and generic failures  

Apply after each fresh clone / reset:

```bash
bash scripts/apply-songscribe-groovebox-overrides.sh
```

`setup-groovebox-first-run.sh` runs this automatically after `setup-songscribe.sh`.

## Production / Docker

If you run Songscribe in Docker, inject **`NEXT_PUBLIC_API_BASE_URL`** at **build
time** (Next bakes `NEXT_PUBLIC_*` into the client bundle) or use a runtime
pattern your deployment supports. Point it at wherever **songscribe-api** is
reachable from the **browser** (not only from the container).

**Groovebox optional stack:** use **`containers/songscribe/docker-compose.stem.yml`**
with profile **`stem`** together with **`docker-compose.yml`** to build and run
**songscribe-api** beside the UI (see **`containers/songscribe/README.md`**).
Clone **`songscribe-api`** into **`containers/songscribe/songscribe-api/`** first.

## Related

- [songscribe-contract.md](songscribe-contract.md)  
- [groovebox-songscribe-convergence.md](groovebox-songscribe-convergence.md)  
