"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  ChangePasswordInput,
  changePasswordSchema,
} from "../schemas/profile-schema";

export function ChangePasswordCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordInput) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        throw new Error(
          res.error.message ||
            "Unable to change password. Please verify your current password."
        );
      }

      setSuccessMessage("Password changed successfully. Other sessions have been revoked.");
      reset();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("Change password error:", err);
      const msg = err.message || "";
      if (msg.includes("INVALID_PASSWORD") || msg.toLowerCase().includes("current password")) {
        setErrorMessage("Current password is incorrect. Please check and try again.");
      } else {
        setErrorMessage(
          msg || "Failed to change password. Please make sure your current password is correct."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Change Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your password to keep your account secure.
          </p>
        </div>

        <button
          id="change-password-submit-btn"
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <KeyRound className="w-3.5 h-3.5 text-[#563BFA] dark:text-indigo-400" />
          )}
          <span>Change Password</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label htmlFor="password-current" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password-current"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter current password"
                {...register("currentPassword")}
                className="w-full h-10 pl-10 pr-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[10px] text-rose-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label htmlFor="password-new" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password-new"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
                {...register("newPassword")}
                className="w-full h-10 pl-10 pr-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[10px] text-rose-500">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label htmlFor="password-confirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                className="w-full h-10 pl-10 pr-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA]/20 focus:border-[#563BFA]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-rose-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          Password must be at least 12 characters long. Passphrases are welcome.
        </p>
      </form>
    </div>
  );
}
