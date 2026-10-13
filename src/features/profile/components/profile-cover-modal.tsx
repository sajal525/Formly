"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  UploadCloud,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl?: string | null;
  onCoverSaved: (newCoverUrl: string) => void;
  onCoverRemoved?: () => void;
}

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
}): Promise<Blob> {
  const drawOnCanvas = (img: HTMLImageElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const nW = img.naturalWidth || naturalWidth || 1600;
        const nH = img.naturalHeight || naturalHeight || 400;

        const totalRotation = (rotation + fineRotation + 360) % 360;
        const rad = (totalRotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const rotWidth = nW * cos + nH * sin;
        const rotHeight = nW * sin + nH * cos;

        const fW = frameWidth > 0 ? frameWidth : 640;
        const fH = frameHeight > 0 ? frameHeight : 160;

        const baseScale = Math.max(fW / rotWidth, fH / rotHeight);

        // Standard 1600x400 canvas (4:1 banner proportion)
        const targetWidth = 1600;
        const targetHeight = Math.round(targetWidth / (fW / fH));

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

export function ProfileCoverModal({
  isOpen,
  onClose,
  currentCoverUrl,
  onCoverSaved,
  onCoverRemoved,
}: ProfileCoverModalProps) {
  // Modal Stages: "dropzone" (file picker) or "adjust" (adjustment workspace)
  const [stage, setStage] = useState<"dropzone" | "adjust">("dropzone");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Adjustment Controls: Zoom, Rotation, Pan
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
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
      setPanOffset({ x: 0, y: 0 });
      setIsUploading(false);
    } else {
      if (currentCoverUrl) {
        setPreviewUrl(currentCoverUrl);
        setStage("adjust");
      } else {
        setStage("dropzone");
      }
    }
  }, [isOpen, currentCoverUrl]);

  // Recalculate frame bounds when entering adjust stage or window resizes
  useEffect(() => {
    if (stage === "adjust") {
      const timer = setTimeout(updateFrameDimensions, 50);
      window.addEventListener("resize", updateFrameDimensions);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateFrameDimensions);
      };
    }
  }, [stage, updateFrameDimensions]);

  // Handle incoming selected file
  const processIncomingFile = (file: File) => {
    setErrorMessage(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage("File exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setStage("adjust");
      setZoom(1);
      setRotation(0);
      setFineRotation(0);
      setPanOffset({ x: 0, y: 0 });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("Failed to read image. The file may be corrupt or unreadable.");
    };
    img.src = objectUrl;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processIncomingFile(file);
    }
    // Clear input value so selecting the exact same file again triggers change
    e.target.value = "";
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processIncomingFile(file);
    }
  };

  // Rotation controls
  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset Adjustments control
  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setFineRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, Math.round((prev + 0.2) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(1, Math.round((prev - 0.2) * 100) / 100));
  };

  // Interactive Pan / Positioning (Pointer Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (stage !== "adjust") return;
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPan: { ...panOffset },
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
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

  // Save Adjustments
  const handleSaveAdjustments = async () => {
    if (isUploading) return;
    if (!previewUrl && !selectedFile) {
      setErrorMessage("No image selected to save.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadStatusText("Processing and cropping cover image...");

    try {
      // 1. Render adjusted preview to Canvas Blob
      const croppedBlob = await createCroppedBlob({
        imageSrc: previewUrl || "",
        previewImg: previewImageRef.current,
        frameWidth: frameDimensions.width,
        frameHeight: frameDimensions.height,
        naturalWidth: imageDimensions?.width || 1600,
        naturalHeight: imageDimensions?.height || 400,
        zoom,
        panOffset,
        rotation,
        fineRotation,
      });

      // 2. Upload cropped blob to profile cover endpoint
      setUploadStatusText("Saving new cover to profile...");
      const formData = new FormData();
      formData.append("file", croppedBlob, `cover_${Date.now()}.jpg`);

      const res = await fetch("/api/v1/profile/cover", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile cover.");
      }

      // 3. Notify parent component to update profile state immediately
      onCoverSaved(data.coverUrl);
      onClose();
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setErrorMessage(err.message || "Failed to save cover image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  if (!isOpen) return null;

  // Compute transform preview geometry
  const totalRotation = (rotation + fineRotation + 360) % 360;
  const rad = (totalRotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const rotW = (imageDimensions?.width || 1600) * cos + (imageDimensions?.height || 400) * sin;
  const rotH = (imageDimensions?.width || 1600) * sin + (imageDimensions?.height || 400) * cos;
  const baseScale = Math.max(
    frameDimensions.width / (rotW || 1600),
    frameDimensions.height / (rotH || 400)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-cover-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#329CF5]/20 to-[#563BFA]/20 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="profile-cover-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                {stage === "dropzone" ? "Choose Profile Cover" : "Adjust Profile Cover"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stage === "dropzone"
                  ? "Upload a banner image (JPG, PNG, WebP up to 10MB)"
                  : "Drag to reposition, zoom, rotate, and crop your cover"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* STAGE 1: Dropzone */}
          {stage === "dropzone" && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                  isDraggingOver
                    ? "border-[#563BFA] bg-indigo-50/60 dark:bg-indigo-950/30 scale-[0.99]"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:border-[#563BFA]/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#329CF5]/15 to-[#563BFA]/15 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    Drag and drop your cover image here, or{" "}
                    <span className="text-[#563BFA] dark:text-indigo-400 underline underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recommended resolution: 1600 × 400 px or larger (max 10MB)
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
                  className="rounded-xl text-xs font-bold gap-2 text-[#563BFA] dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 mt-1 cursor-pointer"
                >
                  Choose File from Computer
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
            <div className="space-y-5">
              {/* Workspace Action Bar: Rotation and Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10">
                {/* Left: 90° Rotation controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Rotate left 90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rotate Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Rotate right 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rotate Right</span>
                  </button>
                </div>

                {/* Right: Reset control */}
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Reset zoom, rotation, and positioning"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Main Visual Crop Frame Canvas Area */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full h-56 sm:h-72 rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center p-3 sm:p-4 border border-slate-800 select-none cursor-grab active:cursor-grabbing touch-none"
              >
                {/* Crop Frame matching 4:1 banner proportions */}
                <div
                  ref={cropFrameRef}
                  className="relative rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl flex items-center justify-center bg-slate-900 select-none w-full"
                  style={{
                    aspectRatio: "4 / 1",
                    maxHeight: "100%",
                  }}
                >
                  {/* Interactive Transformed Image */}
                  {previewUrl && (
                    <img
                      ref={previewImageRef}
                      src={previewUrl}
                      alt="Cover preview"
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

                  {/* 3x3 Grid Overlay */}
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

                  {/* Positioning Hint Tag */}
                  <div className="absolute bottom-2.5 left-3 z-30 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] sm:text-xs text-slate-200 font-medium border border-white/10 pointer-events-none flex items-center gap-1.5 shadow-sm">
                    <Move className="w-3 h-3 text-[#329CF5]" />
                    <span>Drag inside frame to reposition</span>
                  </div>
                </div>
              </div>

              {/* Adjustment Sliders: Zoom & Fine Rotation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/10">
                {/* Zoom control with quick buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                      Zoom
                    </span>
                    <span className="text-[#563BFA] dark:text-indigo-400 font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#563BFA] cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      aria-label="Cover zoom slider"
                    />
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Fine Angle Rotation Control (-45° to +45°) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                      Angle
                    </span>
                    <span className="text-[#563BFA] dark:text-indigo-400 font-bold">
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
                    className="w-full accent-[#563BFA] cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    aria-label="Cover angle slider"
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

        {/* Modal Footer Controls: Replace Image, Reset, Cancel, Save Adjustments */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {stage === "adjust" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-xl text-xs font-semibold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Replace Image
              </Button>
            )}

            {stage === "adjust" && (
              <Button
                type="button"
                onClick={handleSaveAdjustments}
                disabled={isUploading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#329CF5] to-[#563BFA] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 gap-2 cursor-pointer transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadStatusText || "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Adjustments</span>
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
