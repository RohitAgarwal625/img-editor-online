# Background-Removal Engine

Code: `src/lib/engine/`
- `models.mjs`: model and pipeline configuration only.
- `alpha-core.mjs`: pure alpha algorithms.
- `foreground.mjs`: tiled foreground-colour estimation.
- `matting.mjs`: conditional ViTMatte matting.
- `pipeline.mjs`: orchestration.

API: `POST /api/remove-background` (`?preview=1` caps the long side at 1024 px). Timings are returned in `x-engine-timings`.
Commands: `npm test` (15 tests) and `npm run bench` (writes to `bench-out/`).

## Audit findings

- **BiRefNet output:** the output is logits and a sigmoid is correct. The model is confident: 86.5% of pixels < 0.1, 13% > 0.9.
- **BiRefNet "thick border":** caused by the legacy reconstruction (lanczos-upsampled alpha applied to the raw RGB, so background colour stayed in the edges). The model is not the cause.
- **MODNet:** fixed 512² input that distorted the aspect ratio.
- **Hybrid route:** ran 2–3 networks per upload.
- **Progress UI:** progress was simulated.

## Pipeline

1. **Ingest:** EXIF rotation, one decode.
2. **Model:** BiRefNet.
3. **Cleanup:** connected components (removes specks, fills pinholes, keeps real holes).
4. **Refinement:** colour guided filter in the uncertain band only.
5. **Upsampling:** guided upsample to the original size.
6. **Crop refinement:** conditional crop re-inference.
7. **Matting (opt-in):** ViTMatte on the boundary band.
8. **Foreground colour:** tiled blur-fusion decontamination.
9. **QA flags.**
10. **PNG** at the original resolution.

## Benchmark: bg-assets, Apple M3 Pro, CPU

| image | size | legacy | engine | engine + ViTMatte | fgEst before → after tiling |
|---|---|---|---|---|---|
| bottle-opaque | 1341×1764 | 5.8 s | 7.5 s | 7.2 s | 0.39 → 0.28 s |
| cycle-boy | 2503×4893 | 6.3 s | 14.0 s* | 13.1 s | 1.70 → 0.36 s |
| furry-girl | 4640×6960 | 7.5 s | 9.8 s | 10.6 s | 5.14 → 1.52 s |
| girl-sitting | 4284×5355 | 6.7 s | 7.7 s | 7.3 s | 3.51 → 0.90 s |
| white-dark-mix-shirt | 900×1350 | 4.0 s | 3.9 s | 4.5 s | 0.28 → 0.15 s |
| white-shirt-boy | 1287×1931 | 4.7 s | 5.0 s | 5.3 s | 0.38 → 0.22 s |

\* The crop re-inference ran on this image (2 inferences).

- **Foreground estimation:** tiling makes it 3–5× faster, and it matches the full-frame reference within 12/255 (unit test).
- **BiRefNet on CPU:** 3.4–6.7 s per image. The 3–5 s target needs a GPU (`ENGINE_EP=cuda,cpu`).
- **ViTMatte:** adds 0.5–1.6 s. On furry-girl it widens the soft band (0.062 → 0.084) but raises components and holes (59 → 198, 119 → 385). Without GT it is unclear whether this is recovered hair or noise, so it is **opt-in** (`ENGINE_MATTING=auto`). Compare `bench-out/furry-girl/birefnet-engine-on-*.jpg` with `birefnet-vitmatte-on-*.jpg`, or run `--gt`.
- **Crop refinement on cycle-boy:** components rose from 2 to 8. Review it visually.

## Licensing

| Model | Weights | Commercial |
|---|---|---|
| BiRefNet | MIT | yes |
| MODNet | Apache-2.0 | yes |
| ViTMatte-small | MIT | yes |
| IS-Net via @imgly (browser fallback) | AGPL-3.0 | commercial licence needed |
| RMBG-2.0 | CC BY-NC 4.0 | no; not integrated |

## Frontend

- Server engine by default, with the in-browser IS-Net only as a fallback.
- **Erase / Restore** brush tab with undo.
- Five-model grid only with `?dev=1` or `NEXT_PUBLIC_DEV_MODE=1`.
