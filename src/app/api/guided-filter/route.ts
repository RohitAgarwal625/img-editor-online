import { NextRequest, NextResponse } from "next/server";
import { refineAlphaWithGuidedFilter } from "@/lib/guided-filter";
import { removeBackgroundWithModnet } from "@/lib/modnet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBuf: Buffer | null = null;
    let cutoutBuf: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const imageFile = formData.get("image") as File | null;
      const cutoutFile = formData.get("cutout") as File | null;

      if (!imageFile) {
        return NextResponse.json({ error: "Missing 'image' file in form data" }, { status: 400 });
      }
      imageBuf = Buffer.from(await imageFile.arrayBuffer());

      if (cutoutFile) {
        cutoutBuf = Buffer.from(await cutoutFile.arrayBuffer());
      }
    } else {
      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 0) {
        imageBuf = Buffer.from(arrayBuffer);
      }
    }

    if (!imageBuf || imageBuf.length === 0) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    const t0 = Date.now();

    // If initial cutout was not sent by client, compute base mask
    if (!cutoutBuf) {
      const baseResult = await removeBackgroundWithModnet(imageBuf, 512);
      cutoutBuf = baseResult.pngBuffer;
    }

    // Refine with High-Resolution Guided Filter
    const refinedPng = await refineAlphaWithGuidedFilter(imageBuf, cutoutBuf, {
      radius: 6,
      eps: 1e-3,
    });

    const elapsed = Date.now() - t0;

    return new Response(new Uint8Array(refinedPng), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "x-inference-time-ms": elapsed.toString(),
        "x-model": "IS-Net-Guided-Filter-Refined",
      },
    });
  } catch (err: unknown) {
    console.error("[Guided Filter API Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "Enhanced IS-Net + Guided Image Filter (Edge Refined)",
    provider: "Linear-Time O(N) Photometric Edge Realignment",
    endpoint: "POST /api/guided-filter",
  });
}
