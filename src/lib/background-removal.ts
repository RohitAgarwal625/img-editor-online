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

/**
 * Remove image background in-browser via @imgly/background-removal ONNX runtime.
 * Dynamically imported to ensure client-only execution.
 */
export async function removeImageBackground(
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
