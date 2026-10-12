"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  UploadCloud,
  RotateCcw,
  RotateCw,
  Crop as CropIcon,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  Maximize2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BuilderImageBlock,
  BuilderCoverImage,
  ImageAlignment,
  ImageDisplaySize,
} from "../../schemas/builder-definition-schema";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB
const MAX_PIXELS = 25_000_000; // 25 Megapixels
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  mode?: "content" | "cover";
  onInsertImage?: (newBlock: BuilderImageBlock) => void;
  editingBlock?: BuilderImageBlock | null;
  onSaveExistingBlock?: (updated: BuilderImageBlock) => void;
  onSaveCoverImage?: (cover: BuilderCoverImage) => void;
  editingCoverImage?: BuilderCoverImage | null;
}

type AspectPreset = "free" | "4:1" | "16:9" | "4:3" | "1:1" | "3:2";

async function createCroppedBlob({
  imageSrc,
  previewImg,
  frameWidth,
  frameHeight,
  naturalWidth,
  naturalHeight,
  zoom,
  panOffset,
  rotation,
  fineRotation,
  aspectPreset,
}: {
  imageSrc: string;
  previewImg?: HTMLImageElement | null;
  frameWidth: number;
  frameHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  panOffset: { x: number; y: number };
  rotation: number;
  fineRotation: number;
  aspectPreset: AspectPreset;
}): Promise<Blob> {
  const drawOnCanvas = (img: HTMLImageElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const nW = img.naturalWidth || naturalWidth || 1200;
        const nH = img.naturalHeight || naturalHeight || 800;

        const totalRotation = (rotation + fineRotation + 360) % 360;
        const rad = (totalRotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const rotWidth = nW * cos + nH * sin;
        const rotHeight = nW * sin + nH * cos;

        const fW = frameWidth > 0 ? frameWidth : 640;
        const fH = frameHeight > 0 ? frameHeight : 160;

        const baseScale = Math.max(fW / rotWidth, fH / rotHeight);

        let targetWidth = 1600;
        let targetHeight = 400; // 4:1 banner default
        if (aspectPreset === "16:9") {
          targetHeight = 900;
        } else if (aspectPreset === "free") {
          targetHeight = Math.round(targetWidth / (fW / fH));
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to create canvas context"));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const k = targetWidth / fW;

        ctx.save();
        ctx.translate(targetWidth / 2 + panOffset.x * k, targetHeight / 2 + panOffset.y * k);
        ctx.rotate(rad);
        ctx.scale(zoom, zoom);

        const canvasDrawWidth = nW * baseScale * k;
        const canvasDrawHeight = nH * baseScale * k;

        ctx.drawImage(
          img,
          -canvasDrawWidth / 2,
          -canvasDrawHeight / 2,
          canvasDrawWidth,
          canvasDrawHeight
        );
        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to export cropped canvas to blob"));
            }
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  if (previewImg && previewImg.complete && previewImg.naturalWidth > 0) {
    return drawOnCanvas(previewImg);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!imageSrc.startsWith("blob:") && !imageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      drawOnCanvas(img).then(resolve).catch(reject);
    };
    img.onerror = () => {
      reject(new Error("Failed to load source image for cropping"));
    };
    img.src = imageSrc;
  });
}

export function ImageUploadModal({
  isOpen,
  onClose,
  formId,
  mode = "content",
  onInsertImage,
  editingBlock,
  onSaveExistingBlock,
  onSaveCoverImage,
  editingCoverImage,
}: ImageUploadModalProps) {
  // Modal Stages: "dropzone" (file picker) or "adjust" (adjustment workspace)
  const [stage, setStage] = useState<"dropzone" | "adjust">("dropzone");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Adjustment Controls
  const [zoom, setZoom] = useState(1); // 1 to 3
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 (or deg)
  const [fineRotation, setFineRotation] = useState(0); // -45 to +45
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("free");
  const [displaySize, setDisplaySize] = useState<ImageDisplaySize>("medium");
  const [alignment, setAlignment] = useState<ImageAlignment>("center");
  const [altText, setAltText] = useState("");

  // Crop Box normalized coordinates (0 to 100 percentage)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  // Pan Offset in pixels
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPan: { x: number; y: number } }>({
    x: 0,
    y: 0,
    initialPan: { x: 0, y: 0 },
  });

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const originalAssetIdRef = useRef<string | null>(null);
  const savedNormPanRef = useRef<{ x: number; y: number } | null>(null);

  const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number }>({
    width: 640,
    height: 160,
  });

  const updateFrameDimensions = useCallback(() => {
    if (cropFrameRef.current) {
      const rect = cropFrameRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  // Initialize or reset when modal opens / closes
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
      setErrorMessage(null);
      setStage("dropzone");
      setZoom(1);
      setRotation(0);
      setFineRotation(0);
      setAspectPreset(mode === "cover" ? "4:1" : "free");
      setDisplaySize("medium");
      setAlignment("center");
      setAltText("");
      setCropBox(mode === "cover" ? { x: 0, y: 38, width: 100, height: 25 } : { x: 0, y: 0, width: 100, height: 100 });
      setPanOffset({ x: 0, y: 0 });
      setIsUploading(false);
      return;
    }

    if (mode === "cover") {
      if (editingCoverImage) {
        setAltText(editingCoverImage.altText || "");
        setRotation(editingCoverImage.transform?.rotation || 0);
        setFineRotation(editingCoverImage.transform?.fineAngle || 0);
        setZoom(editingCoverImage.transform?.zoom || 1);
        const savedPreset = (editingCoverImage.transform?.aspectPreset as AspectPreset) || "4:1";
        setAspectPreset(savedPreset);
        const sourceAssetId = editingCoverImage.originalAssetId || editingCoverImage.assetId;
        originalAssetIdRef.current = sourceAssetId;
        const existingUrl = `/api/v1/forms/${formId}/assets/${sourceAssetId}`;
        setPreviewUrl(existingUrl);
        savedNormPanRef.current = {
          x: editingCoverImage.transform?.panX || 0,
          y: editingCoverImage.transform?.panY || 0,
        };
        setStage("adjust");
      } else {
        originalAssetIdRef.current = null;
        savedNormPanRef.current = null;
        setAspectPreset("4:1");
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
        setRotation(0);
        setFineRotation(0);
        setStage("dropzone");
      }
      return;
    }

    // If editing existing block
    if (editingBlock) {
      setAltText(editingBlock.altText || "");
      setDisplaySize(editingBlock.displaySize || "medium");
      setAlignment(editingBlock.alignment || "center");
      setRotation(editingBlock.transform?.rotation || 0);
      if (editingBlock.transform?.crop) {
        setCropBox({
          x: editingBlock.transform.crop.x,
          y: editingBlock.transform.crop.y,
          width: editingBlock.transform.crop.width,
          height: editingBlock.transform.crop.height,
        });
      }
      const existingUrl = `/api/v1/forms/${formId}/assets/${editingBlock.assetId}`;
      setPreviewUrl(existingUrl);
      setStage("adjust");
    } else {
      setStage("dropzone");
    }
  }, [isOpen, editingBlock, editingCoverImage, formId, mode]);

  // Keep frameDimensions synced with DOM crop frame size
  useEffect(() => {
    const el = cropFrameRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage, aspectPreset]);

  // Restore saved panOffset in screen pixels once frame dimensions are measured
  useEffect(() => {
    if (savedNormPanRef.current && frameDimensions.width > 0 && frameDimensions.height > 0) {
      setPanOffset({
        x: savedNormPanRef.current.x * frameDimensions.width,
        y: savedNormPanRef.current.y * frameDimensions.height,
      });
      savedNormPanRef.current = null;
    }
  }, [frameDimensions]);

  // Preload previewUrl to guarantee imageDimensions are available
  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    if (!previewUrl.startsWith("blob:") && !previewUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = previewUrl;
  }, [previewUrl]);

  const totalRotation = (rotation + fineRotation + 360) % 360;

  // Compute baseScale so rotated image completely covers the crop frame at zoom 1x
  const baseScale = React.useMemo(() => {
    if (!imageDimensions || frameDimensions.width <= 0 || frameDimensions.height <= 0) {
      return 1;
    }
    const rad = (totalRotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotWidth = imageDimensions.width * cos + imageDimensions.height * sin;
    const rotHeight = imageDimensions.width * sin + imageDimensions.height * cos;

    return Math.max(
      frameDimensions.width / rotWidth,
      frameDimensions.height / rotHeight
    );
  }, [imageDimensions, frameDimensions, totalRotation]);

  // Handle file validation
  const validateAndSetFile = useCallback((file: File) => {
    setErrorMessage(null);

    // 1. MIME type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Unsupported format. Please select a JPG, PNG, or WebP image.");
      return;
    }

    // 2. Byte size limit
    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`);
      return;
    }

    // 3. Pixel dimensions check via local Image element
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const pixels = img.naturalWidth * img.naturalHeight;
      if (pixels > MAX_PIXELS) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage(
          `Image dimensions (${img.naturalWidth}x${img.naturalHeight} = ${(pixels / 1_000_000).toFixed(1)}MP) exceed the 25 megapixel limit.`
        );
        return;
      }

      // Success: advance to adjust workspace with completely fresh settings (no settings leakage)
      originalAssetIdRef.current = null;
      savedNormPanRef.current = null;
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      setFineRotation(0);
      setAspectPreset(mode === "cover" ? "4:1" : "free");
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setStage("adjust");
      setCropBox({ x: 0, y: 0, width: 100, height: 100 });
      setPanOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFineRotation(0);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("Could not decode image file. The file may be corrupted.");
    };

    img.src = objectUrl;
  }, []);

  // Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  // Rotation controls
  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setFineRotation(0);
    setAspectPreset(mode === "cover" ? "4:1" : "free");
    setCropBox(mode === "cover" ? { x: 0, y: 38, width: 100, height: 25 } : { x: 0, y: 0, width: 100, height: 100 });
    setPanOffset({ x: 0, y: 0 });
  };

  // Aspect ratio presets
  const handleApplyAspect = (preset: AspectPreset) => {
    setAspectPreset(preset);
    if (preset === "free") {
      setCropBox({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    let targetRatio = 1;
    if (preset === "4:1") targetRatio = 4;
    if (preset === "16:9") targetRatio = 16 / 9;
    if (preset === "4:3") targetRatio = 4 / 3;
    if (preset === "1:1") targetRatio = 1;
    if (preset === "3:2") targetRatio = 3 / 2;

    // Center crop based on ratio
    if (targetRatio >= 1) {
      const height = Math.round(100 / targetRatio);
      const y = Math.round((100 - height) / 2);
      setCropBox({ x: 0, y, width: 100, height });
    } else {
      const width = Math.round(100 * targetRatio);
      const x = Math.round((100 - width) / 2);
      setCropBox({ x, y: 0, width, height: 100 });
    }
  };

  // Pointer panning handlers for canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPan: { ...panOffset },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.initialPan.x + dx,
      y: dragStartRef.current.initialPan.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Confirm Insert Image action
  const handleConfirmInsert = async () => {
    if (isUploading) return;

    // Handle Cover Image mode
    if (mode === "cover") {
      setIsUploading(true);
      setUploadStatusText("Processing and saving adjustments...");

      try {
        let masterAssetId = originalAssetIdRef.current;

        // 1. If user uploaded a new file, save the raw original to Neon S3 first
        if (selectedFile) {
          setUploadStatusText("Uploading original image...");
          const origFormData = new FormData();
          origFormData.append("file", selectedFile);
          const origRes = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
            method: "POST",
            body: origFormData,
          });
          const origData = await origRes.json();
          if (!origRes.ok) {
            throw new Error(origData.error || "Failed to upload original image.");
          }
          masterAssetId = origData.asset.id;
          originalAssetIdRef.current = masterAssetId;
        }

        if (!masterAssetId && !previewUrl) {
          throw new Error("No image file selected.");
        }

        // 2. Render visible crop frame to Canvas at 1600px width with anti-aliasing
        setUploadStatusText("Generating high-resolution crop...");
        const sourceUrl = previewUrl || `/api/v1/forms/${formId}/assets/${masterAssetId}`;

        const croppedBlob = await createCroppedBlob({
          imageSrc: sourceUrl,
          previewImg: previewImageRef.current,
          frameWidth: frameDimensions.width,
          frameHeight: frameDimensions.height,
          naturalWidth: imageDimensions?.width || 1200,
          naturalHeight: imageDimensions?.height || 800,
          zoom,
          panOffset,
          rotation,
          fineRotation,
          aspectPreset,
        });

        // 3. Upload the cropped image to form assets
        setUploadStatusText("Saving cropped cover banner...");
        const croppedFile = new File([croppedBlob], `cover_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const cropFormData = new FormData();
        cropFormData.append("file", croppedFile);

        const cropRes = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
          method: "POST",
          body: cropFormData,
        });
        const cropData = await cropRes.json();
        if (!cropRes.ok) {
          throw new Error(cropData.error || "Failed to save cropped cover image.");
        }

        // 4. Construct BuilderCoverImage metadata with normalized pan for responsive re-editing
        const totalRot = (rotation + fineRotation + 360) % 360;
        const normX = frameDimensions.width > 0 ? panOffset.x / frameDimensions.width : 0;
        const normY = frameDimensions.height > 0 ? panOffset.y / frameDimensions.height : 0;

        const cover: BuilderCoverImage = {
          assetId: cropData.asset.id,
          originalAssetId: masterAssetId || undefined,
          altText: altText.trim(),
          transform: {
            rotation: totalRot,
            fineAngle: fineRotation,
            zoom,
            panX: normX,
            panY: normY,
            aspectPreset,
            crop: {
              x: cropBox.x,
              y: cropBox.y,
              width: cropBox.width,
              height: cropBox.height,
              aspectRatio: aspectPreset === "4:1" ? 4 : aspectPreset === "16:9" ? 16 / 9 : undefined,
            },
          },
        };

        onSaveCoverImage?.(cover);
        onClose();
      } catch (err: any) {
        console.error("Cover image adjustment error:", err);
        setErrorMessage(err?.message || "Failed to save adjustments. Please try again.");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // If editing existing block without replacing file, update block directly
    if (editingBlock && !selectedFile) {
      const totalRotation = (rotation + fineRotation + 360) % 360;
      const updated: BuilderImageBlock = {
        ...editingBlock,
        altText: altText.trim(),
        displaySize,
        alignment,
        transform: {
          rotation: totalRotation,
          crop: {
            x: cropBox.x,
            y: cropBox.y,
            width: cropBox.width,
            height: cropBox.height,
            aspectRatio: aspectPreset === "4:1" ? 4 : aspectPreset === "16:9" ? 16 / 9 : aspectPreset === "4:3" ? 4 / 3 : aspectPreset === "1:1" ? 1 : undefined,
          },
        },
      };
      onSaveExistingBlock?.(updated);
      onClose();
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select an image file.");
      return;
    }

    setIsUploading(true);
    setUploadStatusText("Uploading asset to secure storage...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setUploadStatusText("Asset confirmed. Inserting into form...");

      const totalRotation = (rotation + fineRotation + 360) % 360;
      const newBlock: BuilderImageBlock = {
        id: editingBlock ? editingBlock.id : `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: "image",
        assetId: data.asset.id,
        altText: altText.trim(),
        displaySize,
        alignment,
        transform: {
          rotation: totalRotation,
          crop: {
            x: cropBox.x,
            y: cropBox.y,
            width: cropBox.width,
            height: cropBox.height,
            aspectRatio: aspectPreset === "16:9" ? 16 / 9 : aspectPreset === "4:3" ? 4 / 3 : aspectPreset === "1:1" ? 1 : undefined,
          },
        },
        naturalWidth: data.asset.width || imageDimensions?.width,
        naturalHeight: data.asset.height || imageDimensions?.height,
        fileName: selectedFile.name,
      };

      if (editingBlock) {
        onSaveExistingBlock?.(newBlock);
      } else {
        onInsertImage?.(newBlock);
      }

      onClose();
    } catch (err: any) {
      console.error("Insertion error:", err);
      setErrorMessage(err.message || "Failed to upload image. Please try again.");
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            {stage === "adjust" && (
              <button
                type="button"
                onClick={() => setStage("dropzone")}
                disabled={isUploading}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
                title="Choose different file"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 id="image-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {mode === "cover"
                  ? stage === "dropzone" ? "Add Cover Image" : "Adjust Cover Image"
                  : stage === "dropzone" ? "Add Image Block" : "Adjust & Insert Image"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === "cover"
                  ? "Recommended size: 1200 × 300 px (Banner)"
                  : stage === "dropzone"
                  ? "Upload a JPG, PNG, or WebP image"
                  : "Crop, zoom, rotate, and configure placement"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel and close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {/* Global hidden file input (available for both Dropzone and Replace Image button) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                validateAndSetFile(files[0]);
                e.target.value = ""; // Reset so same file can be chosen again
              }
            }}
          />

          {/* STAGE 1: Dropzone File Picker */}
          {stage === "dropzone" && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center justify-center gap-4 transition-all cursor-pointer select-none",
                  isDraggingOver
                    ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 scale-[0.99]"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/20"
                )}
              >

                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    Drag and drop an image here, or{" "}
                    <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, and WebP up to 10MB (max 25 MP)
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="rounded-xl text-xs font-bold gap-2 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 mt-2"
                >
                  Choose from Computer
                </Button>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: Interactive Adjustment Workspace */}
          {stage === "adjust" && (
            <div className="space-y-6">
              {/* Workspace Top Action Bar: Rotate, Aspect, Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10">
                {/* Left: Rotation actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Rotate left 90°"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Rotate right 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Rotate 90°</span>
                  </button>
                </div>

                {/* Center: Aspect ratio presets */}
                <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200/60 dark:border-white/5">
                  {(mode === "cover"
                    ? (["4:1", "16:9", "free"] as AspectPreset[])
                    : (["free", "16:9", "4:3", "1:1", "3:2"] as AspectPreset[])
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyAspect(preset)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        aspectPreset === preset
                          ? "bg-violet-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {preset === "free" ? "Free" : preset === "4:1" ? "4:1 (Banner)" : preset}
                    </button>
                  ))}
                </div>

                {/* Right: Reset adjustments */}
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Reset to original crop & orientation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

              {/* Main Visual Canvas Area */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full h-72 sm:h-96 rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center p-3 sm:p-5 border border-slate-800 select-none cursor-grab active:cursor-grabbing touch-none"
              >
                {/* Crop Frame matching aspect preset */}
                <div
                  ref={cropFrameRef}
                  className="relative rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl flex items-center justify-center bg-slate-900 select-none"
                  style={{
                    aspectRatio: aspectPreset === "16:9" ? "16 / 9" : "4 / 1",
                    width: "100%",
                    maxWidth: aspectPreset === "16:9" ? "560px" : "100%",
                    maxHeight: "100%",
                  }}
                >
                  {/* Interactive transformed image */}
                  {previewUrl && (
                    <img
                      ref={previewImageRef}
                      src={previewUrl}
                      alt="Adjustment preview"
                      draggable={false}
                      className="absolute select-none pointer-events-none max-w-none transition-none"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: imageDimensions
                          ? `${imageDimensions.width * baseScale}px`
                          : "100%",
                        height: imageDimensions
                          ? `${imageDimensions.height * baseScale}px`
                          : "auto",
                        transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) rotate(${totalRotation}deg) scale(${zoom})`,
                        transformOrigin: "center center",
                      }}
                    />
                  )}

                  {/* 3x3 Grid Lines Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-20 border border-white/30 rounded-2xl grid grid-cols-3 grid-rows-3 opacity-30">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div />
                  </div>

                  {/* Hint banner */}
                  <div className="absolute bottom-3 left-4 z-30 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] text-slate-200 font-medium border border-white/10 pointer-events-none shadow-sm">
                    Drag to reposition image inside crop frame
                  </div>
                </div>
              </div>

              {/* Sliders: Zoom & Fine Rotation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/10">
                {/* Zoom control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                      Zoom
                    </span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    aria-label="Image zoom slider"
                  />
                </div>

                {/* Fine rotation control (-45 to +45) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                      Angle
                    </span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      {fineRotation > 0 ? `+${fineRotation}°` : `${fineRotation}°`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={fineRotation}
                    onChange={(e) => setFineRotation(parseInt(e.target.value, 10))}
                    className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    aria-label="Image rotation slider"
                  />
                </div>
              </div>

              {/* Form Layout Settings: Display Size, Alignment, Alt Text */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/10">
                {mode !== "cover" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Size */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Display Width
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
                        {(["small", "medium", "large", "full"] as ImageDisplaySize[]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setDisplaySize(sz)}
                            className={cn(
                              "py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer",
                              displaySize === sz
                                ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
                        {[
                          { val: "left", label: "Left", icon: AlignLeft },
                          { val: "center", label: "Center", icon: AlignCenter },
                          { val: "right", label: "Right", icon: AlignRight },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => setAlignment(item.val as ImageAlignment)}
                              className={cn(
                                "py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                                alignment === item.val
                                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alt text field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alt Text <span className="text-slate-400 font-normal">(optional description for screen readers)</span>
                  </label>
                  <Input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe image for accessibility (or leave blank if decorative)"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {stage === "adjust" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="rounded-xl text-xs font-semibold"
              >
                Replace Image
              </Button>
            )}

            {stage === "adjust" && (
              <Button
                type="button"
                onClick={handleConfirmInsert}
                disabled={isUploading}
                className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 gap-2 cursor-pointer transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadStatusText || "Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {mode === "cover"
                        ? editingCoverImage
                          ? "Save Adjustments"
                          : "Set Cover Image"
                        : editingBlock
                        ? "Save Adjustments"
                        : "Insert Image"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
