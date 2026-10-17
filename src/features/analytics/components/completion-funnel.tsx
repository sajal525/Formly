"use client";

import React, { useState } from "react";
import { AnalyticsFunnelStageDTO } from "../server/get-form-analytics";
import { Table as TableIcon, Filter, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionFunnelProps {
  stages: AnalyticsFunnelStageDTO[];
  className?: string;
}

export function CompletionFunnel({ stages, className }: CompletionFunnelProps) {
  const [showTable, setShowTable] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const baseCount = stages[0]?.count || 0;

  // Funnel polygon points for visual tapering
  const stageColors = [
    "#6366F1", // Indigo / Views
    "#8B5CF6", // Violet / Started
    "#EC4899", // Pink / Reached Last
    "#3B82F6", // Blue / Submitted
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-4 flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Completion Funnel
          </h3>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              title="Cohort definition"
            >
              <Info className="w-3 h-3" />
            </button>
            {showTooltip && (
              <div className="absolute left-0 bottom-full mb-1 z-50 w-56 p-2 text-[10px] font-mono bg-neutral-900 text-white rounded border border-neutral-800 shadow-lg pointer-events-none">
                Cohort of sessions started in the selected date range. Stages are
                monotonic and represent true progression from arrival to submission.
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          title="Toggle accessible table view"
          className="p-1 rounded-md border border-[#E5E7EB] dark:border-[#27272A] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-500"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {baseCount === 0 ? (
        <div className="h-[180px] flex flex-col items-center justify-center text-xs font-mono text-neutral-400 text-center p-4">
          <Filter className="w-5 h-5 mb-1 text-neutral-300 dark:text-neutral-700" />
          <span>No session cohort data recorded in this period.</span>
        </div>
      ) : showTable ? (
        <div className="max-h-[180px] overflow-y-auto text-xs font-mono border border-[#E5E7EB] dark:border-[#27272A] rounded-lg p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#27272A] text-neutral-400 text-[10px] uppercase">
                <th className="pb-1">Funnel Stage</th>
                <th className="pb-1 text-right">Count</th>
                <th className="pb-1 text-right">% of Views</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((st) => (
                <tr key={st.stage} className="border-b last:border-0">
                  <td className="py-1 text-slate-700 dark:text-slate-300">
                    {st.stage}
                  </td>
                  <td className="py-1 text-right font-medium">{st.count}</td>
                  <td className="py-1 text-right text-slate-400">
                    {st.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[180px] flex items-center gap-4 px-2">
          {/* Tapering Funnel Shape */}
          <div className="w-28 h-32 relative shrink-0 flex flex-col justify-between items-center py-1">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs">
              <defs>
                <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="35%" stopColor="#8B5CF6" />
                  <stop offset="70%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

              {/* Four trapezoid stages */}
              {/* Stage 1: Views (top 0 to 28) */}
              <polygon
                points="5,2 95,2 84,28 16,28"
                fill="#6366F1"
                className="opacity-95"
              />
              {/* Stage 2: Started (29 to 58) */}
              <polygon
                points="17,30 83,30 73,58 27,58"
                fill="#8B5CF6"
                className="opacity-95"
              />
              {/* Stage 3: Reached Last Question (59 to 88) */}
              <polygon
                points="28,60 72,60 62,88 38,88"
                fill="#EC4899"
                className="opacity-95"
              />
              {/* Stage 4: Submitted (89 to 118) */}
              <polygon
                points="39,90 61,90 54,118 46,118"
                fill="#3B82F6"
                className="opacity-95"
              />
            </svg>
          </div>

          {/* Stages details list */}
          <div className="flex-1 space-y-2.5">
            {stages.map((st, idx) => (
              <div
                key={st.stage}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: stageColors[idx % stageColors.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate text-[11px]">
                    {st.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    {st.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium w-8 text-right">
                    {st.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 mt-2">
        Monotonic session progression for qualified starts
      </div>
    </div>
  );
}
