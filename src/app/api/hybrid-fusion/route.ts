import { NextRequest, NextResponse } from "next/server";
import { removeBackgroundWithHybridFusion } from "@/lib/hybrid-fusion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Missing 'image' file in form data" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      if (!json.image) {
        return NextResponse.json({ error: "Missing 'image' base64 in json payload" }, { status: 400 });
      }
      const base64Data = json.image.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } else {
      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 0) {
        buffer = Buffer.from(arrayBuffer);
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    // Run parallel dual-model inference & fusion
    const result = await removeBackgroundWithHybridFusion(buffer);

    return new Response(new Uint8Array(result.pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "x-inference-time-ms": result.inferenceTimeMs.toString(),
        "x-model": "Hybrid-Fusion-BiRefNet-MODNet",
        "x-resolution": `${result.width}x${result.height}`,
      },
    });
  } catch (err: unknown) {
    console.error("[Hybrid Fusion API Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "Hybrid Fusion (BiRefNet Core + MODNet Sub-Pixel Matting)",
    provider: "Parallel Dual-Model Pipeline",
    endpoint: "POST /api/hybrid-fusion",
  });
}
