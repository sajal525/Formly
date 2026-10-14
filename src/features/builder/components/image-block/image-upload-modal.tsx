"use client";

import React from "react";
import {
  UniversalImageEditorModal,
  ImageDestination,
} from "@/components/image-editor/universal-image-editor-modal";
import {
  BuilderImageBlock,
  BuilderCoverImage,
} from "../../schemas/builder-definition-schema";

export interface ImageUploadModalProps {
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

/**
 * ImageUploadModal adapts the shared UniversalImageEditorModal for standalone Form Content Images
 * and Cover images.
 */
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
  const destination: ImageDestination =
    mode === "cover" ? "form-cover" : "form-image";

  const handleSaveImageBlock = (block: BuilderImageBlock) => {
    if (editingBlock) {
      onSaveExistingBlock?.(block);
    } else {
      onInsertImage?.(block);
    }
  };

  return (
    <UniversalImageEditorModal
      isOpen={isOpen}
      onClose={onClose}
      destination={destination}
      formId={formId}
      editingCoverImage={editingCoverImage}
      editingImageBlock={editingBlock}
      onSaveCoverImage={onSaveCoverImage}
      onSaveImageBlock={handleSaveImageBlock}
    />
  );
}
