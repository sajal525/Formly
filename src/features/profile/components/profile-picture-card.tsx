"use client";

import React, { useState } from "react";
import { UploadCloud, Trash2, Loader2, AlertCircle } from "lucide-react";
import { ProfileDTO } from "../schemas/profile-schema";
import { ProfileAvatarModal } from "./profile-avatar-modal";

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm transition-colors duration-200">
      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
        Profile Picture
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        Upload a new profile picture. Recommended size: 512 × 512 px.
      </p>

      <div className="mt-5 flex items-center gap-5">
        {/* Avatar Display */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gradient-to-tr from-[#329CF5] to-[#563BFA] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-sm ring-2 ring-slate-100 dark:ring-white/10 relative">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.displayName || profile.username}'s profile picture`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Photo</span>
          </button>

          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={!profile.avatarUrl || isRemoving}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          onProfileUpdated?.({
            ...profile,
            avatarUrl: newAvatarUrl,
          });
        }}
      />
    </div>
  );
}
