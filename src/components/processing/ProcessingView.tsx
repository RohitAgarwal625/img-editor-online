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
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg space-y-6">
        {/* Preview image with scanline */}
        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
          <img
            src={originalUrl}
            alt="Uploaded image being processed"
            className="h-full w-full object-contain filter blur-[0.5px] p-2"
          />
          {/* Laser Scanline */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent shadow-[0_0_10px_#2563eb] animate-scanline pointer-events-none" />

          {/* Badge */}
          <div className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-mono font-bold text-slate-800 border border-slate-200 shadow-2xs">
            {isModelDownload ? "STEP 1: LOADING AI MODEL" : "STEP 2: ISOLATING SUBJECT"}
          </div>
        </div>

        {/* Progress & Stage Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">
              {progress.message || "Processing foreground segmentation..."}
            </span>
            <span className="font-mono text-blue-600 font-extrabold text-sm">
              {progress.percent}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-200 ease-out"
              style={{ width: `${Math.max(4, progress.percent)}%` }}
            />
          </div>
        </div>

        {/* Process Checklist */}
        <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-slate-700">
            {progress.percent >= 30 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
            )}
            <span className="font-medium">Initialize in-browser WebAssembly runtime</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            {progress.percent >= 70 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : progress.percent >= 30 ? (
              <CircleDashed className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300 shrink-0" />
            )}
            <span className="font-medium">Compute ISNet neural alpha transparency mask</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            {progress.percent === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300 shrink-0" />
            )}
            <span className="font-medium">Render high-resolution cutout</span>
          </div>
        </div>

        {/* Technical note */}
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200">
          <Cpu className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Running 100% locally on your computer via WebAssembly. Your photo never leaves your device.
          </p>
        </div>

        {/* Cancel button */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-4 w-4" />
            <span>Cancel Processing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
