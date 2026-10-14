"use client";

import React from "react";
import { UniversalImageEditorModal } from "@/components/image-editor/universal-image-editor-modal";

export interface ProfileCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl?: string | null;
  onCoverSaved: (newCoverUrl: string) => void;
  onCoverRemoved?: () => void;
}

/**
 * ProfileCoverModal adapts the shared UniversalImageEditorModal for User Profile Cover banners.
 * Uses 4:1 banner preset by default with 16:9 and Free crop options.
 */
export function ProfileCoverModal({
  isOpen,
  onClose,
  currentCoverUrl,
  onCoverSaved,
}: ProfileCoverModalProps) {
  return (
    <UniversalImageEditorModal
      isOpen={isOpen}
      onClose={onClose}
      destination="profile-cover"
      existingAssetUrl={currentCoverUrl}
      onSaveProfileCoverUrl={onCoverSaved}
    />
  );
}
