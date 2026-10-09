"use client";

import React, { useState } from "react";
import { AnalyticsQuestionAnalysisDTO } from "../server/get-form-analytics";
import { Table as TableIcon, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionWiseAnalysisProps {
  questions: AnalyticsQuestionAnalysisDTO[];
  className?: string;
}

export function QuestionWiseAnalysis({
  questions,
  className,
}: QuestionWiseAnalysisProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questions[0]?.questionId || ""
  );
  const [showTable, setShowTable] = useState(false);

  const currentQuestion =
    questions.find((q) => q.questionId === selectedQuestionId) || questions[0];

  const total = currentQuestion?.totalAnswers || 0;
  const options = currentQuestion?.options || [];
  const maxCount = Math.max(...options.map((o) => o.count), 1);

  const colors = [
    "from-violet-500 to-indigo-500",
    "from-blue-400 to-cyan-500",
    "from-pink-500 to-rose-400",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Question-wise Analysis
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            ({total} answered)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <div className="relative">
              <select
                value={selectedQuestionId}
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg py-1 pl-2.5 pr-7 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium max-w-[200px] truncate"
              >
                {questions.map((q, idx) => (
                  <option key={q.questionId} value={q.questionId}>
                    {idx + 1}. {q.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            title="Toggle accessible table view"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!currentQuestion || options.length === 0 ? (
        <div className="h-[180px] flex flex-col items-center justify-center text-xs text-slate-400 text-center p-4">
          <HelpCircle className="w-6 h-6 mb-1 text-slate-300" />
          <span>No structured questions or answers available for this form.</span>
        </div>
      ) : showTable ? (
        <div className="max-h-[180px] overflow-y-auto text-xs border rounded-lg p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-1">Option</th>
                <th className="pb-1 text-right">Count</th>
                <th className="pb-1 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.value} className="border-b last:border-0">
                  <td className="py-1 text-slate-700 dark:text-slate-300">
                    {opt.label}
                  </td>
                  <td className="py-1 text-right font-medium">{opt.count}</td>
                  <td className="py-1 text-right text-slate-400">
                    {opt.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[180px] flex items-end justify-around gap-2 px-2 pt-6 pb-2">
          {options.slice(0, 6).map((opt, idx) => {
            const heightPercent =
              maxCount > 0 ? Math.round((opt.count / maxCount) * 100) : 0;
            const gradientClass = colors[idx % colors.length];

            return (
              <div
                key={opt.value}
                className="flex flex-col items-center flex-1 h-full justify-end group relative"
              >
                {/* Count badge above bar */}
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-hover:scale-110 transition-transform">
                  {opt.count}
                </span>

                {/* Vertical bar */}
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-[110px]">
                  <div
                    className={cn(
                      "w-full rounded-t-xl bg-gradient-to-t transition-all duration-500",
                      gradientClass
                    )}
                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                  />
                </div>

                {/* Option label below bar */}
                <span
                  title={opt.label}
                  className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 truncate max-w-[65px] text-center"
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
        <span>Option breakdown for structured question</span>
        {currentQuestion && (
          <span className="font-medium text-slate-500 truncate max-w-[200px]">
            {currentQuestion.label}
          </span>
        )}
      </div>
    </div>
  );
}
