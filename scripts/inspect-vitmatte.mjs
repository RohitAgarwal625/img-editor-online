// Prints I/O names, shapes and a smoke-test run for the ViTMatte ONNX.
import ort from "onnxruntime-node";
import fs from "node:fs";
const f = "models/vitmatte-small.onnx";
console.log("size", fs.statSync(f).size);
const s = await ort.InferenceSession.create(f);
console.log("in", s.inputNames, "out", s.outputNames);
const H = 512, W = 512;
const data = new Float32Array(4 * H * W);
for (let i = 0; i < H * W; i++) data[3 * H * W + i] = 0.5;
const t = Date.now();
const out = await s.run({ [s.inputNames[0]]: new ort.Tensor("float32", data, [1, 4, H, W]) });
const o = out[s.outputNames[0]];
let mn = Infinity, mx = -Infinity;
for (const v of o.data) { if (v < mn) mn = v; if (v > mx) mx = v; }
console.log("dims", o.dims, "min", mn, "max", mx, "ms", Date.now() - t);
