import { NextRequest, NextResponse } from "next/server";
import { removeBackgroundWithBiRefNet } from "@/lib/birefnet";

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

    // Run BiRefNet inference
    const result = await removeBackgroundWithBiRefNet(buffer);

    const acceptHeader = req.headers.get("accept") || "";
    const url = new URL(req.url);
    const wantsJson = acceptHeader.includes("application/json") || url.searchParams.get("format") === "json";

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        model: "BiRefNet (Bilateral Reference High-Resolution Segmentation)",
        inferenceTimeMs: result.inferenceTimeMs,
        width: result.width,
        height: result.height,
        cutoutBase64: `data:image/png;base64,${result.pngBuffer.toString("base64")}`,
      });
    }

    // Return raw PNG stream
    return new Response(new Uint8Array(result.pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "x-inference-time-ms": result.inferenceTimeMs.toString(),
        "x-model": "BiRefNet-lite",
        "x-resolution": `${result.width}x${result.height}`,
      },
    });
  } catch (err: unknown) {
    console.error("[BiRefNet API Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation)",
    provider: "ONNX Runtime Node (Native CPU SIMD / Accelerated)",
    weights: "models/birefnet.onnx (~213MB)",
    endpoint: "POST /api/birefnet",
    usage: "Send multipart/form-data with 'image' field, or raw image binary, or JSON with base64",
  });
}
