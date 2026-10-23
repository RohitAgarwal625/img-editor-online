"use client";

import React, { useState } from "react";
import { ArrowLeft, Sliders, Columns, Eye, Grid, Sparkles } from "lucide-react";
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

type ViewMode = "slider" | "result-only" | "side-by-side";

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

  const checkerClass = isLightChecker ? "checkerboard-light" : "checkerboard-pattern";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100">
      {/* Top Action Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors border border-slate-700/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload Another</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-slate-800" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">
                {originalFile.name}
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-mono text-indigo-300 border border-slate-700/50">
                {dimensions.width}×{dimensions.height}
              </span>
            </div>
          </div>

          {/* View mode toggle controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "slider"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Before & After Slider"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Slider</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("side-by-side")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "side-by-side"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Side by Side"
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Side by Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("result-only")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "result-only"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Isolated Cutout"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Result</span>
              </button>
            </div>

            {/* Checkerboard style toggle */}
            {backgroundColor === "transparent" && (
              <button
                type="button"
                onClick={() => setIsLightChecker(!isLightChecker)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-300 border border-slate-700/60"
                title="Toggle checkerboard theme"
              >
                <Grid className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{isLightChecker ? "Dark Grid" : "Light Grid"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                <p className="mt-3 text-center text-xs text-slate-400">
                  Drag the center divider left or right to compare original vs AI cutout
                </p>
              </div>
            )}

            {viewMode === "result-only" && (
              <div className="w-full max-w-4xl h-[420px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center">
                <div
                  className={`absolute inset-0 w-full h-full ${
                    backgroundColor === "transparent" ? checkerClass : ""
                  }`}
                  style={{
                    backgroundColor: backgroundColor !== "transparent" ? backgroundColor : undefined,
                  }}
                />
                <img
                  src={resultUrl}
                  alt="Background removed result"
                  className="relative z-10 w-full h-full object-contain pointer-events-none p-4"
                />
              </div>
            )}

            {viewMode === "side-by-side" && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                  <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Original</span>
                  </div>
                  <div className="h-[280px] sm:h-[380px] flex items-center justify-center p-2">
                    <img
                      src={originalUrl}
                      alt="Original image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                  <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Background Removed</span>
                    </div>
                  </div>
                  <div
                    className={`h-[280px] sm:h-[380px] flex items-center justify-center p-2 ${
                      backgroundColor === "transparent" ? checkerClass : ""
                    }`}
                    style={{
                      backgroundColor: backgroundColor !== "transparent" ? backgroundColor : undefined,
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

          {/* Right Controls Panel (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6 w-full">
            {/* Background Color Picker Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-md shadow-xl">
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
