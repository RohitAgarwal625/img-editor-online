"use client";

import React from "react";
import { X, Cpu, CheckCircle2, CircleDashed, Sparkles, ShieldCheck } from "lucide-react";
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
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50"
    >
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              <span>ISNet Neural Segmentation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Removing Background...
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title="Cancel background removal"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>

        {/* Large Expanded Preview Viewport with Gradient Wavy & Neural Dots Animation */}
        <div className="relative h-72 sm:h-88 md:h-[390px] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
          {/* 1. Underlying uploaded image with ambient breathing animation */}
          <img
            src={originalUrl}
            alt="Uploaded image being processed"
            className="relative z-10 max-h-full max-w-full object-contain p-4 sm:p-6 animate-pulse-breathe"
          />

          {/* 2. Fluid Animated Wavy Gradient Overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none animate-wavy-gradient mix-blend-screen opacity-70" />

          {/* 3. Drifting Neural Dot Matrix Layer */}
          <div className="absolute inset-0 z-25 pointer-events-none neural-dots-pattern opacity-70" />

          {/* 4. Wavy SVG Contour Ribbons */}
          <svg
            className="absolute inset-0 z-28 w-full h-full pointer-events-none opacity-45 animate-wave-oscillate"
            viewBox="0 0 1000 600"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 250 C 200 150, 400 350, 600 200 C 800 100, 900 300, 1000 220 L 1000 600 L 0 600 Z"
              fill="url(#wave-gradient-1)"
              opacity="0.5"
            />
            <path
              d="M0 320 C 250 420, 450 200, 700 340 C 850 400, 950 260, 1000 300 L 1000 600 L 0 600 Z"
              fill="url(#wave-gradient-2)"
              opacity="0.35"
            />
            <defs>
              <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Live Status Chips */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-bold text-white border border-slate-700/80 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span>{isModelDownload ? "DOWNLOADING ONNX WEIGHTS" : "AI EDGE MATTING ACTIVE"}</span>
            </span>
          </div>

          <div className="absolute bottom-3 right-3 z-30 hidden sm:flex items-center gap-1 rounded-full bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-800/80 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% In-Browser Privacy</span>
          </div>
        </div>

        {/* Progress Bar & Live Status Message */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="text-slate-800 truncate pr-2">
              {progress.message || "Computing high-precision transparency mask..."}
            </span>
            <span className="font-mono text-blue-600 font-extrabold text-base sm:text-lg">
              {progress.percent}%
            </span>
          </div>

          {/* Glowing Gradient Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(37,99,235,0.5)]"
              style={{ width: `${Math.max(5, progress.percent)}%` }}
            />
          </div>
        </div>

        {/* 3-Step Execution Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            {progress.percent >= 30 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-blue-600 animate-spin mt-0.5 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-bold text-slate-900">Step 1</p>
              <p className="text-slate-500 text-[11px]">WASM Neural Runtime</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            {progress.percent >= 70 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : progress.percent >= 30 ? (
              <CircleDashed className="h-4 w-4 text-blue-600 animate-spin mt-0.5 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-bold text-slate-900">Step 2</p>
              <p className="text-slate-500 text-[11px]">Sub-pixel Alpha Mask</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            {progress.percent === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
            )}
            <div className="text-xs">
              <p className="font-bold text-slate-900">Step 3</p>
              <p className="text-slate-500 text-[11px]">High-Res RGBA Render</p>
            </div>
          </div>
        </div>

        {/* Technical summary footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>Multi-threaded WebAssembly & WebGPU</span>
          </span>
          <span>Zero cloud uploads • 100% private</span>
        </div>
      </div>
    </div>
  );
}
