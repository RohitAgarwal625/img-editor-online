import { NextRequest, NextResponse } from "next/server";
// Engine is plain ESM so it can be shared by the API, benchmark and tests.
import { removeBackground, warmup, EngineError } from "@/lib/engine/pipeline.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 30 * 1024 * 1024;

// Load model at server start so requests never pay cold-init cost.
warmup().catch((e: unknown) => console.error("[engine] warmup failed:", e));

export async function POST(req: NextRequest) {
  const tRecv = Date.now();
  try {
    let buffer: Buffer | null = null;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const file = (await req.formData()).get("image");
      if (file instanceof File) buffer = Buffer.from(await file.arrayBuffer());
    } else {
      const ab = await req.arrayBuffer();
      if (ab.byteLength) buffer = Buffer.from(ab);
    }
    if (!buffer?.length) return NextResponse.json({ error: "No image provided", code: "NO_IMAGE" }, { status: 400 });
    if (buffer.length > MAX_BYTES) return NextResponse.json({ error: "Image exceeds 30 MB", code: "TOO_LARGE" }, { status: 413 });
    const uploadMs = Date.now() - tRecv;

    const url = new URL(req.url);
    const preview = url.searchParams.get("preview") === "1";
    const model = url.searchParams.get("model") || undefined; // developer/benchmark mode only

    const r = await removeBackground(buffer, { preview, model });
    const timings = { uploadMs, ...r.timings };
    console.log(`[engine] ${r.width}x${r.height} model=${r.log.model} ${JSON.stringify(timings)} flags=${r.qa.flags.join(",") || "-"}`);

    return new Response(new Uint8Array(r.png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "x-engine-timings": JSON.stringify(timings),
        "x-engine-model": r.log.model,
        "x-engine-flags": r.qa.flags.join(","),
        "x-resolution": `${r.width}x${r.height}`,
      },
    });
  } catch (err: unknown) {
    if (err instanceof EngineError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("[engine] unexpected error:", err);
    return NextResponse.json({ error: "Background removal failed", code: "INTERNAL" }, { status: 500 });
  }
}
