"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Minus,
  Plus,
  RefreshCw,
  Upload,
  Check,
  Loader2,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { getCroppedImg, PixelCrop } from "@/features/builder/utils/crop-image";
import {
  BuilderCoverImage,
  BuilderImageBlock,
  ImageAlignment,
  ImageDisplaySize,
  ImageTransform,
} from "@/features/builder/schemas/builder-definition-schema";
import { cn } from "@/lib/utils";

export type ImageDestination =
  | "form-cover"
  | "form-image"
  | "avatar"
  | "profile-cover";

export type AspectPreset = "free" | "4:1" | "16:9" | "4:3" | "1:1";

export interface UniversalCropSavePayload {
  croppedBlob: Blob;
  croppedFile: File;
  rawFile: File | null;
  rawAssetId?: string | null;
  altText: string;
  displaySize?: ImageDisplaySize;
  alignment?: ImageAlignment;
  transform: ImageTransform;
  croppedAssetId?: string;
  originalAssetId?: string;
}

export interface UniversalImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: ImageDestination;

  // Context identifier for form assets
  formId?: string;

  // Initial source inputs
  initialFile?: File | null;
  initialPreviewUrl?: string | null;
  existingAssetId?: string | null;
  existingAssetUrl?: string | null;

  // Existing editing objects for full round-trip preservation
  editingCoverImage?: BuilderCoverImage | null;
  editingImageBlock?: BuilderImageBlock | null;

  // Content block metadata
  initialAltText?: string;
  initialDisplaySize?: ImageDisplaySize;
  initialAlignment?: ImageAlignment;

  // Custom label overrides
  title?: string;
  subtitle?: string;
  confirmLabel?: string;

  // Callbacks
  onSave?: (payload: UniversalCropSavePayload) => Promise<void> | void;
  onSaveCoverImage?: (cover: BuilderCoverImage) => Promise<void> | void;
  onSaveImageBlock?: (block: BuilderImageBlock) => Promise<void> | void;
  onSaveAvatarUrl?: (url: string) => Promise<void> | void;
  onSaveProfileCoverUrl?: (url: string) => Promise<void> | void;
}

const DESTINATION_PRESETS: Record<ImageDestination, AspectPreset[]> = {
  "form-cover": ["4:1", "16:9", "free"],
  "profile-cover": ["4:1", "16:9", "free"],
  avatar: ["1:1"],
  "form-image": ["free", "1:1", "4:3", "16:9"],
};

const DESTINATION_TITLES: Record<ImageDestination, { title: string; subtitle: string; confirm: string }> = {
  "form-cover": {
    title: "Position cover image",
    subtitle: "Drag to reposition and resize your cover image",
    confirm: "Set cover image",
  },
  "profile-cover": {
    title: "Position profile cover",
    subtitle: "Drag to reposition and resize your cover banner",
    confirm: "Set cover image",
  },
  avatar: {
    title: "Position profile photo",
    subtitle: "Drag to reposition and crop your profile photo",
    confirm: "Save profile photo",
  },
  "form-image": {
    title: "Position image",
    subtitle: "Drag to reposition and resize your image",
    confirm: "Save image",
  },
};

export function UniversalImageEditorModal({
  isOpen,
  onClose,
  destination,
  formId,
  initialFile,
  initialPreviewUrl,
  existingAssetId,
  existingAssetUrl,
  editingCoverImage,
  editingImageBlock,
  initialAltText = "",
  initialDisplaySize = "medium",
  initialAlignment = "center",
  title: titleOverride,
  subtitle: subtitleOverride,
  confirmLabel: confirmOverride,
  onSave,
  onSaveCoverImage,
  onSaveImageBlock,
  onSaveAvatarUrl,
  onSaveProfileCoverUrl,
}: UniversalImageEditorModalProps) {
  // Working source
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalAssetId, setOriginalAssetId] = useState<string | null>(null);

  // Transformations
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Content attributes
  const [altText, setAltText] = useState<string>("");
  const [displaySize, setDisplaySize] = useState<ImageDisplaySize>("medium");
  const [alignment, setAlignment] = useState<ImageAlignment>("center");

  // Destination presets
  const allowedPresets = DESTINATION_PRESETS[destination] || ["free"];
  const defaultPreset = allowedPresets[0] || "free";
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>(defaultPreset);

  // Pixel metrics
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<Area | null>(null);

  // Crop box dimensions for resize handles
  const [cropSize, setCropSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 150,
  });

  // Saving & error states
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const revokeCurrentObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Compute container-appropriate crop size based on aspect preset
  const updateCropSizeForPreset = useCallback(
    (preset: AspectPreset, containerWidth?: number) => {
      const cWidth = containerWidth || containerRef.current?.clientWidth || 700;
      const padding = 48;
      const availableWidth = Math.max(260, Math.min(680, cWidth - padding));
      const availableHeight = 360;

      if (preset === "4:1") {
        const w = availableWidth;
        const h = Math.round(w / 4);
        setCropSize({ width: w, height: h });
      } else if (preset === "16:9") {
        const w = Math.min(availableWidth, 560);
        const h = Math.round(w / (16 / 9));
        setCropSize({ width: w, height: h });
      } else if (preset === "4:3") {
        const w = Math.min(availableWidth, 480);
        const h = Math.round(w / (4 / 3));
        setCropSize({ width: w, height: h });
      } else if (preset === "1:1") {
        const size = Math.min(availableHeight, Math.min(availableWidth, 320));
        setCropSize({ width: size, height: size });
      } else {
        // Free crop preset defaults to an adaptable rectangular box
        const w = Math.min(availableWidth, 540);
        const h = Math.round(w / 1.7);
        setCropSize({ width: w, height: h });
      }
    },
    []
  );

  // Initialize or reset modal state whenever it opens or initial props change
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setStatusMessage("");

    // Case 1: Fresh file passed
    if (initialFile) {
      revokeCurrentObjectUrl();
      const objUrl = URL.createObjectURL(initialFile);
      objectUrlRef.current = objUrl;

      setActiveFile(initialFile);
      setImageSrc(objUrl);
      setOriginalAssetId(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectPreset(defaultPreset);
      setAltText(initialAltText || "");
      setDisplaySize(initialDisplaySize);
      setAlignment(initialAlignment);
      updateCropSizeForPreset(defaultPreset);
      return;
    }

    // Case 2: Fresh preview URL passed
    if (initialPreviewUrl) {
      setActiveFile(null);
      setImageSrc(initialPreviewUrl);
      setOriginalAssetId(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectPreset(defaultPreset);
      setAltText(initialAltText || "");
      setDisplaySize(initialDisplaySize);
      setAlignment(initialAlignment);
      updateCropSizeForPreset(defaultPreset);
      return;
    }

    // Case 3: Re-editing existing Cover Image
    if (editingCoverImage) {
      const sourceAssetId = editingCoverImage.originalAssetId || editingCoverImage.assetId;
      setOriginalAssetId(editingCoverImage.originalAssetId || null);
      setActiveFile(null);
      setImageSrc(
        formId ? `/api/v1/forms/${formId}/assets/${sourceAssetId}` : null
      );
      setAltText(editingCoverImage.altText || "");

      const t = editingCoverImage.transform;
      const preset = (t?.aspectPreset as AspectPreset) || defaultPreset;
      setAspectPreset(preset);
      setZoom(t?.zoom || 1);
      setRotation(t?.rotation || 0);
      setFlipH(Boolean(t?.flipHorizontal));
      setFlipV(Boolean(t?.flipVertical));
      setCrop({
        x: t?.panX || 0,
        y: t?.panY || 0,
      });

      updateCropSizeForPreset(preset);
      return;
    }

    // Case 4: Re-editing existing Image Block
    if (editingImageBlock) {
      setOriginalAssetId(null);
      setActiveFile(null);
      setImageSrc(
        formId ? `/api/v1/forms/${formId}/assets/${editingImageBlock.assetId}` : null
      );
      setAltText(editingImageBlock.altText || "");
      setDisplaySize(editingImageBlock.displaySize || "medium");
      setAlignment(editingImageBlock.alignment || "center");

      const t = editingImageBlock.transform;
      const preset = (t?.aspectPreset as AspectPreset) || defaultPreset;
      setAspectPreset(preset);
      setZoom(t?.zoom || 1);
      setRotation(t?.rotation || 0);
      setFlipH(Boolean(t?.flipHorizontal));
      setFlipV(Boolean(t?.flipVertical));
      setCrop({
        x: t?.panX || 0,
        y: t?.panY || 0,
      });

      updateCropSizeForPreset(preset);
      return;
    }

    // Case 5: Existing asset URL or ID passed (e.g. avatar or profile cover)
    if (existingAssetUrl) {
      setActiveFile(null);
      setImageSrc(existingAssetUrl);
      setOriginalAssetId(existingAssetId || null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectPreset(defaultPreset);
      setAltText(initialAltText || "");
      updateCropSizeForPreset(defaultPreset);
      return;
    }

    // Case 6: Fallback blank
    setImageSrc(null);
    setActiveFile(null);
    setOriginalAssetId(null);
  }, [
    isOpen,
    initialFile,
    initialPreviewUrl,
    existingAssetId,
    existingAssetUrl,
    editingCoverImage,
    editingImageBlock,
    initialAltText,
    initialDisplaySize,
    initialAlignment,
    defaultPreset,
    formId,
    revokeCurrentObjectUrl,
    updateCropSizeForPreset,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      revokeCurrentObjectUrl();
    };
  }, [revokeCurrentObjectUrl]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) {
        handleCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving]);

  // Handle Preset Change
  const handlePresetChange = (preset: AspectPreset) => {
    setAspectPreset(preset);
    updateCropSizeForPreset(preset);
  };

  // 90° Rotate Buttons
  const handleRotate90 = (direction: "left" | "right") => {
    const delta = direction === "left" ? -90 : 90;
    setRotation((prev) => {
      let next = prev + delta;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return next;
    });
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCrop({ x: 0, y: 0 });
    setAspectPreset(defaultPreset);
    updateCropSizeForPreset(defaultPreset);
  };

  // Handle Replace File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Image exceeds the maximum file size limit of 15MB.");
      return;
    }

    setErrorMessage(null);
    revokeCurrentObjectUrl();
    const objUrl = URL.createObjectURL(file);
    objectUrlRef.current = objUrl;

    setActiveFile(file);
    setImageSrc(objUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    updateCropSizeForPreset(aspectPreset);

    e.target.value = "";
  };

  // Drag and drop onto modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMessage("Please drop a valid image file (JPG, PNG, or WebP).");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("Image exceeds the maximum file size limit of 15MB.");
        return;
      }

      setErrorMessage(null);
      revokeCurrentObjectUrl();
      const objUrl = URL.createObjectURL(file);
      objectUrlRef.current = objUrl;

      setActiveFile(file);
      setImageSrc(objUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      updateCropSizeForPreset(aspectPreset);
    }
  };

  // Crop complete callback from react-easy-crop
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPercentages(croppedArea);
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Interactive resize handle dragging for crop area
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    corner: "nw" | "ne" | "se" | "sw" | "n" | "s" | "e" | "w"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...cropSize };
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      const containerWidth = containerRef.current?.clientWidth || 700;
      const maxWidth = Math.max(300, containerWidth - 32);
      const minWidth = 140;
      const minHeight = 60;

      if (aspectPreset === "4:1") {
        let delta = 0;
        if (corner === "se" || corner === "e") delta = dx * 2;
        else if (corner === "sw" || corner === "w") delta = -dx * 2;
        else if (corner === "ne") delta = dx * 2;
        else if (corner === "nw") delta = -dx * 2;
        else if (corner === "s") delta = dy * 4 * 2;
        else if (corner === "n") delta = -dy * 4 * 2;

        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + delta));
        newHeight = Math.round(newWidth / 4);
      } else if (aspectPreset === "16:9") {
        let delta = 0;
        if (corner === "se" || corner === "e") delta = dx * 2;
        else if (corner === "sw" || corner === "w") delta = -dx * 2;
        else if (corner === "ne") delta = dx * 2;
        else if (corner === "nw") delta = -dx * 2;
        else if (corner === "s") delta = dy * (16 / 9) * 2;
        else if (corner === "n") delta = -dy * (16 / 9) * 2;

        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + delta));
        newHeight = Math.round(newWidth / (16 / 9));
      } else if (aspectPreset === "4:3") {
        let delta = 0;
        if (corner === "se" || corner === "e") delta = dx * 2;
        else if (corner === "sw" || corner === "w") delta = -dx * 2;
        else if (corner === "ne") delta = dx * 2;
        else if (corner === "nw") delta = -dx * 2;
        else if (corner === "s") delta = dy * (4 / 3) * 2;
        else if (corner === "n") delta = -dy * (4 / 3) * 2;

        newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + delta));
        newHeight = Math.round(newWidth / (4 / 3));
      } else if (aspectPreset === "1:1") {
        let delta = 0;
        if (corner === "se" || corner === "e") delta = dx * 2;
        else if (corner === "sw" || corner === "w") delta = -dx * 2;
        else if (corner === "ne") delta = dx * 2;
        else if (corner === "nw") delta = -dx * 2;
        else if (corner === "s") delta = dy * 2;
        else if (corner === "n") delta = -dy * 2;

        const side = Math.min(maxWidth, Math.max(minWidth, startSize.width + delta));
        newWidth = side;
        newHeight = side;
      } else {
        // Free crop: resize dimensions independently
        if (corner === "se") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + dx * 2));
          newHeight = Math.max(minHeight, startSize.height + dy * 2);
        } else if (corner === "sw") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width - dx * 2));
          newHeight = Math.max(minHeight, startSize.height + dy * 2);
        } else if (corner === "ne") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + dx * 2));
          newHeight = Math.max(minHeight, startSize.height - dy * 2);
        } else if (corner === "nw") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width - dx * 2));
          newHeight = Math.max(minHeight, startSize.height - dy * 2);
        } else if (corner === "e") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width + dx * 2));
        } else if (corner === "w") {
          newWidth = Math.min(maxWidth, Math.max(minWidth, startSize.width - dx * 2));
        } else if (corner === "s") {
          newHeight = Math.max(minHeight, startSize.height + dy * 2);
        } else if (corner === "n") {
          newHeight = Math.max(minHeight, startSize.height - dy * 2);
        }
      }

      setCropSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    const onPointerUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Close & Cancel
  const handleCancel = () => {
    revokeCurrentObjectUrl();
    setErrorMessage(null);
    onClose();
  };

  // Confirm Save Action
  const handleSave = async () => {
    if (isSaving || !imageSrc || !croppedAreaPixels) return;

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage("Saving image adjustments...");

    try {
      // 1. Generate high-resolution cropped blob via Canvas
      setStatusMessage("Generating cropped image...");
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: flipH, vertical: flipV },
        "image/jpeg",
        0.95
      );

      const fileName = activeFile?.name
        ? `cropped_${activeFile.name.replace(/\.[^/.]+$/, "")}.jpg`
        : `image_${Date.now()}.jpg`;

      const croppedFile = new File([croppedBlob], fileName, {
        type: "image/jpeg",
      });

      const transformData: ImageTransform = {
        rotation,
        fineAngle: 0,
        zoom,
        panX: crop.x,
        panY: crop.y,
        aspectPreset,
        crop: {
          x: croppedAreaPercentages?.x ?? 0,
          y: croppedAreaPercentages?.y ?? 0,
          width: croppedAreaPercentages?.width ?? 100,
          height: croppedAreaPercentages?.height ?? 100,
          aspectRatio:
            aspectPreset === "16:9"
              ? 16 / 9
              : aspectPreset === "4:1"
              ? 4
              : aspectPreset === "4:3"
              ? 4 / 3
              : aspectPreset === "1:1"
              ? 1
              : cropSize.width / (cropSize.height || 1),
        },
        flipHorizontal: flipH,
        flipVertical: flipV,
      };

      // -------------------------------------------------------------
      // SUB-WORKFLOW A: Form Cover Image
      // -------------------------------------------------------------
      if (destination === "form-cover" && formId && onSaveCoverImage) {
        let masterAssetId = originalAssetId;

        // If user uploaded a brand new file, save raw original master first
        if (activeFile) {
          setStatusMessage("Uploading original image...");
          const origFormData = new FormData();
          origFormData.append("file", activeFile);

          const origRes = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
            method: "POST",
            body: origFormData,
          });

          const origData = await origRes.json();
          if (!origRes.ok || !origData.asset?.id) {
            throw new Error(origData.error || "Failed to upload original cover image.");
          }
          masterAssetId = origData.asset.id;
          setOriginalAssetId(masterAssetId);
        }

        // Upload cropped cover
        setStatusMessage("Uploading cropped cover...");
        const cropFormData = new FormData();
        cropFormData.append("file", croppedFile);

        const cropRes = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
          method: "POST",
          body: cropFormData,
        });

        const cropData = await cropRes.json();
        if (!cropRes.ok || !cropData.asset?.id) {
          throw new Error(cropData.error || "Failed to save cropped cover image.");
        }

        const finalCover: BuilderCoverImage = {
          assetId: cropData.asset.id,
          originalAssetId: masterAssetId || undefined,
          altText: altText.trim(),
          transform: transformData,
        };

        await onSaveCoverImage(finalCover);
        revokeCurrentObjectUrl();
        onClose();
        return;
      }

      // -------------------------------------------------------------
      // SUB-WORKFLOW B: Standalone Form Image Block
      // -------------------------------------------------------------
      if (destination === "form-image" && formId && onSaveImageBlock) {
        setStatusMessage("Uploading image block...");
        const cropFormData = new FormData();
        cropFormData.append("file", croppedFile);

        const cropRes = await fetch(`/api/v1/forms/${formId}/assets/upload`, {
          method: "POST",
          body: cropFormData,
        });

        const cropData = await cropRes.json();
        if (!cropRes.ok || !cropData.asset?.id) {
          throw new Error(cropData.error || "Failed to upload image block.");
        }

        const newBlock: BuilderImageBlock = {
          id: editingImageBlock?.id || `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: "image",
          assetId: cropData.asset.id,
          altText: altText.trim(),
          displaySize,
          alignment,
          transform: transformData,
          fileName: activeFile?.name || editingImageBlock?.fileName || fileName,
        };

        await onSaveImageBlock(newBlock);
        revokeCurrentObjectUrl();
        onClose();
        return;
      }

      // -------------------------------------------------------------
      // SUB-WORKFLOW C: Profile Avatar
      // -------------------------------------------------------------
      if (destination === "avatar" && onSaveAvatarUrl) {
        setStatusMessage("Saving profile photo...");
        const formData = new FormData();
        formData.append("file", croppedFile, "avatar.jpg");

        const response = await fetch("/api/v1/profile/avatar", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to update profile photo.");
        }

        await onSaveAvatarUrl(data.avatarUrl);
        revokeCurrentObjectUrl();
        onClose();
        return;
      }

      // -------------------------------------------------------------
      // SUB-WORKFLOW D: Profile Cover
      // -------------------------------------------------------------
      if (destination === "profile-cover" && onSaveProfileCoverUrl) {
        setStatusMessage("Saving cover banner...");
        const formData = new FormData();
        formData.append("file", croppedFile, "cover.jpg");

        const response = await fetch("/api/v1/profile/cover", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to update profile cover.");
        }

        await onSaveProfileCoverUrl(data.coverUrl);
        revokeCurrentObjectUrl();
        onClose();
        return;
      }

      // -------------------------------------------------------------
      // SUB-WORKFLOW E: Custom onSave Handler
      // -------------------------------------------------------------
      if (onSave) {
        await onSave({
          croppedBlob,
          croppedFile,
          rawFile: activeFile,
          rawAssetId: originalAssetId,
          altText: altText.trim(),
          displaySize,
          alignment,
          transform: transformData,
        });
        revokeCurrentObjectUrl();
        onClose();
        return;
      }

      throw new Error("No handler configured for image destination.");
    } catch (err: any) {
      console.error("Universal image editor save error:", err);
      setErrorMessage(err.message || "Failed to save adjustments. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const defaultMeta = DESTINATION_TITLES[destination] || DESTINATION_TITLES["form-cover"];
  const displayTitle = titleOverride || defaultMeta.title;
  const displaySubtitle = subtitleOverride || defaultMeta.subtitle;
  const displayConfirm =
    confirmOverride ||
    (destination === "form-image" && !editingImageBlock
      ? "Insert image"
      : defaultMeta.confirm);

  const cropShape = destination === "avatar" ? "round" : "rect";

  const titleId =
    destination === "form-cover"
      ? "cover-editor-title"
      : "universal-image-editor-title";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Hidden file input for Replace Image */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* 1. Header Row */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white"
            >
              {displayTitle}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {displaySubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Top Toolbar: Aspect Presets + Transforms */}
        <div className="px-6 py-2.5 bg-neutral-50/70 dark:bg-neutral-900/40 border-b border-neutral-200/80 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
            {allowedPresets.map((preset) => {
              const label =
                preset === "4:1"
                  ? "4:1 Banner"
                  : preset === "16:9"
                  ? "16:9"
                  : preset === "4:3"
                  ? "4:3"
                  : preset === "1:1"
                  ? destination === "avatar"
                    ? "1:1 Square"
                    : "1:1"
                  : "Free crop";

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetChange(preset)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                    aspectPreset === preset
                      ? "bg-[#563BFA] text-white shadow-xs font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick Transform Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFlipH((v) => !v)}
              title="Flip horizontally"
              aria-label="Flip horizontally"
              className={cn(
                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                flipH
                  ? "bg-[#563BFA]/10 border-[#563BFA] text-[#563BFA]"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setFlipV((v) => !v)}
              title="Flip vertically"
              aria-label="Flip vertically"
              className={cn(
                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                flipV
                  ? "bg-[#563BFA]/10 border-[#563BFA] text-[#563BFA]"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              )}
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

            <button
              type="button"
              onClick={() => handleRotate90("left")}
              title="Rotate left 90°"
              aria-label="Rotate left"
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleRotate90("right")}
              title="Rotate right 90°"
              aria-label="Rotate right"
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

            <button
              type="button"
              onClick={handleResetAdjustments}
              title="Reset transformations"
              aria-label="Reset adjustments"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Main Cropper Workspace Area */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[300px] sm:min-h-[360px] max-h-[50vh] bg-neutral-900 overflow-hidden select-none"
        >
          {imageSrc ? (
            <>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                cropSize={cropSize}
                cropShape={cropShape}
                aspect={aspectPreset === "free" ? undefined : cropSize.width / cropSize.height}
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                transform={
                  flipH || flipV
                    ? `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${
                        zoom * (flipH ? -1 : 1)
                      }, ${zoom * (flipV ? -1 : 1)})`
                    : undefined
                }
                style={{
                  containerStyle: {
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#171717",
                  },
                  cropAreaStyle: {
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
                    borderRadius: cropShape === "round" ? "50%" : undefined,
                  },
                }}
              />

              {/* Crop Resize Handles & Center Hint */}
              <div
                className="absolute pointer-events-none"
                style={{
                  width: `${cropSize.width}px`,
                  height: `${cropSize.height}px`,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Corner Handles */}
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "nw")}
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-nwse-resize shadow-xs hover:scale-125 transition-transform"
                  title="Resize crop area"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "ne")}
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-nesw-resize shadow-xs hover:scale-125 transition-transform"
                  title="Resize crop area"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "se")}
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-nwse-resize shadow-xs hover:scale-125 transition-transform"
                  title="Resize crop area"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "sw")}
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-nesw-resize shadow-xs hover:scale-125 transition-transform"
                  title="Resize crop area"
                />

                {/* Subtle edge handles */}
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "n")}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-ns-resize shadow-xs hover:scale-110"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "s")}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-ns-resize shadow-xs hover:scale-110"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "w")}
                  className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-4 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-ew-resize shadow-xs hover:scale-110"
                />
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, "e")}
                  className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-4 bg-white border border-neutral-900 rounded-xs pointer-events-auto cursor-ew-resize shadow-xs hover:scale-110"
                />

                {/* Center drag hint badge */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-mono tracking-tight text-white/90 select-none pointer-events-none border border-white/10 whitespace-nowrap">
                  Drag to reposition
                </div>
              </div>
            </>
          ) : (
            <div
              onClick={() => replaceInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-400 p-8 text-center cursor-pointer hover:bg-neutral-800/40 transition-colors group"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/90 group-hover:bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white mb-3 shadow-inner transition-colors">
                <Upload className="w-7 h-7 stroke-[1.75]" />
              </div>
              <p className="text-sm font-semibold text-neutral-200">
                Drop your image here, or{" "}
                <span className="text-[#563BFA] dark:text-violet-400 underline decoration-violet-500/40 underline-offset-2">
                  browse files
                </span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Supports JPG, PNG, or WebP up to 15MB
              </p>
            </div>
          )}
        </div>

        {/* 4. Sliders Section (Zoom & Rotation) */}
        <div className="px-6 py-3.5 bg-white dark:bg-[#121212] border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">Zoom</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                  aria-label="Zoom out"
                  className="p-1 rounded text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  aria-label="Zoom percentage"
                  className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#563BFA]"
                />

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                  aria-label="Zoom in"
                  className="p-1 rounded text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">Rotation</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                  {rotation > 0 ? `+${rotation}` : rotation}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => Math.max(-180, r - 1))}
                  aria-label="Rotate minus 1 degree"
                  className="p-1 rounded text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  aria-label="Rotation degree"
                  className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#563BFA]"
                />

                <button
                  type="button"
                  onClick={() => setRotation((r) => Math.min(180, r + 1))}
                  aria-label="Rotate plus 1 degree"
                  className="p-1 rounded text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Optional Content Block Controls (Alt text, Sizing, Alignment) */}
          {(destination === "form-cover" || destination === "form-image") && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Image alt text (for accessibility and SEO)..."
                  aria-label="Image alt text"
                  className="w-full h-8.5 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/40"
                />
              </div>

              {destination === "form-image" && (
                <div className="flex items-center gap-2 shrink-0">
                  {/* Display Size Selector */}
                  <select
                    value={displaySize}
                    onChange={(e) => setDisplaySize(e.target.value as ImageDisplaySize)}
                    aria-label="Display size"
                    className="h-8.5 px-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#563BFA]/40"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full width</option>
                  </select>

                  {/* Alignment Selector */}
                  <div className="flex items-center bg-neutral-50 dark:bg-neutral-900 p-0.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setAlignment("left")}
                      title="Align left"
                      aria-label="Align left"
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        alignment === "left"
                          ? "bg-white dark:bg-neutral-800 text-[#563BFA] shadow-xs"
                          : "text-neutral-500 hover:text-black dark:hover:text-white"
                      )}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlignment("center")}
                      title="Align center"
                      aria-label="Align center"
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        alignment === "center"
                          ? "bg-white dark:bg-neutral-800 text-[#563BFA] shadow-xs"
                          : "text-neutral-500 hover:text-black dark:hover:text-white"
                      )}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlignment("right")}
                      title="Align right"
                      aria-label="Align right"
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        alignment === "right"
                          ? "bg-white dark:bg-neutral-800 text-[#563BFA] shadow-xs"
                          : "text-neutral-500 hover:text-black dark:hover:text-white"
                      )}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Sticky Footer Actions */}
        <div className="px-6 py-4 bg-white dark:bg-[#121212] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          {/* Replace image button */}
          <button
            type="button"
            onClick={() => replaceInputRef.current?.click()}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Replace image</span>
          </button>

          {/* Cancel and Save/Set Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !imageSrc}
              className="px-5 py-2 rounded-xl bg-[#563BFA] hover:bg-[#472ee0] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage || "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{displayConfirm}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
