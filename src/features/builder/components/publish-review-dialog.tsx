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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121417] rounded-xl p-6 shadow-xl border border-[#E5E7EB] dark:border-[#27272A] space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-zinc-100 dark:bg-[#181B20] flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="publish-dialog-title"
                className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                {publishedUrl ? "Form Published" : "Publish Form"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {publishedUrl
                  ? "Your form is now live and accepting responses."
                  : "Review form settings before making it public."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {publishedUrl ? (
          /* Success Screen with Copy Link */
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200">
                <span className="font-semibold block">Successfully published</span>
                Respondents can now access and complete this form.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Shareable Public URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="flex-1 h-9 px-3 rounded-lg bg-zinc-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs text-zinc-900 dark:text-white font-mono select-all focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-9 px-3.5 rounded-lg bg-[#563BFA] hover:bg-[#4830D9] text-white text-xs font-mono font-medium gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs font-medium rounded-lg h-8 px-3 border-[#E5E7EB] dark:border-[#27272A]"
              >
                Done
              </Button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B20] dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors"
              >
                <span>Open public form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Pre-publish Review Screen */
          <div className="space-y-4">
            {/* Summary card */}
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#181B20]/60 border border-[#E5E7EB] dark:border-[#27272A] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Title:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {definition.title || "Untitled form"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Questions:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">
                  {definition.questions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Theme:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {findThemePreset(definition.themeKey).name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Public destination:</span>
                <span className="font-mono text-[#563BFA] dark:text-violet-400">
                  /f/{formId}
                </span>
              </div>
            </div>

            {/* Validation errors if any */}
            {!canPublish && (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Please resolve the following before publishing:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {validationIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="button"
                disabled={!canPublish || isPublishing}
                onClick={handlePublish}
                className="h-8 px-4 rounded-lg bg-[#563BFA] hover:bg-[#4830D9] text-white text-xs font-medium gap-1.5 transition-colors disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
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
