export const SUPPORTED_FORMATS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
};

export const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];
export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_DIMENSION_PX = 8000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export function validateImageFile(file: File): ValidationResult {
  // Check MIME type or extension fallback
  const isMimeSupported = Object.prototype.hasOwnProperty.call(SUPPORTED_FORMATS, file.type);
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  const isExtSupported = SUPPORTED_EXTENSIONS.includes(ext);

  if (!isMimeSupported && !isExtSupported) {
    if (ext.match(/\.(cr2|nef|arw|dng|raw)$/i)) {
      return {
        valid: false,
        error: "RAW formats are coming soon in v2. Please upload JPEG, PNG, or WebP.",
      };
    }
    return {
      valid: false,
      error: `Unsupported format (${file.type || ext}). Please upload JPEG, PNG, WebP, GIF, or BMP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "The selected file is empty. Please select a valid image.",
    };
  }

  return { valid: true };
}

export function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image dimensions"));
    };
    img.src = url;
  });
}
