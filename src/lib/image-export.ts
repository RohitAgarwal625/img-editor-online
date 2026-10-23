export type ExportFormat = "image/png" | "image/webp" | "image/jpeg";

export interface CompositeOptions {
  backgroundColor?: string; // hex, rgb, or 'transparent'
  format?: ExportFormat;
  quality?: number; // 0 to 1
}

/**
 * Composite a transparent image onto an optional background color using HTML Canvas,
 * returning a new Blob with the selected format and quality.
 */
export async function compositeImage(
  imageSource: Blob | string,
  options: CompositeOptions = {}
): Promise<Blob> {
  const {
    backgroundColor = "transparent",
    format = "image/png",
    quality = 0.95,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      if (typeof imageSource !== "string") {
        URL.revokeObjectURL(objectUrl);
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      // If background color is specified and not transparent
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw original transparent image on top
      ctx.drawImage(img, 0, 0);

      // Export to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas export to blob failed"));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      if (typeof imageSource !== "string") {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error("Failed to load image for compositing"));
    };

    img.crossOrigin = "anonymous";
    img.src = objectUrl;
  });
}

/**
 * Trigger client-side file download for a Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup after small delay
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Format bytes into readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
