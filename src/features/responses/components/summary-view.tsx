"use client";

import React from "react";
import { QuestionSummaryDTO } from "../server/get-responses-workspace";
import { BarChart3, HelpCircle, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryViewProps {
  questionSummaries: QuestionSummaryDTO[];
  totalResponses: number;
}

export function SummaryView({
  questionSummaries,
  totalResponses,
}: SummaryViewProps) {
  if (totalResponses === 0) {
    return (
      <div className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-12 text-center">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          No Summary Data Available
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          This form has not received any submissions yet to generate question summaries.
        </p>
      </div>
    );
  }

  const colorPalette = [
    "#563BFA",
    "#3B82F6",
    "#10B981",
    "#EC4899",
    "#F59E0B",
    "#06B6D4",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionSummaries.map((q, idx) => {
          const hasDistribution = q.distribution && q.distribution.length > 0;

          return (
            <div
              key={q.questionId}
              className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Question {idx + 1} • {q.type.toLowerCase().replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#563BFA] dark:text-[#8B77FF] bg-[#563BFA]/10 border border-[#563BFA]/20 px-1.5 py-0.5 rounded">
                    {q.answeredCount} answers ({totalResponses > 0 ? Math.round((q.answeredCount / totalResponses) * 100) : 0}%)
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white mb-3.5">
                  {q.label}
                </h3>

                {hasDistribution ? (
                  <div className="space-y-2">
                    {q.distribution!.map((opt, optIdx) => {
                      const color = colorPalette[optIdx % colorPalette.length];
                      return (
                        <div key={opt.value} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[220px]">
                              {opt.label}
                            </span>
                            <span className="text-neutral-400 text-[11px]">
                              {opt.count} ({opt.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-100 dark:bg-[#1C1F26] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(2, opt.percentage)}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-center">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {q.answeredCount} text / freeform responses submitted.
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      View individual answers in the Responses table or Individual View tab.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
