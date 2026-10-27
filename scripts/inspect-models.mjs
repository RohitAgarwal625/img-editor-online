// Phase 1 diagnostic: dump ONNX I/O signatures and raw output statistics.
// Usage: node scripts/inspect-models.mjs [image]
import ort from "onnxruntime-node";
import sharp from "sharp";

const img = process.argv[2] ?? "bg-assets/girl-sitting.jpg";

function stats(name, t) {
  const d = t.data;
  let mn = Infinity, mx = -Infinity;
  const h = new Array(10).fill(0);
  for (const v of d) {
    if (v < mn) mn = v;
    if (v > mx) mx = v;
    const p = mn < 0 || mx > 1 ? 1 / (1 + Math.exp(-v)) : v;
    h[Math.min(9, Math.max(0, Math.floor(p * 10)))]++;
  }
  console.log(`  ${name} dims=${JSON.stringify(t.dims)} min=${mn.toFixed(3)} max=${mx.toFixed(3)}`);
  console.log(`    hist(prob deciles): ${h.map((x) => (x / d.length).toFixed(3)).join(" ")}`);
}

for (const m of ["birefnet", "modnet"]) {
  const s = await ort.InferenceSession.create(`models/${m}.onnx`);
  console.log(`${m}: inputs=${s.inputNames} outputs=${s.outputNames}`);
}

const s = await ort.InferenceSession.create("models/birefnet.onnx", { graphOptimizationLevel: "all" });
const S = 1024;
const { data } = await sharp(img).rotate().resize(S, S, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const f = new Float32Array(3 * S * S);
const mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
for (let i = 0; i < S * S; i++) for (let c = 0; c < 3; c++) f[c * S * S + i] = (data[i * 3 + c] / 255 - mean[c]) / std[c];
const t = Date.now();
const r = await s.run({ [s.inputNames[0]]: new ort.Tensor("float32", f, [1, 3, S, S]) });
console.log(`birefnet inference ms=${Date.now() - t}`);
for (const k of s.outputNames) stats(k, r[k]);
