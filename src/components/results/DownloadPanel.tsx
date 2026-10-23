"use client";

import React, { useState } from "react";
import { Download, Copy, Check, FileImage, Loader2 } from "lucide-react";
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
  const isColored = backgroundColor !== "transparent";

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const compositedBlob = await compositeImage(resultBlob, {
        backgroundColor,
        format: selectedFormat,
        quality: 0.95,
      });

      const ext =
        selectedFormat === "image/webp"
          ? "webp"
          : selectedFormat === "image/jpeg"
          ? "jpg"
          : "png";
      const bgSuffix = isColored ? "-solid" : "-cutout";
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
        alert("Clipboard copying is not supported in this browser.");
        return;
      }

      setIsExporting(true);
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
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-sm">
      {/* File & Dimension Stats */}
      <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium truncate max-w-[180px]">
          <FileImage className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="truncate" title={originalFile.name}>
            {originalFile.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
          <span>{dimensions.width}×{dimensions.height}</span>
          <span>•</span>
          <span>{formatBytes(resultBlob.size)}</span>
        </div>
      </div>

      {/* Format Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedFormat("image/png")}
            aria-pressed={selectedFormat === "image/png"}
            className={`flex flex-col items-start rounded-lg p-2 text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selectedFormat === "image/png"
                ? "bg-blue-600/10 border-blue-500 text-white"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <span className="text-xs font-semibold">PNG</span>
            <span className="text-[10px] text-zinc-400">Lossless & Alpha</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("image/webp")}
            aria-pressed={selectedFormat === "image/webp"}
            className={`flex flex-col items-start rounded-lg p-2 text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selectedFormat === "image/webp"
                ? "bg-blue-600/10 border-blue-500 text-white"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <span className="text-xs font-semibold">WebP</span>
            <span className="text-[10px] text-zinc-400">Smaller file size</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Primary Download Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownload}
          id="btn-download-result"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Rendering export...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>
                Download {selectedFormat === "image/webp" ? "WebP" : "PNG"}
                {isColored ? " (Solid BG)" : " (Cutout)"}
              </span>
            </>
          )}
        </button>

        {/* Secondary Copy Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleCopyToClipboard}
          id="btn-copy-clipboard"
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium py-2 px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-zinc-400" />
              <span>Copy Image to Clipboard</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-[10px] text-zinc-500 pt-1">
        Full Resolution • No Watermarks • Free for Commercial Use
      </div>
    </div>
  );
}
