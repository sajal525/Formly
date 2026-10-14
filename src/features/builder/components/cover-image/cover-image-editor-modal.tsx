"use client";

import React from "react";
import {
  UniversalImageEditorModal,
  AspectPreset,
} from "@/components/image-editor/universal-image-editor-modal";
import { BuilderCoverImage } from "../../schemas/builder-definition-schema";

export type { AspectPreset };

export interface CoverImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  initialFile?: File | null;
  initialPreviewUrl?: string | null;
  editingCoverImage?: BuilderCoverImage | null;
  onSaveCoverImage: (cover: BuilderCoverImage) => Promise<void> | void;
}

/**
 * CoverImageEditorModal adapts the shared UniversalImageEditorModal for Form Cover images.
 */
export function CoverImageEditorModal({
  isOpen,
  onClose,
  formId,
  initialFile,
  initialPreviewUrl,
  editingCoverImage,
  onSaveCoverImage,
}: CoverImageEditorModalProps) {
  return (
    <UniversalImageEditorModal
      isOpen={isOpen}
      onClose={onClose}
      destination="form-cover"
      formId={formId}
      initialFile={initialFile}
      initialPreviewUrl={initialPreviewUrl}
      editingCoverImage={editingCoverImage}
      onSaveCoverImage={onSaveCoverImage}
    />
  );
}
