"use client";

import React, { useState } from "react";
import { UploadCloud, Trash2, Info } from "lucide-react";
import { ProfileDTO } from "../schemas/profile-schema";

interface ProfilePictureCardProps {
  profile: ProfileDTO;
}

export function ProfilePictureCard({ profile }: ProfilePictureCardProps) {
  const [showR2Info, setShowR2Info] = useState(false);

  const initial = (
    profile.displayName ||
    profile.username ||
    "U"
  )[0]?.toUpperCase() || "U";

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
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-gradient-to-tr from-[#329CF5] to-[#563BFA] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-sm ring-2 ring-slate-100 dark:ring-white/10">
          {initial}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => setShowR2Info(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Image uploads are disabled until Cloudflare R2 is configured"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowR2Info(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400">Remove Photo</span>
          </button>
        </div>
      </div>

      {showR2Info && (
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start justify-between gap-2.5 animate-in fade-in duration-200">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#563BFA] dark:text-indigo-400" />
          <div className="flex-1 text-[11px] leading-relaxed">
            <strong>Storage not configured:</strong> Cloudflare R2 credentials (R2_BUCKET, R2_ACCESS_KEY_ID) are not set in this environment. Your default initials avatar is securely generated and displayed.
          </div>
          <button
            type="button"
            onClick={() => setShowR2Info(false)}
            className="text-[11px] font-bold text-[#563BFA] dark:text-indigo-400 hover:underline shrink-0"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
