"use client";

import React, { useState } from "react";
import { ProfileDTO, AccountStatsDTO } from "../schemas/profile-schema";
import { ProfileBanner } from "./profile-banner";
import { BasicInformationCard } from "./basic-information-card";
import { ProfilePictureCard } from "./profile-picture-card";
import { AccountStatsCard } from "./account-stats-card";
import { ChangePasswordCard } from "./change-password-card";
import { DangerZoneCard } from "./danger-zone-card";

interface ProfileWorkspaceClientProps {
  initialProfile: ProfileDTO;
  stats: AccountStatsDTO;
}

export function ProfileWorkspaceClient({
  initialProfile,
  stats,
}: ProfileWorkspaceClientProps) {
  const [profile, setProfile] = useState<ProfileDTO>(initialProfile);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account information, profile details and preferences.
        </p>
      </div>

      {/* Top Profile Banner */}
      <ProfileBanner profile={profile} />

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (60-65% on desktop: xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-6 sm:space-y-8">
          <BasicInformationCard
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
          <ChangePasswordCard />
        </div>

        {/* Right Rail (35-40% on desktop: xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-6 sm:space-y-8">
          <ProfilePictureCard profile={profile} />
          <AccountStatsCard stats={stats} />
          <DangerZoneCard />
        </div>
      </div>
    </div>
  );
}
