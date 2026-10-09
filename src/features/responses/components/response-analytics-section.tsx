"use client";

import React, { useState } from "react";
import {
  TimeSeriesPointDTO,
  QuestionSummaryDTO,
} from "../server/get-responses-workspace";
import { ResponseDateRange } from "../schemas/response-query-schema";
import {
  ChevronDown,
  Calendar,
  Table as TableIcon,
  BarChart,
  PieChart,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ResponseAnalyticsSectionProps {
  timeSeries: TimeSeriesPointDTO[];
  questionSummaries: QuestionSummaryDTO[];
  totalResponses: number;
  currentDateRange: ResponseDateRange;
  onDateRangeChange: (range: ResponseDateRange) => void;
  className?: string;
}

export function ResponseAnalyticsSection({
  timeSeries,
  questionSummaries,
  totalResponses,
  currentDateRange,
  onDateRangeChange,
  className,
}: ResponseAnalyticsSectionProps) {
  // Choice/rating questions that have distribution data
  const eligibleQuestions = questionSummaries.filter(
    (q) => q.distribution && q.distribution.length > 0
  );

  const [selectedQuestionIndex1, setSelectedQuestionIndex1] = useState(0);
  const [selectedQuestionIndex2, setSelectedQuestionIndex2] = useState(
    eligibleQuestions.length > 1 ? 1 : 0
  );

  const [showTable1, setShowTable1] = useState(false);
  const [showTable2, setShowTable2] = useState(false);
  const [showTable3, setShowTable3] = useState(false);

  const question1 = eligibleQuestions[selectedQuestionIndex1];
  const question2 = eligibleQuestions[selectedQuestionIndex2];

  const dateRangeLabels: Record<ResponseDateRange, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    all: "All time",
  };

  // Color palette for options/slices
  const colorPalette = [
    "#8B5CF6", // violet
    "#3B82F6", // blue
    "#10B981", // emerald
    "#EC4899", // pink
    "#F59E0B", // amber
    "#06B6D4", // cyan
    "#F43F5E", // rose
    "#6366F1", // indigo
  ];

  if (totalResponses === 0) {
    return (
      <div className={cn("p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-white/50 dark:bg-slate-900/50", className)}>
        <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Analytics Available Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Once your published form receives respondent submissions, real time-series metrics and question distribution charts will appear here.
        </p>
      </div>
    );
  }

  // --- SVG Line Chart Math for Time Series ---
  const maxCount = Math.max(1, ...timeSeries.map((p) => p.count));
  const svgWidth = 400;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 25;

  const points = timeSeries.map((pt, i) => {
    const x =
      timeSeries.length > 1
        ? paddingX + (i / (timeSeries.length - 1)) * (svgWidth - paddingX * 2)
        : svgWidth / 2;
    const y =
      svgHeight -
      paddingY -
      (pt.count / maxCount) * (svgHeight - paddingY * 2);
    return { x, y, ...pt };
  });

  const linePath =
    points.length > 0
      ? points.reduce(
          (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ""
        )
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : "";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chart 1: Responses Over Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Responses Over Time
              </h3>
              <p className="text-[11px] text-slate-400">
                {timeSeries.reduce((acc, p) => acc + p.count, 0)} submissions in range
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowTable1(!showTable1)}
                title="Toggle accessible table"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>{dateRangeLabels[currentDateRange]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={() => onDateRangeChange("7d")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDateRangeChange("30d")}>
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDateRangeChange("90d")}>
                    Last 90 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDateRangeChange("all")}>
                    All time
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showTable1 ? (
            <div className="max-h-[160px] overflow-y-auto text-xs border rounded-lg p-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-1">Date</th>
                    <th className="pb-1 text-right">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSeries.map((pt) => (
                    <tr key={pt.dateKey} className="border-b last:border-0">
                      <td className="py-1 text-slate-700 dark:text-slate-300">
                        {pt.label}
                      </td>
                      <td className="py-1 text-right font-medium text-slate-900 dark:text-white">
                        {pt.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="relative w-full h-[160px] flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y grid lines */}
                {[0, 0.5, 1].map((pct, i) => {
                  const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="2 3"
                      className="text-slate-200 dark:text-slate-800"
                    />
                  );
                })}

                {/* Area fill */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {/* Curve line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* Time Series bottom labels */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>{timeSeries[0]?.label || ""}</span>
            <span>{timeSeries[Math.floor(timeSeries.length / 2)]?.label || ""}</span>
            <span>{timeSeries[timeSeries.length - 1]?.label || ""}</span>
          </div>
        </div>

        {/* Chart 2: Answer Distribution (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                {question1 ? question1.label : "Question Distribution"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {question1?.answeredCount || 0} answered
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowTable2(!showTable2)}
                title="Toggle accessible table"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>

              {eligibleQuestions.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Select question"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs max-w-xs">
                    {eligibleQuestions.map((q, idx) => (
                      <DropdownMenuItem
                        key={q.questionId}
                        onClick={() => setSelectedQuestionIndex1(idx)}
                        className="truncate"
                      >
                        {q.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {!question1 || !question1.distribution || question1.distribution.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-xs text-slate-400 text-center">
              No choice questions available to chart.
            </div>
          ) : showTable2 ? (
            <div className="max-h-[160px] overflow-y-auto text-xs border rounded-lg p-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-1">Option</th>
                    <th className="pb-1 text-right">Count</th>
                    <th className="pb-1 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {question1.distribution.map((opt) => (
                    <tr key={opt.value} className="border-b last:border-0">
                      <td className="py-1 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
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
            <div className="h-[160px] flex flex-col justify-center gap-2 px-1">
              {question1.distribution.slice(0, 5).map((opt, idx) => {
                const color = colorPalette[idx % colorPalette.length];
                return (
                  <div key={opt.value} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {opt.label}
                      </span>
                      <span className="text-slate-500 font-semibold text-[11px]">
                        {opt.count} ({opt.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(4, opt.percentage)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-[10px] text-slate-400 mt-2">
            Top choice distribution
          </div>
        </div>

        {/* Chart 3: Question Breakdown (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                {question2 ? question2.label : "Breakdown"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {question2?.answeredCount || 0} answered
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowTable3(!showTable3)}
                title="Toggle accessible table"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>

              {eligibleQuestions.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Select question"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs max-w-xs">
                    {eligibleQuestions.map((q, idx) => (
                      <DropdownMenuItem
                        key={q.questionId}
                        onClick={() => setSelectedQuestionIndex2(idx)}
                        className="truncate"
                      >
                        {q.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {!question2 || !question2.distribution || question2.distribution.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-xs text-slate-400 text-center">
              No choice questions available to chart.
            </div>
          ) : showTable3 ? (
            <div className="max-h-[160px] overflow-y-auto text-xs border rounded-lg p-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-1">Option</th>
                    <th className="pb-1 text-right">Count</th>
                    <th className="pb-1 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {question2.distribution.map((opt) => (
                    <tr key={opt.value} className="border-b last:border-0">
                      <td className="py-1 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
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
            <div className="h-[160px] flex items-center justify-between gap-3 px-2">
              {/* Donut SVG */}
              <div className="w-28 h-28 relative shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return question2.distribution.map((opt, idx) => {
                      const color = colorPalette[idx % colorPalette.length];
                      const strokeDasharray = `${opt.percentage} ${100 - opt.percentage}`;
                      const strokeDashoffset = -cumulative;
                      cumulative += opt.percentage;

                      return (
                        <circle
                          key={opt.value}
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={color}
                          strokeWidth="5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {question2.answeredCount}
                  </span>
                  <span className="text-[9px] text-slate-400">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {question2.distribution.slice(0, 4).map((opt, idx) => {
                  const color = colorPalette[idx % colorPalette.length];
                  return (
                    <div key={opt.value} className="flex items-center justify-between text-xs gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
                          {opt.label}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] shrink-0">
                        {opt.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 mt-2">
            Proportional breakdown
          </div>
        </div>
      </div>
    </div>
  );
}
