"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Sliders, Columns, Eye, Grid, Image as ImageIcon, Sparkles } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { BackgroundColorPicker } from "./BackgroundColorPicker";
import { DownloadPanel } from "./DownloadPanel";

interface ResultsWorkspaceProps {
  originalFile: File;
  originalUrl: string;
  resultBlob: Blob;
  resultUrl: string;
  dimensions: { width: number; height: number };
  onReset: () => void;
}

type ViewMode = "result-only" | "slider" | "side-by-side" | "original";

export function ResultsWorkspace({
  originalFile,
  originalUrl,
  resultBlob,
  resultUrl,
  dimensions,
  onReset,
}: ResultsWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("result-only");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [isDarkChecker, setIsDarkChecker] = useState<boolean>(false);

  const checkerClass = isDarkChecker ? "checkerboard-dark" : "checkerboard-pattern";

  // Escape key resets to upload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onReset]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-100 text-slate-900">
      {/* Studio Top Control Strip */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & File info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Upload new image (Esc)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload Another Photo</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {originalFile.name}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 border border-slate-200">
                {dimensions.width} × {dimensions.height} px
              </span>
            </div>
          </div>

          {/* Center: View Modes Segmented Control */}
          <div
            role="tablist"
            aria-label="Viewport display mode"
            className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "result-only"}
              onClick={() => setViewMode("result-only")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                viewMode === "result-only"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Removed Background</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "slider"}
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                viewMode === "slider"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Before / After</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "side-by-side"}
              onClick={() => setViewMode("side-by-side")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                viewMode === "side-by-side"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "original"}
              onClick={() => setViewMode("original")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                viewMode === "original"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Original</span>
            </button>
          </div>

          {/* Right: Grid Theme Toggle */}
          <div className="flex items-center gap-2">
            {backgroundColor === "transparent" && (
              <button
                type="button"
                onClick={() => setIsDarkChecker(!isDarkChecker)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                title="Toggle transparency grid contrast"
              >
                <Grid className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  {isDarkChecker ? "Dark Grid" : "Light Grid"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Display (8 Cols on Desktop) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            {viewMode === "result-only" && (
              <div className="w-full max-w-4xl h-[420px] sm:h-[500px] md:h-[560px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md relative flex items-center justify-center">
                <div
                  className={`absolute inset-0 w-full h-full ${
                    backgroundColor === "transparent" ? checkerClass : ""
                  }`}
                  style={{
                    backgroundColor:
                      backgroundColor !== "transparent" ? backgroundColor : undefined,
                  }}
                />
                <img
                  src={resultUrl}
                  alt="Background removed result"
                  className="relative z-10 w-full h-full object-contain pointer-events-none p-4"
                />
                <div className="absolute top-4 right-4 z-20 rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cutout Ready</span>
                </div>
              </div>
            )}

            {viewMode === "slider" && (
              <div className="w-full">
                <BeforeAfterSlider
                  originalUrl={originalUrl}
                  resultUrl={resultUrl}
                  backgroundColor={backgroundColor}
                  checkerboardClass={checkerClass}
                />
                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Drag split divider or use <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-mono text-[11px]">→</kbd> keys</span>
                  <span className="font-semibold text-slate-700">100% Native Resolution</span>
                </div>
              </div>
            )}

            {viewMode === "original" && (
              <div className="w-full max-w-4xl h-[420px] sm:h-[500px] md:h-[560px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md relative flex items-center justify-center">
                <img
                  src={originalUrl}
                  alt="Original input"
                  className="w-full h-full object-contain pointer-events-none p-4"
                />
                <div className="absolute top-4 left-4 z-20 rounded-full bg-slate-800 text-white px-3 py-1 text-xs font-bold shadow-sm">
                  Original Photo
                </div>
              </div>
            )}

            {viewMode === "side-by-side" && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Original</span>
                  </div>
                  <div className="h-[300px] sm:h-[380px] flex items-center justify-center p-3">
                    <img
                      src={originalUrl}
                      alt="Original image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>AI Background Removed</span>
                  </div>
                  <div
                    className={`h-[300px] sm:h-[380px] flex items-center justify-center p-3 ${
                      backgroundColor === "transparent" ? checkerClass : ""
                    }`}
                    style={{
                      backgroundColor:
                        backgroundColor !== "transparent" ? backgroundColor : undefined,
                    }}
                  >
                    <img
                      src={resultUrl}
                      alt="Cutout image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Inspector Panel (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-5 w-full">
            {/* Background Color Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <BackgroundColorPicker
                currentColor={backgroundColor}
                onChangeColor={setBackgroundColor}
              />
            </div>

            {/* Export & Download Card */}
            <DownloadPanel
              originalFile={originalFile}
              resultBlob={resultBlob}
              backgroundColor={backgroundColor}
              dimensions={dimensions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
