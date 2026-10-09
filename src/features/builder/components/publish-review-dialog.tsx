"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { BuilderFormDefinition } from "../schemas/builder-definition-schema";
import { findThemePreset } from "@/features/forms/themes/catalog";
import { Button } from "@/components/ui/button";

interface PublishReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  definition: BuilderFormDefinition;
  onPublishSuccess?: () => void;
}

export function PublishReviewDialog({
  isOpen,
  onClose,
  formId,
  definition,
  onPublishSuccess,
}: PublishReviewDialogProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Client-side pre-validation
  const validationIssues: string[] = [];
  if (!definition.title || definition.title.trim().length === 0) {
    validationIssues.push("Form title cannot be empty.");
  }
  if (!definition.questions || definition.questions.length === 0) {
    validationIssues.push("At least one question is required to publish.");
  }
  const emptyQuestions = (definition.questions || []).filter(
    (q) => !q.label || q.label.trim().length === 0
  );
  if (emptyQuestions.length > 0) {
    validationIssues.push(
      `${emptyQuestions.length} question(s) have empty titles.`
    );
  }

  const canPublish = validationIssues.length === 0;

  const handlePublish = async () => {
    if (!canPublish) return;
    setIsPublishing(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/forms/${formId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish form");
      }

      const publicLink = `${window.location.origin}/f/${formId}`;
      setPublishedUrl(publicLink);
      if (onPublishSuccess) {
        onPublishSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="publish-dialog-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {publishedUrl ? "Form Published!" : "Publish Form"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {publishedUrl
                  ? "Your form is now live and accepting responses."
                  : "Review form settings before making it public."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {publishedUrl ? (
          /* Success Screen with Copy Link */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200">
                <span className="font-bold block">Successfully published</span>
                Respondents can now access and complete this form.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Shareable Public URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono select-all focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-11 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-2 shrink-0 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy link"}</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs font-semibold rounded-xl"
              >
                Done
              </Button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <span>Open public form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Pre-publish Review Screen */
          <div className="space-y-5">
            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {definition.title || "Untitled form"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Questions:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {definition.questions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Theme:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {findThemePreset(definition.themeKey).name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public destination:</span>
                <span className="font-mono text-violet-600 dark:text-violet-400">
                  /f/{formId}
                </span>
              </div>
            </div>

            {/* Validation errors if any */}
            {!canPublish && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Please resolve the following before publishing:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {validationIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="button"
                disabled={!canPublish || isPublishing}
                onClick={handlePublish}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold gap-2 shadow-md shadow-violet-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
