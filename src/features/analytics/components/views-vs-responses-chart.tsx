"use client";

import React, { useState } from "react";
import { AnalyticsTimeSeriesPointDTO } from "../server/get-form-analytics";
import { Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewsVsResponsesChartProps {
  timeSeries: AnalyticsTimeSeriesPointDTO[];
  className?: string;
}

export function ViewsVsResponsesChart({
  timeSeries,
  className,
}: ViewsVsResponsesChartProps) {
  const [showTable, setShowTable] = useState(false);

  const maxVal = Math.max(
    1,
    ...timeSeries.map((p) => Math.max(p.views, p.responses))
  );

  const svgWidth = 400;
  const svgHeight = 170;
  const paddingX = 25;
  const paddingY = 25;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Daily Views vs Responses
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Views
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              Responses
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          title="Toggle accessible table view"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTable ? (
        <div className="max-h-[170px] overflow-y-auto text-xs border rounded-lg p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-1">Date</th>
                <th className="pb-1 text-right">Views</th>
                <th className="pb-1 text-right">Responses</th>
              </tr>
            </thead>
            <tbody>
              {timeSeries.map((pt) => (
                <tr key={pt.dateKey} className="border-b last:border-0">
                  <td className="py-1 text-slate-700 dark:text-slate-300">
                    {pt.label}
                  </td>
                  <td className="py-1 text-right font-medium text-blue-600">
                    {pt.views}
                  </td>
                  <td className="py-1 text-right font-medium text-violet-600">
                    {pt.responses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative w-full h-[170px] flex items-center justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
          >
            {/* Horizontal Grid lines */}
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

            {/* Paired Bar Columns */}
            {timeSeries.map((pt, i) => {
              const totalItems = timeSeries.length;
              const slotWidth = (svgWidth - paddingX * 2) / Math.max(1, totalItems);
              const barWidth = Math.max(2.5, Math.min(8, slotWidth * 0.35));
              const centerX = paddingX + i * slotWidth + slotWidth / 2;

              const viewHeight =
                (pt.views / maxVal) * (svgHeight - paddingY * 2);
              const respHeight =
                (pt.responses / maxVal) * (svgHeight - paddingY * 2);

              const viewY = svgHeight - paddingY - viewHeight;
              const respY = svgHeight - paddingY - respHeight;

              return (
                <g key={pt.dateKey}>
                  {/* Views bar (blue) */}
                  {pt.views > 0 && (
                    <rect
                      x={centerX - barWidth - 1}
                      y={viewY}
                      width={barWidth}
                      height={viewHeight}
                      rx={1.5}
                      fill="#3B82F6"
                      opacity={0.85}
                    />
                  )}
                  {/* Responses bar (violet) */}
                  {pt.responses > 0 && (
                    <rect
                      x={centerX + 1}
                      y={respY}
                      width={barWidth}
                      height={respHeight}
                      rx={1.5}
                      fill="#8B5CF6"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
        <span>{timeSeries[0]?.label || ""}</span>
        <span>
          {timeSeries[Math.floor(timeSeries.length / 2)]?.label || ""}
        </span>
        <span>{timeSeries[timeSeries.length - 1]?.label || ""}</span>
      </div>
    </div>
  );
}
