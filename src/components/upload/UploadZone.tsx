"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { validateImageFile } from "@/lib/image-validation";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const SAMPLE_IMAGES = [
  {
    id: "person",
    name: "Portrait",
    description: "Hair & edge details",
    url: "/samples/sample-person.jpg",
  },
  {
    id: "product",
    name: "E-Commerce Product",
    description: "Clean product cutout",
    url: "/samples/sample-product.jpg",
  },
  {
    id: "animal",
    name: "Pet / Fur",
    description: "Complex fine fur matting",
    url: "/samples/sample-animal.jpg",
  },
];

export function UploadZone({ onFileSelected, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setErrorMessage(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid file format");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  // Handle Drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Clipboard paste listener (Cmd+V / Ctrl+V support)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, processFile]);

  // Load sample image
  const handleSelectSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    try {
      setIsLoadingSample(sample.id);
      setErrorMessage(null);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], `${sample.id}-sample.jpg`, { type: "image/jpeg" });
      processFile(file);
    } catch (err) {
      console.error("Failed to load sample image", err);
      setErrorMessage("Could not load sample image. Please try uploading your own photo.");
    } finally {
      setIsLoadingSample(null);
    }
  };

  return (
    <div id="upload" className="w-full max-w-3xl mx-auto space-y-6">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative group rounded-3xl p-8 sm:p-12 transition-all duration-300 cursor-pointer text-center border-2 border-dashed ${
          isDragging
            ? "border-indigo-400 bg-indigo-950/40 shadow-2xl shadow-indigo-500/20 scale-[1.01]"
            : "border-slate-700/80 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900/90 shadow-xl backdrop-blur-md"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        {/* Center Glow */}
        <div className="absolute inset-0 rounded-3xl glow-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
          {/* Upload Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/80">
              <UploadCloud className="h-10 w-10 text-indigo-300 transition-transform group-hover:-translate-y-1" />
            </div>
          </div>

          {/* Heading and Action */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              Drag & Drop your image here
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              or browse from your device, or simply press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300 border border-slate-700">Cmd+V</kbd> to paste
            </p>
          </div>

          {/* Button CTA */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold px-8 py-3.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-200 active:scale-95 text-sm sm:text-base"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Upload Image</span>
          </button>

          {/* Formats and Size badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <span className="rounded-md bg-slate-800/80 px-2 py-0.5 border border-slate-700/60 font-medium text-slate-300">JPEG</span>
            <span className="rounded-md bg-slate-800/80 px-2 py-0.5 border border-slate-700/60 font-medium text-slate-300">PNG</span>
            <span className="rounded-md bg-slate-800/80 px-2 py-0.5 border border-slate-700/60 font-medium text-slate-300">WebP</span>
            <span className="rounded-md bg-slate-800/80 px-2 py-0.5 border border-slate-700/60 font-medium text-slate-300">BMP</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Up to 25MB</span>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Sample Images Row */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>No image on hand? Try a sample</span>
          </div>
          <span className="text-[11px] text-slate-500">Instant one-click demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || isLoadingSample !== null}
              onClick={() => handleSelectSample(sample)}
              className="group/sample flex items-center gap-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 p-2 text-left transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="h-full w-full object-cover group-hover/sample:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate group-hover/sample:text-indigo-300">
                  {sample.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {isLoadingSample === sample.id ? "Loading..." : sample.description}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover/sample:text-indigo-400 group-hover/sample:translate-x-0.5 transition-all shrink-0 mr-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
