"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, AlertCircle, ArrowRight, Clipboard, ShieldCheck } from "lucide-react";
import { validateImageFile } from "@/lib/image-validation";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const SAMPLE_IMAGES = [
  {
    id: "person",
    name: "Portrait",
    url: "/samples/sample-person.jpg",
  },
  {
    id: "product",
    name: "Product",
    url: "/samples/sample-product.jpg",
  },
  {
    id: "animal",
    name: "Pet Fur",
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
      className="w-full space-y-4"
      role="region"
      aria-label="File upload section"
    >
      {/* Upload Card */}
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
        aria-label="Upload an image by clicking or dragging here"
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          isDragging
            ? "border-blue-600 bg-blue-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/60"
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
          {/* Big Blue CTA Button */}
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 text-base sm:text-lg shadow-md shadow-blue-600/25 transition-transform hover:scale-102 active:scale-98"
          >
            <Upload className="h-5 w-5 stroke-[2.5]" />
            <span>Upload Image</span>
          </button>

          {/* Hint text */}
          <div className="space-y-1 text-slate-500 text-sm">
            <p className="font-medium text-slate-700">or drop a file here</p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Clipboard className="h-3.5 w-3.5 text-slate-400" />
              <span>paste image or screenshot (<kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 border border-slate-300">⌘V</kbd>)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800"
        >
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Try with an example row */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">No image? Try one of these:</span>
          <span className="text-[11px]">Instant 1-click test</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || isLoadingSample !== null}
              onClick={() => handleSelectSample(sample)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 group"
            >
              <div className="h-9 w-9 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700">
                  {sample.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {isLoadingSample === sample.id ? "Loading..." : "Test now"}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 shrink-0 mr-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Specs note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Supports JPEG, PNG, WebP • Up to 25MB</span>
        <span className="flex items-center gap-1 text-emerald-700 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Never uploaded to servers</span>
        </span>
      </div>
    </div>
  );
}
