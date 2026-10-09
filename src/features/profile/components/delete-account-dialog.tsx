"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Lock,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  Database,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmation.trim() === "DELETE" && password.length > 0;

  async function handleDelete() {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmation: "DELETE",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete account");
      }

      // Deletion succeeded; clear auth client session and redirect
      try {
        await authClient.signOut();
      } catch {
        // Ignore sign-out error if session already deleted
      }
      window.location.href = "/login";
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      setErrorMessage(
        err.message || "Failed to delete account. Please verify your password."
      );
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="delete-dialog-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                Delete Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning details */}
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-rose-700 dark:text-rose-400">
            Permanently deleting your Formly account will immediately erase:
          </p>

          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <UserCheck className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>Your login credentials, profile details, and active sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                All your created forms (Draft, Published, Closed, Archived, and forms in Trash).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                All submitted responses, respondent answers, sessions, and analytics.
              </span>
            </li>
          </ul>

          <p className="text-[11px] text-slate-400 italic pt-1">
            Shared global templates in the Formly catalogue remain intact.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirmation inputs */}
        <div className="space-y-3.5 pt-1">
          {/* Current Password */}
          <div className="space-y-1">
            <label htmlFor="delete-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="delete-password"
                type="password"
                placeholder="Enter your current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDeleting}
                className="w-full h-10 pl-10 pr-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Type DELETE */}
          <div className="space-y-1">
            <label htmlFor="delete-confirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Type <span className="font-mono text-rose-600 dark:text-rose-400">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirmation"
              type="text"
              placeholder="DELETE"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={isDeleting}
              className="w-full h-10 px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-account-btn"
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Permanently Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
