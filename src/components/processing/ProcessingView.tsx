"use client";

import React from "react";
import { Sparkles, X, Cpu, CloudDownload } from "lucide-react";
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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Blurred background image backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${originalUrl})` }}
      />
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl pointer-events-none" />

      {/* Center card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900/90 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-md text-center space-y-6">
        {/* Animated Scanner Visual Icon */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/80">
              {isModelDownload ? (
                <CloudDownload className="h-8 w-8 text-indigo-400 animate-bounce" />
              ) : (
                <Sparkles className="h-8 w-8 text-indigo-300 animate-spin" style={{ animationDuration: "6s" }} />
              )}
            </div>
          </div>
        </div>

        {/* Status Headings */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isModelDownload ? "Loading Neural Network" : "Removing Background"}
          </h2>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            {progress.message || "Analyzing pixels and isolating subjects..."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
            <span>{isModelDownload ? "Model Download" : "AI Segmentation"}</span>
            <span className="font-mono text-indigo-300">{progress.percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
              style={{ width: `${Math.max(5, progress.percent)}%` }}
            />
          </div>
        </div>

        {/* First-load / Privacy Callout */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 text-left text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>Local Device Execution (WASM / ONNX)</span>
          </div>
          <p className="leading-relaxed">
            {isModelDownload
              ? "First run takes a few seconds to cache the AI model locally in your browser. All future background removals will be nearly instant!"
              : "Your photo is processed locally inside your browser. No files are uploaded to any cloud server."}
          </p>
        </div>

        {/* Cancel Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel Processing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
