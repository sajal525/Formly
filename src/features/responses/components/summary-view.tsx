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
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Summary Data Available
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          This form has not received any submissions yet to generate question summaries.
        </p>
      </div>
    );
  }

  const colorPalette = [
    "#8B5CF6",
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
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Question {idx + 1} • {q.type.toLowerCase().replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full">
                    {q.answeredCount} answers ({totalResponses > 0 ? Math.round((q.answeredCount / totalResponses) * 100) : 0}%)
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  {q.label}
                </h3>

                {hasDistribution ? (
                  <div className="space-y-2.5">
                    {q.distribution!.map((opt, optIdx) => {
                      const color = colorPalette[optIdx % colorPalette.length];
                      return (
                        <div key={opt.value} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                              {opt.label}
                            </span>
                            <span className="text-slate-500 font-semibold text-[11px]">
                              {opt.count} ({opt.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-center">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {q.answeredCount} text / freeform responses submitted.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
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
