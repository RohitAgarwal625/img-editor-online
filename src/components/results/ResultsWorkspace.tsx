"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Sliders, Columns, Eye, Grid, Image as ImageIcon } from "lucide-react";
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

type ViewMode = "slider" | "result-only" | "side-by-side" | "original";

export function ResultsWorkspace({
  originalFile,
  originalUrl,
  resultBlob,
  resultUrl,
  dimensions,
  onReset,
}: ResultsWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [isLightChecker, setIsLightChecker] = useState<boolean>(false);

  const checkerClass = isLightChecker ? "checkerboard-light" : "checkerboard-dark";

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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-zinc-950 text-zinc-100">
      {/* Studio Top Control Strip */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & File info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title="Upload new image (Esc)"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]">
                {originalFile.name}
              </span>
              <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700/60">
                {dimensions.width}×{dimensions.height}
              </span>
            </div>
          </div>

          {/* Center: View Modes Segmented Control */}
          <div
            role="tablist"
            aria-label="Viewport display mode"
            className="flex items-center rounded-lg bg-zinc-950 p-1 border border-zinc-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "slider"}
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === "slider"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "side-by-side"}
              onClick={() => setViewMode("side-by-side")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === "side-by-side"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "result-only"}
              onClick={() => setViewMode("result-only")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === "result-only"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Cutout</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "original"}
              onClick={() => setViewMode("original")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                viewMode === "original"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
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
                onClick={() => setIsLightChecker(!isLightChecker)}
                className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Toggle grid contrast"
              >
                <Grid className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden sm:inline">
                  {isLightChecker ? "Dark Grid" : "Light Grid"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Display (8 Cols on Desktop) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            {viewMode === "slider" && (
              <div className="w-full">
                <BeforeAfterSlider
                  originalUrl={originalUrl}
                  resultUrl={resultUrl}
                  backgroundColor={backgroundColor}
                  checkerboardClass={checkerClass}
                />
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 px-1">
                  <span>Drag split divider or use <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">←</kbd> <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">→</kbd> keys</span>
                  <span>100% Native Resolution</span>
                </div>
              </div>
            )}

            {viewMode === "result-only" && (
              <div className="w-full max-w-4xl h-[380px] sm:h-[480px] md:h-[520px] rounded-xl overflow-hidden border border-zinc-800 relative flex items-center justify-center">
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
                <div className="absolute top-3 right-3 z-20 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-zinc-800">
                  Cutout Only
                </div>
              </div>
            )}

            {viewMode === "original" && (
              <div className="w-full max-w-4xl h-[380px] sm:h-[480px] md:h-[520px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative flex items-center justify-center">
                <img
                  src={originalUrl}
                  alt="Original input"
                  className="w-full h-full object-contain pointer-events-none p-4"
                />
                <div className="absolute top-3 left-3 z-20 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-800">
                  Original Photo
                </div>
              </div>
            )}

            {viewMode === "side-by-side" && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
                  <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span>Original</span>
                  </div>
                  <div className="h-[280px] sm:h-[360px] flex items-center justify-center p-2 bg-zinc-950">
                    <img
                      src={originalUrl}
                      alt="Original image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
                  <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-medium text-emerald-400">
                    <span>AI Background Removed</span>
                  </div>
                  <div
                    className={`h-[280px] sm:h-[360px] flex items-center justify-center p-2 ${
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
          <div className="lg:col-span-4 space-y-4 w-full">
            {/* Background Color Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-sm">
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
