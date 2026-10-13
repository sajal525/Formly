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
  Camera,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onAvatarSaved: (newAvatarUrl: string) => void;
}

async function createCroppedAvatarBlob({
  imageSrc,
  previewImg,
  frameSize,
  naturalWidth,
  naturalHeight,
  zoom,
  panOffset,
  rotation,
  fineRotation,
}: {
  imageSrc: string;
  previewImg?: HTMLImageElement | null;
  frameSize: number;
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
        const nW = img.naturalWidth || naturalWidth || 512;
        const nH = img.naturalHeight || naturalHeight || 512;

        const totalRotation = (rotation + fineRotation + 360) % 360;
        const rad = (totalRotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const rotWidth = nW * cos + nH * sin;
        const rotHeight = nW * sin + nH * cos;

        const fSize = frameSize > 0 ? frameSize : 280;
        const baseScale = Math.max(fSize / rotWidth, fSize / rotHeight);

        // Standard 512x512 high-res avatar output
        const targetSize = 512;
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to create canvas context"));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const k = targetSize / fSize;

        ctx.save();
        ctx.translate(targetSize / 2 + panOffset.x * k, targetSize / 2 + panOffset.y * k);
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
              reject(new Error("Failed to export image blob"));
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
    img.crossOrigin = "anonymous";
    img.onload = () => {
      drawOnCanvas(img).then(resolve).catch(reject);
    };
    img.onerror = () => reject(new Error("Failed to load image for crop processing"));
    img.src = imageSrc;
  });
}

export function ProfileAvatarModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onAvatarSaved,
}: ProfileAvatarModalProps) {
  const [stage, setStage] = useState<"select" | "adjust">("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Adjustment states
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [fineRotation, setFineRotation] = useState<number>(0); // -45 to +45

  // Drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Status and feedback
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  // Reset modal state when opened or closed
  useEffect(() => {
    if (isOpen) {
      setStage("select");
      setSelectedFile(null);
      setImageSrc(null);
      setImageDimensions(null);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      setFineRotation(0);
      setErrorMessage(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const handleFileSelection = useCallback((file: File) => {
    setErrorMessage(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Please select a valid raster image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage(
        `Selected file exceeds the maximum 10 MiB limit (${(file.size / (1024 * 1024)).toFixed(1)} MiB).`
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setImageSrc(objectUrl);

    // Measure dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      setFineRotation(0);
      setStage("adjust");
    };
    img.onerror = () => {
      setErrorMessage("Could not parse image. Please select another image.");
      URL.revokeObjectURL(objectUrl);
      setSelectedFile(null);
      setImageSrc(null);
    };
    img.src = objectUrl;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(3, parseFloat((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(1, parseFloat((prev - 0.15).toFixed(2))));

  // Rotation controls
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);

  // Reset controls
  const handleResetAdjustments = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
    setFineRotation(0);
    setErrorMessage(null);
  };

  // Mouse pan handlers inside crop viewport
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      panStartRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Save adjustments: export cropped canvas and upload to server
  const handleSaveAdjustments = async () => {
    if (!imageSrc) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const frameEl = cropFrameRef.current;
      const frameSize = frameEl ? frameEl.clientWidth : 280;

      const blob = await createCroppedAvatarBlob({
        imageSrc,
        previewImg: previewImgRef.current,
        frameSize,
        naturalWidth: imageDimensions?.width || 512,
        naturalHeight: imageDimensions?.height || 512,
        zoom,
        panOffset,
        rotation,
        fineRotation,
      });

      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");

      const response = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload profile picture.");
      }

      onAvatarSaved(data.avatarUrl);
      onClose();
    } catch (err: any) {
      console.error("Avatar save error:", err);
      setErrorMessage(err.message || "Failed to save profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const totalRotation = (rotation + fineRotation + 360) % 360;
  const rad = (totalRotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  let rotWidth = imageDimensions?.width || 500;
  let rotHeight = imageDimensions?.height || 500;
  if (imageDimensions) {
    rotWidth = imageDimensions.width * cos + imageDimensions.height * sin;
    rotHeight = imageDimensions.width * sin + imageDimensions.height * cos;
  }

  const fSize = 280;
  const baseScale = Math.max(fSize / rotWidth, fSize / rotHeight);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="avatar-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                {stage === "select" ? "Upload Profile Picture" : "Adjust Profile Picture"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stage === "select"
                  ? "Choose a photo to represent your profile across Formly"
                  : "Crop, zoom, rotate, and reposition your photo"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleInputChange}
          />

          {stage === "select" ? (
            /* Select State / Drag & Drop Zone */
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all cursor-pointer select-none",
                  isDragOver
                    ? "border-[#563BFA] bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-slate-950/30"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to select a photo, or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  JPEG, PNG, or WebP up to 10 MiB. Recommended resolution: 512 × 512 px.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 rounded-xl text-xs font-semibold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer pointer-events-none"
                >
                  Choose File
                </Button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
            /* Adjust State (Crop, Zoom, Rotate, Pan) */
            <div className="space-y-5">
              {/* Top adjustment actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Interactive Preview
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Rotate 90° Counter-Clockwise"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Reset Adjustments"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewport Frame with Circular Guide */}
              <div className="flex justify-center py-2">
                <div
                  ref={cropFrameRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={cn(
                    "relative w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] rounded-full overflow-hidden bg-slate-950 border-4 border-[#563BFA] shadow-xl select-none",
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  )}
                  style={{ touchAction: "none" }}
                >
                  {imageSrc && (
                    <img
                      ref={previewImgRef}
                      src={imageSrc}
                      alt="Avatar preview crop"
                      draggable={false}
                      className="absolute pointer-events-none transition-transform duration-75 max-w-none origin-center"
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
                  <div className="absolute inset-0 pointer-events-none z-20 border border-white/20 rounded-full grid grid-cols-3 grid-rows-3 opacity-25">
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

                  {/* Drag reposition hint */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] text-slate-200 font-medium border border-white/10 pointer-events-none flex items-center gap-1 shadow-sm whitespace-nowrap">
                    <Move className="w-3 h-3 text-[#329CF5]" />
                    <span>Drag to reposition</span>
                  </div>
                </div>
              </div>

              {/* Adjustment Sliders: Zoom & Angle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/10">
                {/* Zoom control */}
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
                      aria-label="Avatar zoom slider"
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

                {/* Fine Angle Slider */}
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
                    aria-label="Avatar angle slider"
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

        {/* Modal Footer Controls */}
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
                    <span>Saving Photo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Photo</span>
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
