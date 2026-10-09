"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Hash,
  BookOpen,
  Users,
  FileText,
  Lock,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  ProfileDTO,
  UpdateProfileInput,
  updateProfileSchema,
} from "../schemas/profile-schema";

interface BasicInformationCardProps {
  profile: ProfileDTO;
  onProfileUpdated: (updated: ProfileDTO) => void;
}

export function BasicInformationCard({
  profile,
  onProfileUpdated,
}: BasicInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile.displayName || "",
      contactEmail: profile.contactEmail || "",
      phone: profile.phone || "",
      institution: profile.institution || "",
      department: profile.department || "",
      rollNumber: profile.rollNumber || "",
      studyYear: profile.studyYear || "",
      division: profile.division || "",
      bio: profile.bio || "",
    },
  });

  const bioValue = watch("bio") || "";

  function handleCancel() {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) return;
    }
    reset({
      displayName: profile.displayName || "",
      contactEmail: profile.contactEmail || "",
      phone: profile.phone || "",
      institution: profile.institution || "",
      department: profile.department || "",
      rollNumber: profile.rollNumber || "",
      studyYear: profile.studyYear || "",
      division: profile.division || "",
      bio: profile.bio || "",
    });
    setErrorMessage(null);
    setIsEditing(false);
  }

  async function onSubmit(data: UpdateProfileInput) {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessBanner(false);

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile");
      }

      onProfileUpdated(json.profile);
      setIsEditing(false);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 5000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-sm transition-colors duration-200">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Basic Information
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            This information will be used across your Formly account.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              id="edit-profile-btn"
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#563BFA] dark:text-indigo-400" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="cancel-profile-btn"
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                id="save-profile-btn"
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Save changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profile saved successfully.</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Information Body */}
      {!isEditing ? (
        /* READ MODE */
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
          {/* 1. Username (Read-Only) */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Username
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">@{profile.username}</span>
              <span className="ml-auto text-[10px] text-slate-400 font-normal">
                Sign-in ID
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Your login username cannot be changed here.
            </p>
          </div>

          {/* 2. Contact Email */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Email Address
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.contactEmail || (
                  <span className="text-slate-400 font-normal italic">
                    Not added
                  </span>
                )}
              </span>
              {profile.contactEmail && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800/50">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Not used for sign-in or account recovery.
            </p>
          </div>

          {/* 3. Full Name */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Full Name
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.displayName || (
                  <span className="text-slate-400 font-normal italic">
                    Not added (defaults to @{profile.username})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 4. Phone Number */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Phone Number
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.phone || (
                  <span className="text-slate-400 font-normal italic">
                    Not added
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 5. College / Institute */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              College / Institute
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.institution || (
                  <span className="text-slate-400 font-normal italic">
                    Not added
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 6. Department */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Department
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.department || (
                  <span className="text-slate-400 font-normal italic">
                    Not added
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 7. Roll Number */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Roll Number
            </span>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
              <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {profile.rollNumber || (
                  <span className="text-slate-400 font-normal italic">
                    Not added
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 8. Year & 9. Division */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Year
              </span>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {profile.studyYear || (
                    <span className="text-slate-400 font-normal italic">
                      None
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Division
              </span>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {profile.division || (
                    <span className="text-slate-400 font-normal italic">
                      None
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 10. Bio (Full Width) */}
          <div className="sm:col-span-2 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Bio (Optional)
            </span>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 font-normal leading-relaxed min-h-[72px]">
              {profile.bio ? (
                <p className="whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <span className="text-slate-400 italic">Not added</span>
              )}
            </div>
            {profile.bio && (
              <div className="text-right text-[10px] text-slate-400">
                {profile.bio.length} / 300
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5">
            {/* Username (Locked) */}
            <div className="space-y-1">
              <label htmlFor="profile-username" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-username"
                  type="text"
                  disabled
                  value={profile.username}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Sign-in username cannot be changed.
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="profile-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-email"
                  type="email"
                  placeholder="e.g. contact@domain.com"
                  {...register("contactEmail")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.contactEmail && (
                <p className="text-[10px] text-rose-500">
                  {errors.contactEmail.message}
                </p>
              )}
              <p className="text-[10px] text-slate-400">
                Optional contact email. Not used for sign-in or recovery.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="profile-displayname" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-displayname"
                  type="text"
                  placeholder="e.g. Sajal Jaiswal"
                  {...register("displayName")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.displayName && (
                <p className="text-[10px] text-rose-500">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label htmlFor="profile-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  {...register("phone")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] text-rose-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* College / Institute */}
            <div className="space-y-1">
              <label htmlFor="profile-institution" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                College / Institute
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-institution"
                  type="text"
                  placeholder="e.g. Zeal College of Engineering and Research"
                  {...register("institution")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.institution && (
                <p className="text-[10px] text-rose-500">
                  {errors.institution.message}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label htmlFor="profile-department" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-department"
                  type="text"
                  placeholder="e.g. Artificial Intelligence and Machine Learning (AIML)"
                  {...register("department")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.department && (
                <p className="text-[10px] text-rose-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Roll Number */}
            <div className="space-y-1">
              <label htmlFor="profile-rollnumber" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Roll Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-rollnumber"
                  type="text"
                  placeholder="e.g. A2301"
                  {...register("rollNumber")}
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                />
              </div>
              {errors.rollNumber && (
                <p className="text-[10px] text-rose-500">
                  {errors.rollNumber.message}
                </p>
              )}
            </div>

            {/* Year & Division */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="profile-year" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Year
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-year"
                    type="text"
                    placeholder="e.g. Third Year"
                    {...register("studyYear")}
                    className="w-full h-10 pl-9 pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                  />
                </div>
                {errors.studyYear && (
                  <p className="text-[10px] text-rose-500">
                    {errors.studyYear.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="profile-division" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Division
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-division"
                    type="text"
                    placeholder="e.g. A"
                    {...register("division")}
                    className="w-full h-10 pl-9 pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
                  />
                </div>
                {errors.division && (
                  <p className="text-[10px] text-rose-500">
                    {errors.division.message}
                  </p>
                )}
              </div>
            </div>

            {/* Bio (Full Width) */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="profile-bio" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bio (Optional)
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    (bioValue?.length || 0) > 300
                      ? "text-rose-500 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {bioValue?.length || 0} / 300
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="profile-bio"
                  rows={3}
                  maxLength={300}
                  placeholder="Tell others a little about yourself and what you create..."
                  {...register("bio")}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA] resize-none leading-relaxed"
                />
              </div>
              {errors.bio && (
                <p className="text-[10px] text-rose-500">{errors.bio.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save changes</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
