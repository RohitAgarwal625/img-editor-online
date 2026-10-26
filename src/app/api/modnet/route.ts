import { NextRequest, NextResponse } from "next/server";
import { removeBackgroundWithModnet } from "@/lib/modnet";

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

    // Run MODNet inference
    const result = await removeBackgroundWithModnet(buffer);

    const acceptHeader = req.headers.get("accept") || "";
    const url = new URL(req.url);
    const wantsJson = acceptHeader.includes("application/json") || url.searchParams.get("format") === "json";

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        model: "MODNet (Objective Decomposition Portrait Matting)",
        inferenceTimeMs: result.inferenceTimeMs,
        width: result.width,
        height: result.height,
        cutoutBase64: `data:image/png;base64,${result.pngBuffer.toString("base64")}`,
      });
    }

    // Default: return raw PNG stream
    return new Response(new Uint8Array(result.pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "x-inference-time-ms": result.inferenceTimeMs.toString(),
        "x-model": "MODNet-v1.0",
        "x-resolution": `${result.width}x${result.height}`,
      },
    });
  } catch (err: unknown) {
    console.error("[MODNet API Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "MODNet (Real-Time Trimap-Free Portrait Matting via Objective Decomposition)",
    provider: "ONNX Runtime Node (Native CPU SIMD / Accelerated)",
    weights: "models/modnet.onnx (~25.9MB)",
    endpoint: "POST /api/modnet",
    usage: "Send multipart/form-data with 'image' field, or raw image binary, or JSON with base64",
  });
}
