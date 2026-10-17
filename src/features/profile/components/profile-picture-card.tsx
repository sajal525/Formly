"use client";

import React, { useState } from "react";
import { UploadCloud, Trash2, Loader2, AlertCircle } from "lucide-react";
import { ProfileDTO } from "../schemas/profile-schema";
import { ProfileAvatarModal } from "./profile-avatar-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { notifyAvatarUpdated } from "../utils/avatar-sync";

interface ProfilePictureCardProps {
  profile: ProfileDTO;
  onProfileUpdated?: (updated: ProfileDTO) => void;
}

export function ProfilePictureCard({ profile, onProfileUpdated }: ProfilePictureCardProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const initial = (
    profile.displayName ||
    profile.username ||
    "U"
  )[0]?.toUpperCase() || "U";

  const handleRemovePhoto = async () => {
    if (!profile.avatarUrl || isRemoving) return;

    setIsRemoving(true);
    setRemoveError(null);

    try {
      const res = await fetch("/api/v1/profile/avatar", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove profile photo.");
      }

      notifyAvatarUpdated(null);

      onProfileUpdated?.({
        ...profile,
        avatarUrl: null,
      });
    } catch (err: any) {
      console.error("Remove photo error:", err);
      setRemoveError(err.message || "Failed to remove photo. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] p-5">
      <h2 className="text-xs font-semibold text-neutral-900 dark:text-white">
        Profile Picture
      </h2>
      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
        Upload a new profile picture. Recommended: 512 × 512 px.
      </p>

      <div className="mt-4 flex items-center gap-4">
        {/* Avatar Display */}
        <UserAvatar
          src={profile.avatarUrl}
          name={profile.displayName || profile.username}
          size="lg"
          className="w-16 h-16 shrink-0 rounded-xl ring-2 ring-white dark:ring-[#121417] font-mono font-bold"
          alt={`${profile.displayName || profile.username}'s profile picture`}
        />

        {/* Action Buttons */}
        <div className="flex-1 space-y-1.5 font-mono">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={!profile.avatarUrl || isRemoving}
            className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-600 dark:text-neutral-400 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={profile.avatarUrl ? "Remove custom photo" : "No custom photo to remove"}
          >
            {isRemoving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className="text-rose-600 dark:text-rose-400">
              {isRemoving ? "Removing..." : "Remove Photo"}
            </span>
          </button>
        </div>
      </div>

      {removeError && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{removeError}</span>
        </div>
      )}

      {/* Avatar Modal */}
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={profile.avatarUrl}
        onAvatarSaved={(newAvatarUrl) => {
          notifyAvatarUpdated(newAvatarUrl);
          onProfileUpdated?.({
            ...profile,
            avatarUrl: newAvatarUrl,
          });
        }}
      />
    </div>
  );
}
