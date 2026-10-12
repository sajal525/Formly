/**
 * Pure TypeScript raster image validator and dimensions parser.
 * Inspects binary magic bytes and headers to guarantee safe raster formats (JPEG, PNG, WebP)
 * and enforce byte-size and megapixel limits without relying on client-supplied headers.
 */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MiB
export const MAX_PIXELS = 25_000_000; // 25 Megapixels
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface ImageValidationResult {
  valid: boolean;
  contentType?: AllowedMimeType;
  width?: number;
  height?: number;
  byteSize: number;
  error?: string;
}

export function validateImageBuffer(buffer: Buffer): ImageValidationResult {
  const byteSize = buffer.length;

  if (byteSize === 0) {
    return { valid: false, byteSize, error: "Empty file provided." };
  }

  if (byteSize > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      byteSize,
      error: `File size exceeds maximum allowed limit of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  // Reject SVG, HTML, or script content inside image
  const sampleHead = buffer.subarray(0, Math.min(buffer.length, 1024)).toString("utf8").toLowerCase();
  if (
    sampleHead.includes("<svg") ||
    sampleHead.includes("<?xml") ||
    sampleHead.includes("<html") ||
    sampleHead.includes("<script")
  ) {
    return {
      valid: false,
      byteSize,
      error: "SVG and script-containing formats are strictly rejected for security.",
    };
  }

  // 1. Check PNG
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    // IHDR is located at offset 12-15
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return checkDimensions("image/png", width, height, byteSize);
  }

  // 2. Check JPEG
  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    let offset = 2;
    let width = 0;
    let height = 0;

    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = buffer[offset + 1];
      // SOF0 (0xc0) to SOF3 (0xc3) or SOF9 (0xc9) to SOF11 (0xcb)
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc9 && marker <= 0xcb)
      ) {
        height = buffer.readUInt16BE(offset + 5);
        width = buffer.readUInt16BE(offset + 7);
        break;
      }

      // Next marker length
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
      } else {
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    if (width > 0 && height > 0) {
      return checkDimensions("image/jpeg", width, height, byteSize);
    }
    // Fallback if dimensions marker not reached in scan
    return { valid: true, contentType: "image/jpeg", byteSize };
  }

  // 3. Check WebP
  if (
    buffer.length >= 30 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunkType = buffer.toString("ascii", 12, 16);

    if (chunkType === "VP8 ") {
      // Lossy WebP
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return checkDimensions("image/webp", width, height, byteSize);
    } else if (chunkType === "VP8L") {
      // Lossless WebP
      if (buffer[20] === 0x2f) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return checkDimensions("image/webp", width, height, byteSize);
      }
    } else if (chunkType === "VP8X") {
      // Extended WebP
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return checkDimensions("image/webp", width, height, byteSize);
    }

    return { valid: true, contentType: "image/webp", byteSize };
  }

  return {
    valid: false,
    byteSize,
    error: "Unsupported file type. Only JPEG, PNG, and WebP images are supported.",
  };
}

function checkDimensions(
  contentType: AllowedMimeType,
  width: number,
  height: number,
  byteSize: number
): ImageValidationResult {
  if (width <= 0 || height <= 0) {
    return {
      valid: false,
      byteSize,
      error: "Could not read valid image dimensions.",
    };
  }

  const pixels = width * height;
  if (pixels > MAX_PIXELS) {
    return {
      valid: false,
      byteSize,
      error: `Image dimensions (${width}x${height} = ${(pixels / 1_000_000).toFixed(1)}MP) exceed maximum limit of 25 megapixels.`,
    };
  }

  return {
    valid: true,
    contentType,
    width,
    height,
    byteSize,
  };
}
