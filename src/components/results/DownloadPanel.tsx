"use client";

import React, { useState } from "react";
import { Download, Copy, Check, FileImage, Sparkles, Loader2 } from "lucide-react";
import { compositeImage, triggerDownload, formatBytes, ExportFormat } from "@/lib/image-export";

interface DownloadPanelProps {
  originalFile: File;
  resultBlob: Blob;
  backgroundColor: string;
  dimensions: { width: number; height: number };
}

export function DownloadPanel({
  originalFile,
  resultBlob,
  backgroundColor,
  dimensions,
}: DownloadPanelProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("image/png");

  const baseFilename = originalFile.name.replace(/\.[^/.]+$/, "");

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const compositedBlob = await compositeImage(resultBlob, {
        backgroundColor,
        format: selectedFormat,
        quality: 0.95,
      });

      const ext = selectedFormat === "image/webp" ? "webp" : "png";
      const bgSuffix = backgroundColor !== "transparent" ? "-colored" : "-transparent";
      const filename = `${baseFilename}-removebg${bgSuffix}.${ext}`;

      triggerDownload(compositedBlob, filename);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        alert("Clipboard API not supported in this browser.");
        return;
      }

      setIsExporting(true);
      // ClipboardItem typically requires PNG
      const pngBlob = await compositeImage(resultBlob, {
        backgroundColor,
        format: "image/png",
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy image to clipboard. Try downloading instead.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-md shadow-xl">
      {/* File & Dimension Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <FileImage className="h-4 w-4 text-indigo-400" />
          <span className="font-medium truncate max-w-[180px] sm:max-w-[240px]" title={originalFile.name}>
            {originalFile.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span>{dimensions.width} × {dimensions.height} px</span>
          <span>•</span>
          <span>{formatBytes(resultBlob.size)}</span>
        </div>
      </div>

      {/* Format Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedFormat("image/png")}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium border transition-all ${
              selectedFormat === "image/png"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="font-bold">PNG</span>
            <span className="text-[11px] text-slate-400">Lossless & Alpha</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("image/webp")}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium border transition-all ${
              selectedFormat === "image/webp"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="font-bold">WebP</span>
            <span className="text-[11px] text-slate-400">Ultra Compact</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Primary Download Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownload}
          id="btn-download-result"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Rendering export...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>
                Download {selectedFormat === "image/webp" ? "WebP" : "PNG"}
                {backgroundColor !== "transparent" ? " (Colored BG)" : " (Transparent)"}
              </span>
            </>
          )}
        </button>

        {/* Secondary Copy to Clipboard Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleCopyToClipboard}
          id="btn-copy-clipboard"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 hover:text-white font-medium py-2.5 px-4 text-xs sm:text-sm transition-all duration-200 active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-400" />
              <span>Copy Image to Clipboard</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
        <Sparkles className="h-3 w-3 text-indigo-400" />
        <span>Full HD resolution • Zero watermarks • 100% Free</span>
      </div>
    </div>
  );
}
