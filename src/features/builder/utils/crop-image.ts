/**
 * Canvas-based image cropping and transformation utility.
 * Handles rotation, horizontal/vertical flipping, and precise pixel cropping.
 */

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlipState {
  horizontal: boolean;
  vertical: boolean;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Returns a high-quality cropped Blob from an image source based on react-easy-crop coordinates.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  flip: FlipState = { horizontal: false, vertical: false },
  mimeType = "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for cropping.");
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    rotation
  );

  // Set canvas size to match the rotated bounding box
  canvas.width = Math.ceil(bBoxWidth);
  canvas.height = Math.ceil(bBoxHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Translate canvas context to a central location to rotate and flip around the center
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(
    -(image.naturalWidth || image.width) / 2,
    -(image.naturalHeight || image.height) / 2
  );

  // Draw rotated & flipped image onto the bounding canvas
  ctx.drawImage(image, 0, 0);

  // Create the target crop canvas
  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");

  if (!cropCtx) {
    throw new Error("Unable to create 2D context for final crop canvas.");
  }

  // Set crop canvas dimensions
  const cropWidth = Math.max(1, Math.round(pixelCrop.width));
  const cropHeight = Math.max(1, Math.round(pixelCrop.height));
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;

  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = "high";

  // Draw the cropped region from the bounding canvas
  cropCtx.drawImage(
    canvas,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise<Blob>((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed to produce an image blob."));
        }
      },
      mimeType,
      quality
    );
  });
}
