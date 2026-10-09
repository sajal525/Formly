"use client";

import React from "react";
import { ResponseDetailsDTO } from "../server/get-responses-workspace";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Star,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponseDetailsPanelProps {
  selectedResponse: ResponseDetailsDTO | null;
  onClose: () => void;
  onNavigate: (responseId: string) => void;
  className?: string;
}

export function ResponseDetailsPanel({
  selectedResponse,
  onClose,
  onNavigate,
  className,
}: ResponseDetailsPanelProps) {
  if (!selectedResponse) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[360px]",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Response Selected
        </h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Click &ldquo;View&rdquo; or click a row in the responses table to review complete submission details and answers.
        </p>
      </div>
    );
  }

  const formatTimestamp = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return null;
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Find a name or email answer to use as respondent title
  const nameAnswer = selectedResponse.answers.find(
    (a) => a.type === "SHORT_TEXT" && /name/i.test(a.label)
  );
  const emailAnswer = selectedResponse.answers.find(
    (a) => a.type === "EMAIL" || /email/i.test(a.label)
  );

  const respondentTitle = nameAnswer?.formattedValue && nameAnswer.formattedValue !== "-"
    ? nameAnswer.formattedValue
    : `Response #${selectedResponse.rowNumber}`;

  const respondentSubtitle = emailAnswer?.formattedValue && emailAnswer.formattedValue !== "-"
    ? emailAnswer.formattedValue
    : null;

  const initialLetter = respondentTitle.charAt(0).toUpperCase() || "R";

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {initialLetter}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {respondentTitle}
            </h3>
            {respondentSubtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {respondentSubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 mr-2 hidden sm:inline-block">
            {formatTimestamp(selectedResponse.submittedAt)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Submission #{selectedResponse.rowNumber}
          </span>
          {selectedResponse.durationSeconds !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuration(selectedResponse.durationSeconds)}
            </span>
          )}
        </div>
        <span className="sm:hidden text-[10px]">
          {formatTimestamp(selectedResponse.submittedAt)}
        </span>
      </div>

      {/* Answers Scroll Area */}
      <div className="p-4 overflow-y-auto max-h-[460px] space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60">
        {selectedResponse.answers.map((ans, idx) => (
          <div key={ans.questionId || idx} className={cn("space-y-1", idx > 0 ? "pt-3" : "")}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {ans.label}
            </span>

            {ans.type === "RATING" && ans.value ? (
              <div className="flex items-center gap-1 text-amber-400 pt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= Number(ans.value) ? "fill-amber-400" : "text-slate-200 dark:text-slate-700"
                    )}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                  {ans.value} / 5
                </span>
              </div>
            ) : ans.type === "CHECKBOX" && Array.isArray(ans.value) ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {ans.value.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-violet-500" />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-pre-wrap leading-relaxed">
                {ans.formattedValue}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedResponse.prevResponseId}
          onClick={() => selectedResponse.prevResponseId && onNavigate(selectedResponse.prevResponseId)}
          className="gap-1 text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </Button>

        <span className="text-[11px] text-slate-400 font-medium">
          Response #{selectedResponse.rowNumber}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!selectedResponse.nextResponseId}
          onClick={() => selectedResponse.nextResponseId && onNavigate(selectedResponse.nextResponseId)}
          className="gap-1 text-xs"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
