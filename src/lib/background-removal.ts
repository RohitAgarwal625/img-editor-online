export interface RemovalProgress {
  stage: "init" | "loading-model" | "processing" | "complete" | "error";
  percent: number;
  message: string;
}

export interface RemovalResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export type ProgressCallback = (progress: RemovalProgress) => void;

export interface EngineTimings {
  [stage: string]: number;
}

/**
 * Primary path: server engine (POST /api/remove-background).
 * Progress is real: upload bytes are reported; server work is reported as an
 * indeterminate stage (percent = -1) rather than a simulated percentage.
 * Falls back to in-browser IS-Net only if the server engine is unavailable.
 */
export async function removeImageBackground(
  imageSource: File | Blob,
  onProgress?: ProgressCallback
): Promise<RemovalResult & { timings?: EngineTimings; engine: "server" | "browser" }> {
  try {
    return { ...(await removeViaServer(imageSource, onProgress)), engine: "server" };
  } catch (err) {
    const status = (err as { status?: number }).status;
    // Client errors (bad/oversized image) must not silently fall back.
    if (status && status >= 400 && status < 500 && status !== 404) throw err;
    console.warn("[bg] server engine unavailable, using browser fallback:", err);
    return { ...(await removeImageBackgroundInBrowser(imageSource, onProgress)), engine: "browser" };
  }
}

function removeViaServer(file: Blob, onProgress?: ProgressCallback) {
  return new Promise<RemovalResult & { timings?: EngineTimings }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const t0 = performance.now();
    xhr.open("POST", "/api/remove-background");
    xhr.responseType = "blob";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress?.({ stage: "init", percent: Math.round((e.loaded / e.total) * 100), message: "Uploading image..." });
    };
    xhr.upload.onload = () =>
      onProgress?.({ stage: "processing", percent: -1, message: "Detecting subject & refining edges..." });
    xhr.onerror = () => reject(Object.assign(new Error("Network error"), { status: 0 }));
    xhr.onload = async () => {
      if (xhr.status !== 200) {
        let msg = `Server error ${xhr.status}`;
        try { msg = JSON.parse(await (xhr.response as Blob).text()).error || msg; } catch {}
        return reject(Object.assign(new Error(msg), { status: xhr.status }));
      }
      const blob = xhr.response as Blob;
      const [w, h] = (xhr.getResponseHeader("x-resolution") || "0x0").split("x").map(Number);
      let timings: EngineTimings | undefined;
      try { timings = JSON.parse(xhr.getResponseHeader("x-engine-timings") || ""); } catch {}
      if (timings) timings.clientRoundTripMs = Math.round(performance.now() - t0);
      onProgress?.({ stage: "complete", percent: 100, message: "Background removed successfully!" });
      resolve({ blob, url: URL.createObjectURL(blob), width: w, height: h, timings });
    };
    const fd = new FormData();
    fd.append("image", file);
    xhr.send(fd);
  });
}

/**
 * Fallback: in-browser via @imgly/background-removal ONNX runtime.
 */
export async function removeImageBackgroundInBrowser(
  imageSource: File | Blob | string,
  onProgress?: ProgressCallback
): Promise<RemovalResult> {
  if (typeof window === "undefined") {
    throw new Error("Background removal must be run in the browser environment.");
  }

  onProgress?.({
    stage: "init",
    percent: 5,
    message: "Initializing AI engine...",
  });

  try {
    // Dynamically import the library
    const { removeBackground } = await import("@imgly/background-removal");

    const blob = await removeBackground(imageSource, {
      debug: false,
      model: "isnet_fp16",
      output: {
        format: "image/png",
        quality: 1.0,
      },
      progress: (key: string, current: number, total: number) => {
        let percent = 0;
        if (total > 0) {
          percent = Math.min(100, Math.round((current / total) * 100));
        }

        const isFetching = key.includes("fetch") || key.includes("download") || key.includes("model");
        const stage: RemovalProgress["stage"] = isFetching ? "loading-model" : "processing";

        let message = "Processing image...";
        if (isFetching) {
          message = percent > 0 
            ? `Downloading AI model... ${percent}% (one-time)`
            : "Downloading AI neural model...";
        } else {
          message = percent > 0
            ? `Detecting subject & removing background... ${percent}%`
            : "Detecting subject & removing background...";
        }

        onProgress?.({
          stage,
          percent,
          message,
        });
      },
    });

    onProgress?.({
      stage: "complete",
      percent: 100,
      message: "Background removed successfully!",
    });

    // Create object URL and get natural dimensions
    const url = URL.createObjectURL(blob);
    const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });

    return {
      blob,
      url,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to remove background";
    onProgress?.({
      stage: "error",
      percent: 0,
      message: errorMsg,
    });
    throw err;
  }
}
