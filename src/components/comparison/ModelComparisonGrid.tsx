"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Check, Loader2, ZoomIn, ZoomOut, Layers, RefreshCw, AlertCircle, Wand2 } from "lucide-react";

export type ModelId = "isnet" | "isnet-guided" | "modnet" | "birefnet" | "hybrid-fusion";

export interface ModelComparisonData {
  id: ModelId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  architecture: string;
  latency: string;
  strengths: string;
  idealFor: string;
  url: string | null;
  loading?: boolean;
  progress?: number;
  statusText?: string;
  error?: string | null;
}

interface ModelComparisonGridProps {
  originalUrl: string;
  isNetUrl: string;
  isNetBlob?: Blob | null;
  modnetUrl?: string | null;
  birefnetUrl?: string | null;
  hybridFusionUrl?: string | null;
  isnetGuidedUrl?: string | null;
  file?: File;
  activeModelId?: ModelId;
  onSelectModel?: (modelId: ModelId, url: string) => void;
  showSelector?: boolean;
}

/**
 * Executes multipart upload with simulated neural inference progress tracking.
 */
function runModelInference(
  endpoint: string,
  file: File,
  estimatedInferenceMs: number,
  onProgress: (percent: number, status: string) => void,
  extraFields?: Record<string, Blob | File | string>
): Promise<{ url: string; latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    let tickerInterval: NodeJS.Timeout | null = null;
    let currentPercent = 5;

    xhr.open("POST", endpoint, true);
    xhr.responseType = "blob";

    // Track real network upload progress (0% -> 25%)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const uploadFrac = e.loaded / e.total;
        currentPercent = Math.min(25, Math.round(uploadFrac * 25));
        onProgress(currentPercent, `Uploading photo... ${currentPercent}%`);
      }
    };

    // When upload finishes, start neural progress ticker (25% -> 92%)
    xhr.upload.onload = () => {
      currentPercent = 28;
      onProgress(currentPercent, "Initializing neural pipeline...");

      const stepMs = 120;
      const targetPercent = 92;
      const totalSteps = estimatedInferenceMs / stepMs;
      const percentPerStep = (targetPercent - 28) / Math.max(1, totalSteps);

      tickerInterval = setInterval(() => {
        if (currentPercent < targetPercent) {
          currentPercent = Math.min(targetPercent, +(currentPercent + percentPerStep).toFixed(1));
          let status = "Running neural inference...";
          if (currentPercent > 70) {
            status = "Refining sub-pixel alpha boundaries...";
          } else if (currentPercent > 45) {
            status = "Segmenting foreground subject...";
          }
          onProgress(Math.round(currentPercent), `${status} ${Math.round(currentPercent)}%`);
        }
      }, stepMs);
    };

    xhr.onload = () => {
      if (tickerInterval) clearInterval(tickerInterval);

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100, "Complete! 100%");
        const latencyHeader = xhr.getResponseHeader("x-inference-time-ms");
        const latencyMs = latencyHeader ? parseInt(latencyHeader, 10) : Date.now() - startTime;
        const blob = xhr.response as Blob;
        const url = URL.createObjectURL(blob);
        resolve({ url, latencyMs });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errObj = JSON.parse(reader.result as string);
            reject(new Error(errObj.error || `Server returned error ${xhr.status}`));
          } catch {
            reject(new Error(`Server error (${xhr.status}): Failed to process model inference`));
          }
        };
        reader.onerror = () => reject(new Error(`Server error ${xhr.status}`));
        reader.readAsText(xhr.response);
      }
    };

    xhr.onerror = () => {
      if (tickerInterval) clearInterval(tickerInterval);
      reject(new Error("Network connection error"));
    };

    xhr.ontimeout = () => {
      if (tickerInterval) clearInterval(tickerInterval);
      reject(new Error("Inference request timed out"));
    };

    const formData = new FormData();
    formData.append("image", file);
    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) {
        formData.append(k, v);
      }
    }
    xhr.send(formData);
  });
}

export function ModelComparisonGrid({
  originalUrl: _originalUrl,
  isNetUrl,
  isNetBlob,
  modnetUrl: initialModnetUrl,
  birefnetUrl: initialBirefnetUrl,
  hybridFusionUrl: initialHybridFusionUrl,
  isnetGuidedUrl: initialIsnetGuidedUrl,
  file,
  activeModelId = "isnet",
  onSelectModel,
  showSelector = true,
}: ModelComparisonGridProps) {
  // Model Cutout URLs
  const [modnetUrl, setModnetUrl] = useState<string | null>(initialModnetUrl || null);
  const [birefnetUrl, setBirefnetUrl] = useState<string | null>(initialBirefnetUrl || null);
  const [hybridFusionUrl, setHybridFusionUrl] = useState<string | null>(initialHybridFusionUrl || null);
  const [isnetGuidedUrl, setIsnetGuidedUrl] = useState<string | null>(initialIsnetGuidedUrl || null);

  // Loading States
  const [loadingModnet, setLoadingModnet] = useState<boolean>(false);
  const [loadingBiRefNet, setLoadingBiRefNet] = useState<boolean>(false);
  const [loadingHybrid, setLoadingHybrid] = useState<boolean>(false);
  const [loadingGuided, setLoadingGuided] = useState<boolean>(false);

  // Progress Percentages
  const [modnetProgress, setModnetProgress] = useState<number>(initialModnetUrl ? 100 : 0);
  const [birefnetProgress, setBirefnetProgress] = useState<number>(initialBirefnetUrl ? 100 : 0);
  const [hybridProgress, setHybridProgress] = useState<number>(initialHybridFusionUrl ? 100 : 0);
  const [guidedProgress, setGuidedProgress] = useState<number>(initialIsnetGuidedUrl ? 100 : 0);

  // Status Strings
  const [modnetStatus, setModnetStatus] = useState<string>(initialModnetUrl ? "Complete" : "Pending");
  const [birefnetStatus, setBirefnetStatus] = useState<string>(initialBirefnetUrl ? "Complete" : "Pending");
  const [hybridStatus, setHybridStatus] = useState<string>(initialHybridFusionUrl ? "Complete" : "Pending");
  const [guidedStatus, setGuidedStatus] = useState<string>(initialIsnetGuidedUrl ? "Complete" : "Pending");

  // Errors
  const [modnetError, setModnetError] = useState<string | null>(null);
  const [birefnetError, setBirefnetError] = useState<string | null>(null);
  const [hybridError, setHybridError] = useState<string | null>(null);
  const [guidedError, setGuidedError] = useState<string | null>(null);

  // Latencies
  const [modnetLatency, setModnetLatency] = useState<string>("~420 ms");
  const [birefnetLatency, setBirefnetLatency] = useState<string>("~6.8 s");
  const [hybridLatency, setHybridLatency] = useState<string>("~7.2 s");
  const [guidedLatency, setGuidedLatency] = useState<string>("~180 ms");

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<ModelId>(activeModelId);

  const requestedRef = useRef<boolean>(false);

  // Function to run MODNet
  const executeModnet = useCallback(async (targetFile: File) => {
    setLoadingModnet(true);
    setModnetError(null);
    setModnetProgress(5);
    setModnetStatus("Starting MODNet matting engine...");

    try {
      const res = await runModelInference(
        "/api/modnet",
        targetFile,
        1500,
        (percent, status) => {
          setModnetProgress(percent);
          setModnetStatus(status);
        }
      );
      setModnetUrl(res.url);
      setModnetLatency(`${res.latencyMs} ms`);
      setModnetProgress(100);
      setModnetStatus("Complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "MODNet inference failed";
      console.error("[MODNet Error]:", err);
      setModnetError(msg);
      setModnetStatus("Failed");
    } finally {
      setLoadingModnet(false);
    }
  }, []);

  // Function to run BiRefNet
  const executeBiRefNet = useCallback(async (targetFile: File) => {
    setLoadingBiRefNet(true);
    setBirefnetError(null);
    setBirefnetProgress(5);
    setBirefnetStatus("Starting BiRefNet 1024px engine...");

    try {
      const res = await runModelInference(
        "/api/birefnet",
        targetFile,
        7000,
        (percent, status) => {
          setBirefnetProgress(percent);
          setBirefnetStatus(status);
        }
      );
      setBirefnetUrl(res.url);
      setBirefnetLatency(`${(res.latencyMs / 1000).toFixed(1)} s`);
      setBirefnetProgress(100);
      setBirefnetStatus("Complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "BiRefNet inference failed";
      console.error("[BiRefNet Error]:", err);
      setBirefnetError(msg);
      setBirefnetStatus("Failed");
    } finally {
      setLoadingBiRefNet(false);
    }
  }, []);

  // Function to run Hybrid Fusion (BiRefNet + MODNet)
  const executeHybridFusion = useCallback(async (targetFile: File) => {
    setLoadingHybrid(true);
    setHybridError(null);
    setHybridProgress(5);
    setHybridStatus("Starting dual-model fusion engine...");

    try {
      const res = await runModelInference(
        "/api/hybrid-fusion",
        targetFile,
        8000,
        (percent, status) => {
          setHybridProgress(percent);
          setHybridStatus(status);
        }
      );
      setHybridFusionUrl(res.url);
      setHybridLatency(`${(res.latencyMs / 1000).toFixed(1)} s`);
      setHybridProgress(100);
      setHybridStatus("Complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hybrid Fusion inference failed";
      console.error("[Hybrid Fusion Error]:", err);
      setHybridError(msg);
      setHybridStatus("Failed");
    } finally {
      setLoadingHybrid(false);
    }
  }, []);

  // Function to run Guided Filter refinement on IS-Net
  const executeGuidedFilter = useCallback(async (targetFile: File, baseCutoutBlob?: Blob | null) => {
    setLoadingGuided(true);
    setGuidedError(null);
    setGuidedProgress(10);
    setGuidedStatus("Photometric edge realignment...");

    try {
      const extraFields: Record<string, Blob | File | string> = {};
      if (baseCutoutBlob) {
        extraFields["cutout"] = baseCutoutBlob;
      }

      const res = await runModelInference(
        "/api/guided-filter",
        targetFile,
        800,
        (percent, status) => {
          setGuidedProgress(percent);
          setGuidedStatus(status);
        },
        extraFields
      );
      setIsnetGuidedUrl(res.url);
      setGuidedLatency(`${res.latencyMs} ms`);
      setGuidedProgress(100);
      setGuidedStatus("Complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Guided Filter refinement failed";
      console.error("[Guided Filter Error]:", err);
      setGuidedError(msg);
      setGuidedStatus("Failed");
    } finally {
      setLoadingGuided(false);
    }
  }, []);

  // Trigger processing for missing cutouts when file is provided
  useEffect(() => {
    if (!file || requestedRef.current) return;
    requestedRef.current = true;

    if (!modnetUrl) {
      executeModnet(file);
    }
    if (!birefnetUrl) {
      executeBiRefNet(file);
    }
    if (!hybridFusionUrl) {
      executeHybridFusion(file);
    }
    if (!isnetGuidedUrl) {
      executeGuidedFilter(file, isNetBlob);
    }
  }, [file, modnetUrl, birefnetUrl, hybridFusionUrl, isnetGuidedUrl, isNetBlob, executeModnet, executeBiRefNet, executeHybridFusion, executeGuidedFilter]);

  const models: ModelComparisonData[] = [
    {
      id: "isnet",
      name: "IS-Net (DIS)",
      tagline: "Client In-Browser WASM/GPU",
      badge: "Zero Server Cost",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      architecture: "Intermediate Supervision / Residual U-Blocks",
      latency: "~1.2 s (Client)",
      strengths: "100% Client-side privacy, zero server cost, rapid salient segmentation.",
      idealFor: "E-commerce products, solid objects, and zero-latency client privacy.",
      url: isNetUrl,
      progress: 100,
      statusText: "Ready",
    },
    {
      id: "isnet-guided",
      name: "IS-Net + Guided",
      tagline: "Photometric Edge Refinement",
      badge: "Option 2: O(N) Edge Fix",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      architecture: "He et al. Guided Filter (Luminance Optical Edge)",
      latency: guidedLatency,
      strengths: "Eliminates pixelated staircasing and halo fringing by snapping mask alpha to true RGB edges.",
      idealFor: "Fast edge refinement on products, clothing boundaries, and semi-transparent outlines.",
      url: isnetGuidedUrl,
      loading: loadingGuided,
      progress: guidedProgress,
      statusText: guidedStatus,
      error: guidedError,
    },
    {
      id: "modnet",
      name: "MODNet",
      tagline: "Sub-Pixel Portrait Matting",
      badge: "Tripartite Matting SOTA",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      architecture: "Tripartite Semantic + Detail + Fusion Matting",
      latency: modnetLatency,
      strengths: "Continuous fractional alpha (α ∈ [0, 1]), silky flyaway hair strands, zero color fringe.",
      idealFor: "People, models, fine curly hair, and social media portrait headshots.",
      url: modnetUrl,
      loading: loadingModnet,
      progress: modnetProgress,
      statusText: modnetStatus,
      error: modnetError,
    },
    {
      id: "birefnet",
      name: "BiRefNet",
      tagline: "Bilateral Reference High-Res",
      badge: "Bilateral SOTA (1024px)",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      architecture: "Inward & Outward Bilateral Guidance with Swin Backbone",
      latency: birefnetLatency,
      strengths: "Ultra-fine hierarchical boundary cues, complex geometries, and solid subject interior.",
      idealFor: "Complex contours, architectural depth, fine fashion silhouettes, and automotive spokes.",
      url: birefnetUrl,
      loading: loadingBiRefNet,
      progress: birefnetProgress,
      statusText: birefnetStatus,
      error: birefnetError,
    },
    {
      id: "hybrid-fusion",
      name: "Hybrid Fusion",
      tagline: "BiRefNet Core + MODNet Alpha",
      badge: "Option 1: Dual-Model SOTA",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300",
      architecture: "Bilateral Swin Core Mask + Sub-Pixel Matting Fusion",
      latency: hybridLatency,
      strengths: "Solves interior fabric holes via BiRefNet core while retaining MODNet's ultra-fine hair strands.",
      idealFor: "Studio-grade portraits where both clothing integrity and intricate hair wisps are critical.",
      url: hybridFusionUrl,
      loading: loadingHybrid,
      progress: hybridProgress,
      statusText: hybridStatus,
      error: hybridError,
    },
  ];

  const handleSelect = (id: ModelId, url: string | null) => {
    if (!url) return;
    setSelectedId(id);
    onSelectModel?.(id, url);
  };

  return (
    <div className="w-full space-y-4">
      {/* Zoom and Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                5-Model AI Showdown
              </h3>
              <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                5 Live Outputs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Compare IS-Net, MODNet, BiRefNet, Hybrid Fusion, and Guided Edge Refinement side-by-side
            </p>
          </div>
        </div>

        {/* Synchronized Microscopic Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Hair & Edge Zoom:</span>
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
              disabled={zoomLevel <= 1}
              className="rounded p-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-slate-800">
              {zoomLevel}x
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
              disabled={zoomLevel >= 3}
              className="rounded p-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
              title="Zoom in to inspect hair strands"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5-Column Responsive Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {models.map((model) => {
          const isSelected = selectedId === model.id;

          return (
            <div
              key={model.id}
              className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-sm hover:shadow-md ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-600/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1">
                    {model.name}
                    {isSelected && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white text-[9px]">
                        ✓
                      </span>
                    )}
                  </h4>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold border truncate max-w-[120px] ${model.badgeColor}`}
                  >
                    {model.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{model.tagline}</span>
                  <span className="font-mono font-bold text-slate-700 shrink-0">
                    ⚡ {model.latency}
                  </span>
                </div>
              </div>

              {/* Visual Cutout Canvas with Checkerboard & Synchronized Zoom */}
              <div className="relative h-60 sm:h-64 w-full checkerboard-pattern flex items-center justify-center overflow-hidden border-b border-slate-100 select-none bg-slate-50">
                {model.loading ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 p-4 w-full text-center">
                    <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                    
                    <div className="space-y-1 w-full max-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="truncate">{model.name}</span>
                        <span className="text-blue-600 font-mono text-xs font-black">
                          {model.progress || 0}%
                        </span>
                      </div>

                      {/* Progress Bar with smooth animation */}
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${model.progress || 0}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-500 font-medium truncate pt-0.5">
                        {model.statusText || "Processing..."}
                      </p>
                    </div>
                  </div>
                ) : model.error ? (
                  <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <AlertCircle className="h-7 w-7 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800">Inference Error</span>
                    <p className="text-[10px] text-slate-500 leading-tight max-w-[160px]">
                      {model.error}
                    </p>
                    {file && (
                      <button
                        type="button"
                        onClick={() => {
                          if (model.id === "modnet") executeModnet(file);
                          if (model.id === "birefnet") executeBiRefNet(file);
                          if (model.id === "hybrid-fusion") executeHybridFusion(file);
                          if (model.id === "isnet-guided") executeGuidedFilter(file, isNetBlob);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                ) : model.url ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-2.5 transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <img
                      src={model.url}
                      alt={`${model.name} background cutout result`}
                      className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.14)] pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Cutout pending</div>
                )}

                {/* Corner Indicator */}
                {!model.loading && !model.error && (
                  <div className="absolute bottom-2 left-2 rounded bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    {model.id === "modnet"
                      ? "Alpha Matte"
                      : model.id === "birefnet"
                      ? "Bilateral 1024px"
                      : model.id === "hybrid-fusion"
                      ? "Dual Fusion"
                      : model.id === "isnet-guided"
                      ? "Edge Refined"
                      : "IS-Net Base"}
                  </div>
                )}
              </div>

              {/* Technical Inspection Specs */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 text-xs bg-white">
                <div className="space-y-2 text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                      Edge Character:
                    </span>
                    <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                      {model.strengths}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                      Best Suited For:
                    </span>
                    <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                      {model.idealFor}
                    </p>
                  </div>
                </div>

                {/* Select / Download Trigger */}
                {showSelector && model.url && !model.loading && !model.error && (
                  <button
                    type="button"
                    onClick={() => handleSelect(model.id, model.url)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-2.5 text-[11px] font-bold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                        : "border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Active Cutout</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        <span>Use This Model</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
