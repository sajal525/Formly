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
          "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[360px]",
          className
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-400 flex items-center justify-center mb-3">
          <FileText className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          No Response Selected
        </h4>
        <p className="text-xs text-neutral-400 max-w-xs mt-1">
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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-800 dark:text-neutral-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
            {initialLetter}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
              {respondentTitle}
            </h3>
            {respondentSubtitle && (
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {respondentSubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-neutral-400 mr-2 hidden sm:inline-block">
            {formatTimestamp(selectedResponse.submittedAt)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details panel"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1C1F26] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="px-3.5 py-1.5 bg-neutral-50 dark:bg-[#181B20] border-b border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between text-xs font-mono text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Submission #{selectedResponse.rowNumber}
          </span>
          {selectedResponse.durationSeconds !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              {formatDuration(selectedResponse.durationSeconds)}
            </span>
          )}
        </div>
        <span className="sm:hidden text-[10px]">
          {formatTimestamp(selectedResponse.submittedAt)}
        </span>
      </div>

      {/* Answers Scroll Area */}
      <div className="p-3.5 overflow-y-auto max-h-[460px] space-y-3 divide-y divide-[#E5E7EB] dark:divide-[#27272A]">
        {selectedResponse.answers.map((ans, idx) => (
          <div key={ans.questionId || idx} className={cn("space-y-1", idx > 0 ? "pt-2.5" : "")}>
            <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              {ans.label}
            </span>

            {ans.type === "RATING" && ans.value ? (
              <div className="flex items-center gap-1 text-amber-500 pt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5",
                      star <= Number(ans.value) ? "fill-amber-500" : "text-neutral-300 dark:text-neutral-700"
                    )}
                  />
                ))}
                <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 ml-1.5">
                  {ans.value} / 5
                </span>
              </div>
            ) : ans.type === "CHECKBOX" && Array.isArray(ans.value) ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {ans.value.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#1C1F26] text-neutral-700 dark:text-neutral-300 text-xs font-mono"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#563BFA]" />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 break-words whitespace-pre-wrap leading-relaxed">
                {ans.formattedValue}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="p-3 bg-neutral-50 dark:bg-[#181B20] border-t border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedResponse.prevResponseId}
          onClick={() => selectedResponse.prevResponseId && onNavigate(selectedResponse.prevResponseId)}
          className="gap-1 text-xs font-mono h-7 px-2.5 rounded-md border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300"
        >
          <ChevronLeft className="w-3 h-3" />
          Previous
        </Button>

        <span className="text-[11px] font-mono text-neutral-400">
          Response #{selectedResponse.rowNumber}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!selectedResponse.nextResponseId}
          onClick={() => selectedResponse.nextResponseId && onNavigate(selectedResponse.nextResponseId)}
          className="gap-1 text-xs font-mono h-7 px-2.5 rounded-md border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300"
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
