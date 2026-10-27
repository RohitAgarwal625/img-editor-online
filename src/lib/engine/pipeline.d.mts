export class EngineError extends Error {
  code: string;
  status: number;
}
export interface EngineResult {
  png: Buffer;
  width: number;
  height: number;
  timings: Record<string, number>;
  qa: { flags: string[] } & Record<string, unknown>;
  log: { model: string; decisions: unknown[]; providers?: string[] };
  alpha: Float32Array;
}
export function removeBackground(
  input: Buffer,
  opts?: { preview?: boolean; maxPreviewSide?: number; decontaminate?: boolean; cropRefine?: boolean | "auto"; model?: string; naive?: boolean; matting?: boolean | "auto" }
): Promise<EngineResult>;
export function warmup(opts?: { models?: string[] }): Promise<unknown>;
