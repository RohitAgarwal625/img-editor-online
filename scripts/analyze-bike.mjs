// Read-only analysis of why bicycle spokes vanish. Does not touch engine code.
// Usage: node scripts/analyze-bike.mjs  (needs bench-out/bike/*.png and bg-assets/bike.jpeg)
import fs from "node:fs";
import sharp from "sharp";

const report = JSON.parse(fs.readFileSync("bench-out/report.json", "utf8")).filter((r) => r.image === "bike");
for (const r of report) console.log(r.method, JSON.stringify(r.qa), JSON.stringify(r.decisions));

const methods = ["birefnet-legacy", "birefnet-engine", "birefnet-vitmatte", "modnet-legacy", "modnet-engine"];
const alphas = {};
let W = 0, H = 0;
for (const m of methods) {
  const { data, info } = await sharp(`bench-out/bike/${m}.png`).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  alphas[m] = data; W = info.width; H = info.height;
}
// Find the largest enclosed background region (wheel interior) in the legacy alpha, then
// compare how much alpha each method keeps inside the wheel's bounding box.
const a0 = alphas["birefnet-legacy"];
const bg = new Uint8Array(W * H);
const stack = [];
const push = (i) => { if (a0[i] < 128 && !bg[i]) { bg[i] = 1; stack.push(i); } };
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
while (stack.length) {
  const i = stack.pop(), x = i % W, y = (i / W) | 0;
  if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W);
}
// enclosed holes = a0<128 and not reached from border
const lab = new Int32Array(W * H); const holes = [];
for (let s = 0; s < W * H; s++) {
  if (a0[s] >= 128 || bg[s] || lab[s]) continue;
  const id = holes.length + 1; let area = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
  lab[s] = id; stack.push(s);
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0; area++;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1])
      if (j >= 0 && a0[j] < 128 && !bg[j] && !lab[j]) { lab[j] = id; stack.push(j); }
  }
  holes.push({ id, area, x0, y0, x1, y1 });
}
holes.sort((a, b) => b.area - a.area);
console.log(`image ${W}x${H}; enclosed holes (legacy): ${holes.length}; top 6:`);
console.log(holes.slice(0, 6));
console.log("\nMean alpha (0-255) and % pixels with alpha>128 inside the bbox of each top hole:");
for (const h of holes.slice(0, 4)) {
  console.log(`hole#${h.id} bbox ${h.x0},${h.y0}-${h.x1},${h.y1}`);
  for (const m of methods) {
    let sum = 0, n = 0, fg = 0;
    for (let y = h.y0; y <= h.y1; y++) for (let x = h.x0; x <= h.x1; x++) { const v = alphas[m][y * W + x]; sum += v; n++; if (v > 128) fg++; }
    console.log(`  ${m.padEnd(18)} meanAlpha=${(sum / n).toFixed(1)} fg%=${((100 * fg) / n).toFixed(2)}`);
  }
}
