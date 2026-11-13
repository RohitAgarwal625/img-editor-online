/**
 * CORS for the standalone engine server (Option B: browser on Vercel calls the
 * engine host directly). ALLOWED_ORIGINS is a comma-separated list, e.g.
 *   ALLOWED_ORIGINS=https://removebg-online.vercel.app,http://localhost:3000
 * Unset => same-origin only (no CORS headers emitted).
 */
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !(allowed.includes("*") || allowed.includes(origin))) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "x-engine-timings, x-engine-model, x-engine-flags, x-resolution",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function withCors(res: Response, origin: string | null): Response {
  for (const [k, v] of Object.entries(corsHeaders(origin))) res.headers.set(k, v);
  return res;
}
