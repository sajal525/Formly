"use client";

import React, { useState } from "react";
import { AnalyticsTimeSeriesPointDTO } from "../server/get-form-analytics";
import { Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseTrendChartProps {
  timeSeries: AnalyticsTimeSeriesPointDTO[];
  rangeLabel: string;
  className?: string;
}

export function ResponseTrendChart({
  timeSeries,
  rangeLabel,
  className,
}: ResponseTrendChartProps) {
  const [showTable, setShowTable] = useState(false);
  const totalSubmissions = timeSeries.reduce((acc, p) => acc + p.responses, 0);

  const maxCount = Math.max(1, ...timeSeries.map((p) => p.responses));
  const svgWidth = 400;
  const svgHeight = 170;
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
      (pt.responses / maxCount) * (svgHeight - paddingY * 2);
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
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Responses Over Time
          </h3>
          <p className="text-[11px] text-slate-400">
            {totalSubmissions} submissions ({rangeLabel})
          </p>
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
            <defs>
              <linearGradient id="respAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
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

            {/* Area & Line */}
            {areaPath && <path d={areaPath} fill="url(#respAreaGrad)" />}
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

            {/* Data points */}
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
