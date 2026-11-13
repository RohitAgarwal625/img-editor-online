import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { modelPath, MODELS, AUX_MODELS } from "@/lib/engine/models.mjs";
import { withCors, corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const models = Object.fromEntries(
    Object.keys({ ...MODELS, ...AUX_MODELS }).map((id) => [id, fs.existsSync(modelPath(id))]),
  );
  const ok = models.birefnet === true;
  return withCors(NextResponse.json({ ok, models }, { status: ok ? 200 : 503 }), req.headers.get("origin"));
}

export function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
