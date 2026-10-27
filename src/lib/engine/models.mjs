/**
 * Model registry. Model *configuration* only — no orchestration logic here.
 * Licensing summary lives in docs/ENGINE.md (verify before shipping).
 */
import path from "node:path";

export const MODELS = {
  birefnet: {
    id: "birefnet",
    file: "birefnet.onnx",
    input: "input_image",
    output: "output_image",
    // Static graph trained on 1024x1024 stretched inputs.
    size: { mode: "fixed", width: 1024, height: 1024 },
    normalize: { mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225] },
    // Graph emits raw logits (scripts/inspect-models.mjs: range ~[-34, 23]).
    activation: "sigmoid",
    license: { code: "MIT", weights: "MIT (ZhengPeng7/BiRefNet)", commercial: true },
  },
  modnet: {
    id: "modnet",
    file: "modnet.onnx",
    input: "input",
    output: "output",
    size: { mode: "short-side", ref: 512, multiple: 32 },
    normalize: { mean: [0.5, 0.5, 0.5], std: [0.5, 0.5, 0.5] },
    activation: "none",
    license: { code: "Apache-2.0", weights: "Apache-2.0 (ZHKKKe/MODNet)", commercial: true },
  },
};

export const AUX_MODELS = {
  vitmatte: {
    id: "vitmatte",
    file: "vitmatte-small.onnx",
    input: "pixel_values",   // [1,4,H,W]: RGB (x-0.5)/0.5 + trimap in {0,0.5,1}
    output: "alphas",        // [1,1,H,W] in [0,1]
    license: { code: "MIT", weights: "MIT (hustvl/vitmatte-small-composition-1k, ONNX by Xenova)", commercial: true },
  },
};

export function modelPath(id) {
  const dir = process.env.ENGINE_MODEL_DIR || path.join(process.cwd(), "models");
  return path.join(dir, (MODELS[id] ?? AUX_MODELS[id]).file);
}

/** Pipeline tunables (see docs/ENGINE.md for how they were chosen). */
export const PIPELINE_CONFIG = {
  primaryModel: process.env.ENGINE_PRIMARY_MODEL || "birefnet",
  maxInputPixels: 40_000_000,
  minSide: 16,
  guided: { radius: 2, eps: 1e-4, bandRadius: 3 },
  cleanup: { minIslandFrac: 0.0015, minIslandRel: 0.02, maxPinholeFrac: 0.00004 },
  cropRefine: { maxBboxAreaRatio: 0.35, minGain: 1.6, margin: 0.08 },
  qa: { emptyFg: 0.003, fullFg: 0.985 },
  // Stage E. Triggered when the primary alpha has a wide soft band (hair/fur).
  // triggerSoftRatio is calibrated on bg-assets (see docs/ENGINE.md).
  matting: { model: "vitmatte", maxSide: 768, lo: 0.05, hi: 0.95, bandFrac: 0.006, padFrac: 0.01, triggerSoftRatio: 0.02 },
  png: { compressionLevel: 6 },
};
