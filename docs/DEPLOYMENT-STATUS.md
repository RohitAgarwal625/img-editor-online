# Deployment status: moving the background-removal engine off Vercel

Last updated: 2026-10-31.

This file records the deployment work that followed `docs/HANDOFF.md`. It covers the decisions made, the code changes made, what was checked, and what is still left to do. For section 4 ("Left to do") of `HANDOFF.md`, this file is the more current one.

Related docs: `docs/ENGINE.md`, `docs/HANDOFF.md`, `docs/pipeline-overview.html`.

---

## 1. The problem

- The live site (https://removebg-online.vercel.app/) never used the server engine.
  - `POST /api/remove-background` returned `500 Model weights not found: /var/task/models/birefnet.onnx`, because the `.onnx` files are not deployed.
  - Large images (for example `villa.jpeg`, 7.1 MB) returned `413`, because Vercel rejects request bodies over about 4.5 MB.
- In both cases the frontend quietly fell back to the in-browser IS-Net model (`@imgly/background-removal`). That model gives clearly worse results than the engine (BiRefNet → cleanup → guided filter → crop refinement → ViTMatte → colour clean-up).
- **Goal:** always use the server engine and stop using the browser model unless someone turns it on on purpose.

## 2. Decisions

| Topic | Decision | Why |
|---|---|---|
| Where the engine runs | On a separate Docker host, not on Vercel | Vercel functions are too limited for this engine: function size, memory, time limit, no GPU, and the 4.5 MB request limit. |
| How the browser reaches the engine | **Option B:** the browser calls the engine host directly, using the `NEXT_PUBLIC_ENGINE_URL` setting and CORS | Uploads skip Vercel, so the 4.5 MB limit no longer applies. The engine accepts up to 30 MB (`MAX_BYTES`). |
| Option A (a Vercel rewrite in `next.config.ts`) | **Not done** | Uploads would still pass through Vercel and hit the 4.5 MB limit. |
| Browser fallback | Off by default. `NEXT_PUBLIC_ALLOW_BROWSER_FALLBACK=1` turns it back on. | The weaker model should never run without anyone noticing. |
| Where the model files come from | The existing public Hugging Face repos, with each link pinned to a fixed version (commit) and checked by SHA-256. No re-upload needed. | They are byte-for-byte identical to the local files (see §4). |
| Model files in git | Never committed | GitHub rejects files over 100 MB. They are ignored in `.gitignore` and `.dockerignore`. |
| Hosting provider | **Google Cloud Run** is the current pick (not deployed yet) | See §6. Hugging Face Docker Spaces turned out to need a paid Pro plan ($9/month, per the user). |

## 3. Code changes made

The engine itself (models and algorithm) was **not** changed. All of the changes below are about deployment and wiring.

### 3.1 `src/lib/background-removal.ts` (frontend client)
- Added `ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL` (trailing `/` removed). Requests go to `${ENGINE_URL}/api/remove-background`. An empty value means the same site as the page, which keeps local `npm run dev` working.
- Added `ALLOW_BROWSER_FALLBACK = process.env.NEXT_PUBLIC_ALLOW_BROWSER_FALLBACK === "1"`.
- Error handling in `removeImageBackground`:
  - **Client errors** (4xx except 404 and 413) are passed on unchanged. This was already the behaviour.
  - **Other failures** (network error, 404, 413, 5xx):
    - If the fallback is **off** (the default), the user sees "Background removal engine is unavailable. Please try again shortly." The error carries `status` and `cause`. Progress is reported as `stage: "error"`.
    - If the fallback is **on**, it uses the browser IS-Net model, as before.
- The result still includes `engine: "server" | "browser"`.
- The doc comment on `ENGINE_URL` still uses a Railway URL as its example. It's only a comment, so it can be left or updated.

> Your editor may show line 1 as `ort interface RemovalProgress`. The file on disk was checked twice and starts correctly with `export interface RemovalProgress`. It's a display glitch in the editor, not a problem in the file.

### 3.2 `src/lib/cors.ts` (new)
- Reads `ALLOWED_ORIGINS`, a comma-separated list of sites allowed to call the engine (`*` allows any). If it isn't set, no CORS headers are sent, so only the same site can call the engine.
- `corsHeaders(origin)` returns these headers when the origin is allowed:
  - `Access-Control-Allow-Origin` set to that origin, plus `Vary: Origin`
  - `Access-Control-Allow-Methods: POST, GET, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
  - `Access-Control-Expose-Headers: x-engine-timings, x-engine-model, x-engine-flags, x-resolution`. Without this, the browser cannot read the timings or the resolution.
  - `Access-Control-Max-Age: 86400`
- `withCors(res, origin)` adds those headers to an existing response.

### 3.3 `src/app/api/remove-background/route.ts`
- Added an `OPTIONS` handler that answers the browser's CORS preflight with 204.
- `POST` now calls a new `handle(req)` (the old function body, unchanged) and adds CORS headers to every response, including error responses.

### 3.4 `src/app/api/health/route.ts` (new)
- `GET /api/health` returns `{ ok, models: { birefnet, modnet, vitmatte } }`, where each model value is `true` or `false`.
- It returns 200 when `birefnet` is present, otherwise 503. CORS is applied, and there is an `OPTIONS` handler.
- The host's health check can use it.

### 3.5 `src/lib/engine/pipeline.mjs`
- `getSession()`: a missing model file now raises `EngineError("MODEL_MISSING", …, 503)` with a message saying how to fix it (run `npm run fetch-models` or set `ENGINE_MODEL_DIR`). Before, it was a plain 500.
- Nothing else changed.

### 3.6 `scripts/fetch-models.mjs` (new) and `package.json`
- New script `"fetch-models": "node scripts/fetch-models.mjs"`.
- Downloads `MODELS` and `AUX_MODELS` (from `models.mjs`) into `ENGINE_MODEL_DIR`, or `./models` if that isn't set.
- Where each file comes from: the built-in pinned Hugging Face link and SHA-256 (§4), unless you set `MODEL_URL_<ID>` / `MODEL_SHA256_<ID>`.
- **Existing files:** if a file is already there and its SHA-256 matches, it's kept (`present`). If the checksum doesn't match, the file is downloaded again.
- **Download safety:** the file is downloaded to `<file>.part`, its SHA-256 is checked, and only then is it renamed to the real name. If the checksum doesn't match, the `.part` file is deleted and the script stops with an error.
- **Optional models:** `MODEL_OPTIONAL` (default `modnet`) lists models whose missing link only gives a warning. The script also errors on any non-200 response.
- **Private sources:** `MODEL_AUTH_TOKEN` or `HF_TOKEN` is sent as a bearer token. The default repos are public, so no token is needed.
- `npm run fetch-models -- --sums` prints `MODEL_SHA256_*=…` for the local files.

### 3.7 `.gitignore`
Added `/models/`, `*.onnx`, `*.onnx.part` and `/bench-out/`.

### 3.8 `Dockerfile` (new; current version is for Cloud Run)
- **Build stage** (`node:20-bookworm-slim`):
  1. `npm ci`
  2. `npm run build`
  3. `fetch-models` into `/app/models`. The models are built into the image, so a cold start doesn't download about 350 MB again.
- **Run stage:**
  - `ENGINE_MODEL_DIR=/app/models`, `PORT=8080`, `HOSTNAME=0.0.0.0`
  - Runs as the non-root `node` user.
  - `CMD`: `fetch-models` (only re-checks checksums when the files are present), then `next start -H 0.0.0.0 -p $PORT`.
- Earlier versions of this file targeted Railway (port 3000, `/data/models` volume) and then Hugging Face Spaces (port 7860). The current file replaced both.
- **Possible improvement:** re-checking the checksums of about 350 MB adds a few seconds to every cold start. The `fetch-models` step in `CMD` could be removed, because the files are already checked at build time.

### 3.9 `.dockerignore` (new)
`node_modules`, `.next`, `.git`, `models`, `bench-out`, `bg-assets`, `*.onnx`, `*.log`, `.env*`.

### 3.10 Files not changed
- `next.config.ts`: no rewrite, because Option A was not chosen.
- `src/lib/engine/models.mjs`: `modelPath()` already reads `ENGINE_MODEL_DIR`.
- Engine algorithm files: `alpha-core.mjs`, `foreground.mjs`, `matting.mjs`.

## 4. Model sources (checked)

Each local file's SHA-256 and byte size were compared with the values Hugging Face reports for the file (`X-Linked-ETag` and `X-Linked-Size`). All three match exactly. The pinned commit links were checked to return the same files.

| Local file | Hugging Face repo | Path | Pinned commit | Size (bytes) | SHA-256 | Licence |
|---|---|---|---|---|---|---|
| `birefnet.onnx` | `onnx-community/BiRefNet_lite-ONNX` | `onnx/model.onnx` | `de15b22ba131738a16dff04aab8bdf8dc32e3ac1` | 224,005,088 | `5600024376f572a557870a5eb0afb1e5961636bef4e1e22132025467d0f03333` | MIT |
| `vitmatte-small.onnx` | `Xenova/vitmatte-small-composition-1k` | `onnx/model.onnx` | `6bc1297f6140f055a227b6d2cfe8c093281f35d2` | 103,885,865 | `bf28d2e0be2c073286e88d60ad649d7123da2749a2d99133fd1098d5887e0225` | MIT |
| `modnet.onnx` (optional) | `Xenova/modnet` | `onnx/model.onnx` | `fa2fa546052fba4c08921230a26cc69a333fca12` | 25,888,640 | `07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9` | Apache-2.0 |

Notes:
- **The engine uses BiRefNet *lite*** (Swin-Tiny, fp32). `onnx-community/BiRefNet-ONNX` is the full Swin-Large model: about 973 MB, a different checksum, and never benchmarked here.
- **What pinning means:** `resolve/main/...` always gives the latest version of a repo. `resolve/<commit>/...` always gives that exact version, even after the authors push updates. On top of that, the SHA-256 check stops any different file from being used.
- **Upgrading a model:** change both the commit and the SHA-256 in `DEFAULTS` inside `fetch-models.mjs`, then run `npm run bench` again.
- **Checking it yourself** (downloads about 350 MB): `ENGINE_MODEL_DIR=/tmp/hf-check npm run fetch-models`.

## 5. What was verified

- `npm test`: 15 of 15 passed after the CORS and client changes.
- `npx tsc --noEmit` and `eslint` on the changed TypeScript files reported no errors at that point.
- `node --check scripts/fetch-models.mjs` passes.
- `npm run fetch-models` against the local `models/` folder reported `birefnet: present`, `modnet: present`, `vitmatte: present` and exited with code 0, so the checksums match.
- An empty `ENGINE_MODEL_DIR` with no link set stopped with a clear `MODEL_URL_BIREFNET not set` error. That was before the built-in default links existed. Now an empty folder downloads from Hugging Face.
- **Not verified yet:** the Docker build, any deployment, CORS from the real Vercel site, and the `villa.jpeg` upload end to end.

## 6. Hosting options discussed

Prices and free-tier limits come from my existing knowledge and were **not** checked online. Check each pricing page before signing up.

The engine needs about 4 GB of RAM, Docker, uploads up to 30 MB, and 10–30 s of CPU per image.

| Provider | Free part | Verdict |
|---|---|---|
| **Google Cloud Run** | Monthly free allowance (about 180k vCPU-seconds, 360k GiB-seconds, 2M requests), plus about $300 trial credit for new accounts. Needs a card. | ⭐ **Current choice.** Stops when idle, allows 4 GiB or more, 32 MB request limit. |
| Azure Container Apps | Similar monthly free allowance | Alternative to Cloud Run |
| Oracle Cloud Always Free | ARM VM with 4 cores and 24 GB RAM, free permanently | Free, but capacity is often unavailable and you manage the VM. `onnxruntime-node`/`sharp` on ARM64 not tested. |
| Hetzner VPS | No free tier, about €4–7/month | Cheapest always-on paid option. You manage the VM (Docker plus Caddy). |
| Fly.io | Trial credit only | Works, about $20+/month at 4 GB |
| Railway | Trial credit, then $5/month Hobby plus usage | Works, about $40/month at 4 GB always on |
| Render | Free tier is 512 MB | Free tier is too small; paid 4 GB plan is about $85/month |
| Modal | Monthly free credit | Built for Python; Node needs wrapping |
| Hugging Face Docker Space | User found that it needs Pro ($9/month) | **Rejected.** My earlier statement that it was free was wrong for this case. |
| Koyeb, Render free, AWS/GCP micro VMs | 512 MB – 1 GB RAM | Not enough memory |

## 7. Next steps (Google Cloud Run)

> **Status (2026-11-14):** the service was created in the Cloud Console UI, not with the CLI below. First build in progress.
> - Service `img-editor-online`, region `us-central1`, endpoint `https://img-editor-online-28995425629.us-central1.run.app`
> - Continuous deploy from GitHub `RohitAgarwal625/img-editor-online`, branch `main`, Dockerfile build. **Every push to `main` redeploys the engine.**
> - Public access, request-based billing, 0–2 instances, port 8080, 4 GiB / 2 vCPU, timeout 120 s, concurrency 1, second generation, startup CPU boost off.
> - Env var `ALLOWED_ORIGINS=https://www.getclearedits.online,https://getclearedits.online,https://removebg-online.vercel.app,http://localhost:3000` (custom domain added 2026-11-14)
> - Model files were removed from git tracking (`git rm --cached`, local copies kept) in commit `2ec9d2e`, which is pushed.

1. **Account:**
   - Sign up at https://console.cloud.google.com and add billing.
   - Create a project, e.g. `bg-engine`.
   - Under Billing → Budgets & alerts, create a **$1 budget alert**.
2. **Install the CLI and log in:**
   ```bash
   brew install --cask google-cloud-sdk
   gcloud auth login
   gcloud config set project <PROJECT_ID>
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```
3. **Deploy.** Cloud Build builds the `Dockerfile`, so you don't need Docker locally.
   ```bash
   cd ~/Documents/Projects/img-editor-online
   gcloud run deploy bg-engine \
     --source . \
     --region us-central1 \
     --memory 4Gi --cpu 2 \
     --concurrency 1 --max-instances 2 --min-instances 0 \
     --timeout 120 \
     --allow-unauthenticated \
     --set-env-vars ALLOWED_ORIGINS=https://removebg-online.vercel.app,http://localhost:3000
   ```
   The command prints the service address, `https://img-editor-online-28995425629.us-central1.run.app`.
4. **Check:** open `https://img-editor-online-28995425629.us-central1.run.app/api/health`. You should see `{"ok":true,...}`. If not, check the Cloud Run logs.
5. **Vercel:**
   - Add `NEXT_PUBLIC_ENGINE_URL=https://img-editor-online-28995425629.us-central1.run.app` in Settings → Environment Variables.
   - **Redeploy**, because the value is fixed when the site is built.
6. **Test:**
   - On the live site, upload `bg-assets/villa.jpeg` (7.1 MB) and `bg-assets/bike.jpeg`.
   - In DevTools → Network, the request should go to `*.run.app`, return 200, and include the response header `x-engine-model: birefnet`.

What to expect:
- **First request after idle is slow:** about 10–30 s while Node starts and loads the models.
- `--min-instances 1` removes that delay but costs money (an always-on 4 GiB / 2 vCPU instance).
- `--concurrency 1` matches how the engine works: it handles one image at a time in each process.

## 8. Still open (deployment)

- [ ] Do the Cloud Run deployment (§7) and check it end to end. Not done yet.
- [x] Stop tracking `models/*.onnx` in git (done in `2ec9d2e`; local files kept).
- [ ] Optional: remove the `fetch-models` step from the Dockerfile `CMD` to save cold-start time (§3.8).
- [ ] Optional: update the Railway example in the `ENGINE_URL` comment in `background-removal.ts`.
- [ ] Decide whether to keep the browser fallback.
  - If not, remove `@imgly/background-removal` and `removeImageBackgroundInBrowser`. That also removes the AGPL licensing concern.
  - `@imgly/background-removal-node` is also listed in `package.json`. Check with a search whether anything uses it before removing it.
- [ ] Optional: a `deploy-cloudrun.sh` script, or a Hetzner setup (`docker-compose` plus Caddy) if you'd rather pay a fixed monthly price.
- [ ] Update `docs/HANDOFF.md` §4 to point here.

## 9. Still open (engine quality, unchanged from `HANDOFF.md`)

- Bike spokes: the main cause is BiRefNet's fixed 1024×1024 input. Suggested fixes: tiled or multi-scale inference, protecting thin structures during cleanup, a looser trigger for crop refinement, ViTMatte per tile, and an optional "thin structures" toggle in the UI. See `HANDOFF.md` §3.
- `cycle-boy`: crop refinement increased the separate pieces in the mask (components 2 → 8). `furry-girl`: ViTMatte increased both pieces and holes. Both need a visual check.
- Licensing: the browser fallback (`@imgly`, AGPL) needs a commercial licence for commercial use.

## 10. Environment variables

| Where | Variable | Purpose |
|---|---|---|
| Vercel (frontend) | `ENGINE_URL` (or `NEXT_PUBLIC_ENGINE_URL`) | Address of the engine host. `next.config.ts` copies `ENGINE_URL` into the browser bundle at build time, so it is public either way (that's fine: the browser must know it). **Redeploy after changing it.** |
| Vercel (frontend) | `NEXT_PUBLIC_ALLOW_BROWSER_FALLBACK` | Set to `1` to turn the IS-Net browser fallback back on (default off) |
| Engine host | `ALLOWED_ORIGINS` | Comma-separated list of sites allowed to call the engine (CORS) |
| Engine host | `ENGINE_MODEL_DIR` | Model folder (`/app/models` in the Dockerfile) |
| Engine host | `ENGINE_PRIMARY_MODEL` | Default `birefnet` |
| Engine host | `ENGINE_EP` | ONNX Runtime backend, e.g. `cuda,cpu` (default `cpu`) |
| Build/host (optional) | `MODEL_URL_<ID>`, `MODEL_SHA256_<ID>`, `MODEL_OPTIONAL`, `MODEL_AUTH_TOKEN`/`HF_TOKEN` | Override where the models come from |

## 11. Notes on how the work went

- Some file writes in this session got mixed up or timed out. `scripts/fetch-models.mjs` once ended up with its lines out of order, and a stray `\;` appeared once. Both were fixed, and the final file passes `node --check` and the local run. `Dockerfile` and `.dockerignore` were written from the terminal.
- `HANDOFF.md` item 2.3 (a `413` falling back to the browser model) is replaced by §3.1. A `413` now shows an error unless the fallback is turned on.
