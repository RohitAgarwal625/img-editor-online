"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, ArrowRight, Clipboard } from "lucide-react";
import { validateImageFile } from "@/lib/image-validation";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const SAMPLE_IMAGES = [
  {
    id: "person",
    name: "Portrait",
    description: "Fine hair & shoulder silhouette",
    url: "/samples/sample-person.jpg",
  },
  {
    id: "product",
    name: "E-Commerce",
    description: "Crisp studio product cutout",
    url: "/samples/sample-product.jpg",
  },
  {
    id: "animal",
    name: "Pet Fur",
    description: "Soft fur & whisker matting",
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

  // Clipboard paste listener
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
    <div
      id="upload"
      className="w-full max-w-2xl mx-auto space-y-4"
      role="region"
      aria-label="Image upload and sample selector"
    >
      {/* Primary Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Drag and drop image or press to browse files"
        className={`relative rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isDragging
            ? "border-blue-500 bg-blue-950/20"
            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
          tabIndex={-1}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
            <UploadCloud className="h-6 w-6 text-blue-400" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-zinc-100">
              Drag and drop your photo here
            </p>
            <p className="text-xs text-zinc-400">
              or browse from your computer
            </p>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 text-xs sm:text-sm transition-colors shadow-sm">
              <ImageIcon className="h-4 w-4" />
              <span>Choose Image</span>
            </span>
          </div>

          {/* Quick clipboard paste helper */}
          <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500">
            <Clipboard className="h-3.5 w-3.5" />
            <span>
              Tip: Press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">⌘V</kbd> or <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700">Ctrl+V</kbd> anywhere to paste a screenshot
            </span>
          </div>

          {/* Format specifications */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-500">
            <span>Supports JPEG, PNG, WebP, BMP, GIF</span>
            <span>•</span>
            <span>Max 25MB</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg bg-red-950/40 border border-red-800/80 p-3.5 text-xs text-red-200"
        >
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Real Sample Images Row */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-800/60">
          <span className="text-xs font-medium text-zinc-400">
            Try with an example image:
          </span>
          <span className="text-[11px] text-zinc-500">Instant test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || isLoadingSample !== null}
              onClick={() => handleSelectSample(sample)}
              className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/70 p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              <div className="h-10 w-10 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {sample.name}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {isLoadingSample === sample.id ? "Loading..." : sample.description}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
