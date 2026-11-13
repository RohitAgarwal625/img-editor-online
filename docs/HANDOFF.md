# HANDOFF — img-editor-online (background removal)

Give this file to an AI agent to continue the work. Read `PROMPT.md`, `docs/ENGINE.md` and `AGENTS.md` for background.
Visual walkthrough: `docs/pipeline-overview.html`.
Older history: `CONVERSATION_SUMMARY.md`.

## 1. Current state

- **Engine:** `src/lib/engine/` (`models.mjs`, `alpha-core.mjs`, `foreground.mjs`, `matting.mjs`, `pipeline.mjs`).
- **API:** `POST /api/remove-background`. `?preview=1` caps the long side at 1024 px.
- **Frontend:** `src/lib/background-removal.ts` calls the server engine first, then falls back to in-browser IS-Net (`@imgly/background-removal`).
- **Models** (in `models/`, local only): `birefnet.onnx`, `modnet.onnx`, `vitmatte-small.onnx`.
- **Benchmark:** `npm run bench` (`scripts/benchmark.mjs`) writes `bench-out/<image>/<method>.png`, composites on white/black/grey/green, and `report.json`.
- **Tests:** `npm test` (`tests/engine.test.mjs`, `tests/stages.test.mjs`).
- **Local:** everything works.

## 2. Work done in this session

1. **Deployment discussion.**
   - Do not commit `.onnx` files. GitHub rejects files over 100 MB.
   - Do not run this engine on Vercel. The function size, memory, timeout and no-GPU limits all apply.
2. **Vercel errors** on https://removebg-online.vercel.app/:
   - `500 Model weights not found: /var/task/models/birefnet.onnx`. The models are not deployed, so the app uses the browser fallback.
   - `413` on `villa.jpeg` (7.1 MB). Vercel rejects request bodies over about 4.5 MB.
3. **Code change (only one):** `src/lib/background-removal.ts`. A `413` now falls back to the browser engine like 5xx and 404 do (`status !== 413`). It is not deployed or tested yet.
4. **`bike.jpeg` bench.**
   - Ran the benchmark for `bike` only and merged the result into `bench-out/report.json`.
   - Outputs are in `bench-out/bike/`.
   - Analysis script: `scripts/analyze-bike.mjs`.
   - **Warning:** `scripts/analyze-bike.mjs` already existed and I overwrote it without reading it. Check `git diff` / `git checkout scripts/analyze-bike.mjs` if the old version mattered.
5. **Docs created:** this file and `docs/pipeline-overview.html`.
6. **No engine code was changed** for the spoke issue, as requested.

## 3. Bike spokes investigation (analysis only)

Input: `bg-assets/bike.jpeg`, 3000×2000.

### Measured results (`bench-out/bike/`)

| method | fg ratio | soft ratio | components | enclosed holes | notes |
|---|---|---|---|---|---|
| birefnet-legacy (raw model alpha) | 0.2366 | 0.0325 | 232 | 57 | no cleanup |
| birefnet-engine / auto | 0.2296 | 0.0490 | 74 | 54 | crop-refine not triggered, matting not triggered |
| birefnet-vitmatte | 0.2310 | 0.0591 | 974 | 130 | matting triggered; noisy |
| modnet-engine | 0.0910 | 0.0274 | 14 | 11 | loses most of the bike |

Alpha inside the wheel interiors (bounding boxes of the largest enclosed holes). Mean alpha is 0–255.

| wheel region | birefnet-legacy | birefnet-engine | birefnet-vitmatte | modnet-engine |
|---|---|---|---|---|
| hole #14 (1663,889–2568,1767) | 85.9 | 79.6 | 81.4 | 38.3 |
| hole #11 (583,752–1080,1629) | 118.7 | 113.8 | 117.6 | 23.7 |
| hole #33 (789,1255–1116,1508) | 87.2 | 78.5 | 87.7 | 17.2 |

### Why the spokes were removed

1. **Primary cause: the model input resolution.**
   - BiRefNet runs on a fixed 1024×1024 stretch of the 3000×2000 image. That is roughly 2.9× downscaling horizontally and 2× vertically.
   - Spokes are only a few pixels wide, so they shrink to about 1 px or less and are mixed with the background.
   - The model output is already weak there. The raw legacy alpha (no post-processing) shows 57 enclosed holes and low alpha inside the wheels.
2. **Secondary cause: the engine's cleanup and refinement lower the alpha further.** The engine is 5–10 points lower than legacy in the wheel areas. The legacy figures are the raw model output, so the engine's own stages account for that difference.
   - Likely contributors (not isolated by an experiment): the guided filter (`radius 2, eps 1e-4`) and the pin-hole and island cleanup.
3. **Crop refinement did not help.** Its trigger is `bboxAreaRatio <= 0.35`. This bike's bbox is 0.698 of the image, so the stage is skipped (`triggered: false`).
4. **ViTMatte does not fix it.**
   - It recovers some alpha (for example hole #33 goes from 78.5 to 87.7).
   - It also raises components from 74 to 974 and holes from 54 to 130, so much of the change looks like noise.
   - It runs at a 768 px max side, so it also cannot see thin spokes at full resolution.
5. **MODNet is worse.** It is a portrait model and treats the bike as mostly background.

**Not verified:** I did not view the images and did not run any experiment that changes the engine, so the ranking of causes 1 and 2 is an inference from the numbers above.

### Suggested changes (not implemented)

1. **Tiled or multi-scale inference.** Run BiRefNet on overlapping 1024 px tiles at native resolution for large images with thin structures, then merge. This addresses the main cause. It costs time, roughly 4–6× inference.
2. **Thin-structure protection in cleanup.**
   - Keep thin enclosed regions when they are bounded by a strong edge in the source RGB.
   - Cap how much the guided filter may reduce alpha inside the uncertain band.
3. **Relax the crop-refine trigger.** For example, allow a second pass on a sub-region when the soft ratio or hole count is high, instead of using bbox area only.
4. **Matting at higher resolution on band-only tiles.** Run ViTMatte per tile instead of a single 768 px image. Add a noise filter on the components it creates.
5. **Optional UI action.** An "Include thin structures" toggle that enables the slower tiled path. This costs only time when chosen.
6. **Manual workaround today:** use the Restore brush tab to paint spokes back.
7. **Test first.** Add `bike` to the regression set with a metric such as mean alpha in the wheel regions, and compare candidate changes against these numbers.

## 4. Left to do

1. **Vercel deployment (recommended path):**
   - Add `.gitignore` entries: `models/`, `*.onnx`, `bench-out/`.
   - Add `scripts/fetch-models.mjs` to download the weights (Hugging Face, S3 or R2) with checksums.
   - Add a Dockerfile for the engine and `/api/remove-background`. Host it on Fly.io, Railway, Render, Modal or a VM.
   - Make Vercel call it, using an `ENGINE_URL` environment variable or a `next.config` rewrite. This also removes the 4.5 MB limit.
   - Add a clear startup error when a model file is missing.
2. **Verify the 413 fallback** on the deployed site with `villa.jpeg`.
3. **Optionally compress** large uploads in the browser before sending, if the server stays on Vercel.
4. **Decide on the spoke work** from section 3 and implement it.
5. **Review (open from `docs/ENGINE.md`):** crop refinement on `cycle-boy` raised components from 2 to 8; ViTMatte on `furry-girl` raised components and holes. Both need visual review.
6. **Licensing:** keep the `@imgly` AGPL note (browser fallback needs a commercial licence for commercial use).

## 5. Useful commands

```bash
npm test
npm run bench
node scripts/benchmark.mjs <dir> [--methods birefnet-engine,birefnet-vitmatte]   # note: overwrites bench-out/report.json
node scripts/analyze-bike.mjs
ENGINE_EP=cuda,cpu npm run dev    # GPU execution provider
```
