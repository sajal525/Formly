"use client";

import React from "react";
import { UniversalImageEditorModal } from "@/components/image-editor/universal-image-editor-modal";

export interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onAvatarSaved: (newAvatarUrl: string) => void;
}

/**
 * ProfileAvatarModal adapts the shared UniversalImageEditorModal for User Profile Avatars.
 * Uses 1:1 square crop with a circular preview mask.
 */
export function ProfileAvatarModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onAvatarSaved,
}: ProfileAvatarModalProps) {
  return (
    <UniversalImageEditorModal
      isOpen={isOpen}
      onClose={onClose}
      destination="avatar"
      existingAssetUrl={currentAvatarUrl}
      onSaveAvatarUrl={onAvatarSaved}
    />
  );
}
