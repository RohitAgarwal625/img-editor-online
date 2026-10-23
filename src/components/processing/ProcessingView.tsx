"use client";

import React from "react";
import { X, Sparkles, ShieldCheck } from "lucide-react";
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
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-slate-100/80"
    >
      {/* Expansive Studio Window Box (max-w-6xl) */}
      <div className="w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                AI Background Removal
              </h2>
              <p className="text-xs font-semibold text-blue-600">
                {isModelDownload ? "Initializing neural network weights..." : "Segmenting foreground subject..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% In-Browser Privacy</span>
            </span>

            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
              title="Cancel processing"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Grand Canvas Window Box with Fluid Wavy Gradient & Neural Dots directly on Image */}
        <div className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner select-none">
          {/* 1. Underlying Uploaded Image with Ambient Breathing Animation */}
          <img
            src={originalUrl}
            alt="Uploaded image being processed"
            className="relative z-10 max-h-full max-w-full object-contain p-6 sm:p-10 md:p-14 animate-pulse-breathe pointer-events-none"
          />

          {/* 2. Fluid Wavy Gradient Layer 1 (Rotating & Translating Color Waves) */}
          <div className="absolute -inset-16 z-20 pointer-events-none fluid-wave-layer-1 mix-blend-screen opacity-75" />

          {/* 3. Fluid Wavy Gradient Layer 2 (Counter-rotating Iridescent Waves) */}
          <div className="absolute -inset-16 z-21 pointer-events-none fluid-wave-layer-2 mix-blend-screen opacity-70" />

          {/* 4. Fluid Sinusoidal Wave Ribbons sweeping across the image */}
          <svg
            className="absolute inset-0 z-22 w-full h-full pointer-events-none opacity-50 animate-sine-drift"
            viewBox="0 0 1400 800"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 350 C 300 200, 600 500, 900 300 C 1150 150, 1300 400, 1400 320 L 1400 800 L 0 800 Z"
              fill="url(#fluid-grad-1)"
              opacity="0.6"
            />
            <path
              d="M0 450 C 350 580, 650 280, 950 480 C 1150 550, 1320 380, 1400 420 L 1400 800 L 0 800 Z"
              fill="url(#fluid-grad-2)"
              opacity="0.45"
            />
            <defs>
              <linearGradient id="fluid-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.5" />
                <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="fluid-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* 5. Dual-Frequency Neural Dots Matrix overlaying the image and window */}
          <div className="absolute inset-0 z-25 pointer-events-none neural-dots-mesh opacity-80" />

          {/* 6. Active AI Neural Node Status Badge */}
          <div className="absolute bottom-5 left-5 z-30">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/85 backdrop-blur-md px-4 py-1.5 text-xs font-mono font-bold text-white border border-slate-700/80 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span>NEURAL MATTING IN PROGRESS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
