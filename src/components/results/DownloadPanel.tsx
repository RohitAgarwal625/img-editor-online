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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* File & Dimension Stats */}
      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[180px]">
          <FileImage className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="truncate" title={originalFile.name}>
            {originalFile.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>{dimensions.width} × {dimensions.height}</span>
          <span>•</span>
          <span>{formatBytes(resultBlob.size)}</span>
        </div>
      </div>

      {/* Format Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedFormat("image/png")}
            aria-pressed={selectedFormat === "image/png"}
            className={`flex flex-col items-start rounded-xl p-3 text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              selectedFormat === "image/png"
                ? "bg-blue-50 border-blue-600 text-blue-950 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="text-xs font-bold">PNG</span>
            <span className="text-[11px] text-slate-500">Lossless & Alpha</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFormat("image/webp")}
            aria-pressed={selectedFormat === "image/webp"}
            className={`flex flex-col items-start rounded-xl p-3 text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              selectedFormat === "image/webp"
                ? "bg-blue-50 border-blue-600 text-blue-950 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="text-xs font-bold">WebP</span>
            <span className="text-[11px] text-slate-500">Smaller file size</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Primary Download Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownload}
          id="btn-download-result"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-101 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Rendering export...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>
                Download {selectedFormat === "image/webp" ? "WebP" : "PNG"}
                {isColored ? " (Solid BG)" : " (Transparent)"}
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
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold py-2.5 px-3 text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-800 font-bold">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy to Clipboard</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-[11px] font-medium text-slate-500 pt-1">
        Full Original Resolution • No Watermark • 100% Free
      </div>
    </div>
  );
}
