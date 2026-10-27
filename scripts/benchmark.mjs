// Repeatable benchmark: same input images for every method.
// Usage: node scripts/benchmark.mjs [dir=bg-assets] [--gt <dir with <name>.png alpha mattes>]
// Writes bench-out/<image>/<method>.png + composites on white/black/grey/green + report.json.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { removeBackground, warmup } from "../src/lib/engine/pipeline.mjs";
import { mattingMetrics } from "../src/lib/engine/alpha-core.mjs";

const args = process.argv.slice(2);
const dir = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--gt") ?? "bg-assets";
const gtDir = args.includes("--gt") ? args[args.indexOf("--gt") + 1] : null;
const outDir = "bench-out";
fs.mkdirSync(outDir, { recursive: true });

const only = args.includes("--methods") ? args[args.indexOf("--methods") + 1].split(",") : null;
const ALL = {
  // Legacy behaviour: upsampled alpha on raw RGB, no refinement / decontamination.
  "birefnet-legacy": (buf) => removeBackground(buf, { naive: true, model: "birefnet" }),
  "modnet-legacy": (buf) => removeBackground(buf, { naive: true, model: "modnet" }),
  "modnet-engine": (buf) => removeBackground(buf, { model: "modnet", matting: false }),
  "birefnet-engine": (buf) => removeBackground(buf, { model: "birefnet", matting: false }),
  "birefnet-auto": (buf) => removeBackground(buf, { model: "birefnet" }),
  "birefnet-vitmatte": (buf) => removeBackground(buf, { model: "birefnet", matting: true }),
};
const METHODS = Object.fromEntries(Object.entries(ALL).filter(([k]) => !only || only.includes(k)));
await warmup({ models: ["modnet"] }).catch(() => {});
const BGS = { white: "#ffffff", black: "#000000", grey: "#808080", green: "#00b140" };

const t0 = Date.now(); await warmup(); console.log(`warmup(model load) ${Date.now() - t0}ms`);
const report = [];
for (const f of fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
  const buf = fs.readFileSync(path.join(dir, f));
  const name = path.parse(f).name;
  fs.mkdirSync(path.join(outDir, name), { recursive: true });
  for (const [m, fn] of Object.entries(METHODS)) {
    const r = await fn(buf);
    const rss = Math.round(process.memoryUsage().rss / 1048576);
    fs.writeFileSync(path.join(outDir, name, `${m}.png`), r.png);
    for (const [bn, col] of Object.entries(BGS))
      await sharp(r.png).flatten({ background: col }).jpeg({ quality: 90 }).toFile(path.join(outDir, name, `${m}-on-${bn}.jpg`));
    const row = {
      image: name, method: m, size: `${r.width}x${r.height}`, ms: r.timings, rssMB: rss,
      qa: { fg: +r.qa.fgRatio.toFixed(4), soft: +r.qa.softRatio.toFixed(4), components: r.qa.components,
        holes: r.qa.enclosedHoles, contour: +r.qa.contourComplexity.toFixed(2), flags: r.qa.flags },
      decisions: r.log.decisions, matting: r.log.matting, foreground: r.log.foreground,
    };
    if (gtDir) {
      const gp = path.join(gtDir, `${name}.png`);
      if (fs.existsSync(gp)) {
        const meta = await sharp(gp).metadata();
        const s = sharp(gp).rotate().resize(r.width, r.height, { fit: "fill" });
        const g = await (meta.hasAlpha ? s.extractChannel(3) : s.extractChannel(0)).raw().toBuffer();
        row.metrics = mattingMetrics(r.alpha, Float32Array.from(g, (v) => v / 255), r.width, r.height);
      }
    }
    report.push(row);
    console.log(`${name.padEnd(22)} ${m.padEnd(16)} ${row.size.padEnd(10)} total=${r.timings.totalMs}ms infer=${r.timings.inferenceMs}ms refine=${r.timings.refineMs ?? 0}ms mat=${r.timings.mattingMs ?? 0}ms fgEst=${r.timings.foregroundMs}ms comps=${row.qa.components} holes=${row.qa.holes} contour=${row.qa.contour} soft=${row.qa.soft} rss=${rss}MB ${row.metrics ? JSON.stringify(row.metrics) : ""}`);
  }
}
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`report -> ${outDir}/report.json`);
