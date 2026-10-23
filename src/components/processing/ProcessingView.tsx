"use client";

import React from "react";
import { X, Cpu, CheckCircle2, CircleDashed } from "lucide-react";
import { RemovalProgress } from "@/lib/background-removal";

interface ProcessingViewProps {
  progress: RemovalProgress;
  originalUrl: string;
  onCancel: () => void;
}

export function ProcessingView({
  progress,
  originalUrl,
  onCancel,
}: ProcessingViewProps) {
  const isModelDownload = progress.stage === "loading-model";

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-zinc-950"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl space-y-6">
        {/* Preview image with scanline */}
        <div className="relative h-44 w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
          <img
            src={originalUrl}
            alt="Uploaded image being processed"
            className="h-full w-full object-contain opacity-75 filter blur-[0.5px]"
          />
          {/* Laser Scanline */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_#3b82f6] animate-scanline pointer-events-none" />

          {/* Badge */}
          <div className="absolute top-2.5 left-2.5 rounded bg-zinc-950/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-800">
            {isModelDownload ? "STAGE 1: MODEL" : "STAGE 2: SEGMENTATION"}
          </div>
        </div>

        {/* Progress & Stage Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-200">
              {progress.message || "Processing foreground segmentation..."}
            </span>
            <span className="font-mono text-blue-400 font-semibold">
              {progress.percent}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-200 ease-out"
              style={{ width: `${Math.max(4, progress.percent)}%` }}
            />
          </div>
        </div>

        {/* Process Checklist */}
        <div className="space-y-2 text-xs border-t border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2 text-zinc-300">
            {progress.percent >= 30 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <CircleDashed className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
            )}
            <span>Initialize WebAssembly neural engine</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            {progress.percent >= 70 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : progress.percent >= 30 ? (
              <CircleDashed className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
            ) : (
              <CircleDashed className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            )}
            <span>Calculate ISNet alpha transparency mask</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            {progress.percent === 100 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <CircleDashed className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            )}
            <span>Composite high-resolution output</span>
          </div>
        </div>

        {/* Technical note */}
        <div className="flex items-start gap-2 rounded-lg bg-zinc-950/70 p-3 text-[11px] text-zinc-400 border border-zinc-800/60">
          <Cpu className="h-3.5 w-3.5 text-zinc-300 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Running locally on your device via ONNX WebAssembly. Your photo is never sent to any cloud server.
          </p>
        </div>

        {/* Cancel button */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
