"use client";

import React from "react";
import {
  ResponseDetailsDTO,
  ResponseTableRowDTO,
} from "../server/get-responses-workspace";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IndividualViewProps {
  selectedResponse: ResponseDetailsDTO | null;
  totalResponses: number;
  allResponses: ResponseTableRowDTO[];
  onNavigate: (responseId: string) => void;
}

export function IndividualView({
  selectedResponse,
  totalResponses,
  allResponses,
  onNavigate,
}: IndividualViewProps) {
  if (totalResponses === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Responses Available
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          This form has not received any submissions yet to inspect individually.
        </p>
      </div>
    );
  }

  // If no response is selected, prompt to select first
  if (!selectedResponse) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Individual Response Inspector
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
          Select a response to view all answers submitted by this respondent.
        </p>
        {allResponses.length > 0 && (
          <Button
            size="sm"
            onClick={() => onNavigate(allResponses[0].id)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
          >
            Inspect Response #1
          </Button>
        )}
      </div>
    );
  }

  const formatTimestamp = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return null;
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Navigation Top Toolbar */}
      <div className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-800 dark:text-neutral-200 font-mono font-bold text-sm flex items-center justify-center">
            {selectedResponse.rowNumber}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
              Response #{selectedResponse.rowNumber} of {totalResponses}
            </h3>
            <p className="text-[11px] font-mono text-neutral-400">
              Submitted on {formatTimestamp(selectedResponse.submittedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Details Card */}
      <div className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 sm:p-6 space-y-5">
        {/* Meta summary pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E5E7EB] dark:border-[#27272A] text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-3 h-3 text-neutral-400" />
            <span>{formatTimestamp(selectedResponse.submittedAt)}</span>
          </div>

          {selectedResponse.durationSeconds !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] text-neutral-600 dark:text-neutral-400">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Completion time: {formatDuration(selectedResponse.durationSeconds)}</span>
            </div>
          )}
        </div>

        {/* Question & Answer List */}
        <div className="space-y-4">
          {selectedResponse.answers.map((ans, idx) => (
            <div
              key={ans.questionId || idx}
              className="p-3.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Question {idx + 1}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {ans.type.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                {ans.label}
              </h4>

              <div className="pt-1">
                {ans.type === "RATING" && ans.value ? (
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= Number(ans.value)
                            ? "fill-amber-500"
                            : "text-neutral-300 dark:text-neutral-700"
                        )}
                      />
                    ))}
                    <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 ml-1.5">
                      {ans.value} / 5 Stars
                    </span>
                  </div>
                ) : ans.type === "CHECKBOX" && Array.isArray(ans.value) ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ans.value.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-xs font-mono text-neutral-800 dark:text-neutral-200"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#563BFA]" />
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#121417] p-2.5 rounded-md border border-[#E5E7EB] dark:border-[#27272A] text-xs text-neutral-800 dark:text-neutral-200 break-words whitespace-pre-wrap leading-relaxed">
                    {ans.formattedValue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
