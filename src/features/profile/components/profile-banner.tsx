"use client";

import React, { useState } from "react";
import { Camera, Image as ImageIcon, Info } from "lucide-react";
import { ProfileDTO } from "../schemas/profile-schema";

interface ProfileBannerProps {
  profile: ProfileDTO;
}

export function ProfileBanner({ profile }: ProfileBannerProps) {
  const [showR2Notice, setShowR2Notice] = useState(false);

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
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
      {/* Visual Cover Area */}
      <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-blue-400/30 via-indigo-400/25 to-purple-400/35 dark:from-blue-900/40 dark:via-indigo-950/50 dark:to-purple-900/40 overflow-hidden">
        {/* Subtle decorative curved gradient mesh */}
        <div className="absolute inset-0 opacity-60 dark:opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300/40 via-purple-300/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl pointer-events-none" />
        
        {/* Change Cover Button (Upper Right) */}
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={() => setShowR2Notice(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Cloudflare R2 storage is not configured in this environment"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Change Cover</span>
          </button>
        </div>
      </div>

      {/* Profile Details & Avatar Overlap Row */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-20">
          {/* Avatar Container with Overlapping Camera Button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#329CF5] to-[#563BFA] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl ring-4 ring-white dark:ring-slate-900 shadow-md">
              {initial}
            </div>
            
            {/* Camera Action Button */}
            <button
              type="button"
              onClick={() => setShowR2Notice(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              aria-label="Upload profile photo"
              title="Upload profile photo (R2 storage required)"
            >
              <Camera className="w-4 h-4 text-[#563BFA] dark:text-indigo-400" />
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

        {/* Informative notification when user clicks cover or avatar */}
        {showR2Notice && (
          <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-[#563BFA] dark:text-indigo-400" />
              <span>
                <strong>Image uploads are not ready yet:</strong> Secure Cloudflare R2 object storage credentials are not configured in this environment. Your default initials avatar is active.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowR2Notice(false)}
              className="text-xs font-bold text-[#563BFA] dark:text-indigo-400 hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
