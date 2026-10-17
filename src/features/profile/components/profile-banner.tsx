"use client";

import React, { useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { ProfileDTO } from "../schemas/profile-schema";
import { ProfileCoverModal } from "./profile-cover-modal";
import { ProfileAvatarModal } from "./profile-avatar-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { notifyAvatarUpdated } from "../utils/avatar-sync";

interface ProfileBannerProps {
  profile: ProfileDTO;
  onProfileUpdated?: (updated: ProfileDTO) => void;
}

export function ProfileBanner({ profile, onProfileUpdated }: ProfileBannerProps) {
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const initial = (
    profile.displayName ||
    profile.username ||
    "U"
  )[0]?.toUpperCase() || "U";

  const subtitleParts: string[] = [];
  if (profile.department) subtitleParts.push(profile.department);
  if (profile.institution) subtitleParts.push(profile.institution);
  if (profile.studyYear && subtitleParts.length === 0) subtitleParts.push(profile.studyYear);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]">
      {/* Visual Cover Area */}
      <div className="relative h-44 sm:h-52 w-full bg-neutral-100 dark:bg-[#181B20] overflow-hidden">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt={`${profile.displayName || profile.username}'s profile cover`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
            <ImageIcon className="w-12 h-12 stroke-1" />
          </div>
        )}

        {/* Change Cover Button (Upper Right) */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <button
            type="button"
            onClick={() => setIsCoverModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#121417]/95 border border-[#E5E7EB] dark:border-[#27272A] text-xs font-mono text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            title="Change cover image"
          >
            <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
            <span>Change Cover</span>
          </button>
        </div>
      </div>

      {/* Profile Details & Avatar Overlap Row */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-20">
          {/* Avatar Container with Overlapping Camera Button */}
          <div className="relative group shrink-0">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.displayName || profile.username}
              size="xl"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl ring-2 ring-white dark:ring-[#121417] font-mono font-bold"
              alt={`${profile.displayName || profile.username}'s profile picture`}
            />
            
            {/* Camera Action Button */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white dark:bg-[#121417] text-neutral-600 dark:text-neutral-300 border border-[#E5E7EB] dark:border-[#27272A] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] transition-colors cursor-pointer"
              aria-label="Upload profile photo"
              title="Upload profile photo"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* User Text Information */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {profile.displayName || profile.username}
              </h1>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                @{profile.username}
              </span>
            </div>

            {/* Optional Academic / Role Tagline */}
            {subtitleParts.length > 0 && (
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                {subtitleParts.join(" | ")}
              </p>
            )}

            {/* Optional Bio preview */}
            {profile.bio && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Cover Image Adjust & Upload Modal */}
      <ProfileCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        currentCoverUrl={profile.coverUrl}
        onCoverSaved={(newCoverUrl) => {
          onProfileUpdated?.({
            ...profile,
            coverUrl: newCoverUrl,
          });
        }}
      />

      {/* Profile Avatar Image Adjust & Upload Modal */}
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
