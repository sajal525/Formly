"use client";

import React, { useState } from "react";
import { AnalyticsDistributionItemDTO } from "../server/get-form-analytics";
import { Table as TableIcon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceDistributionChartProps {
  distribution: AnalyticsDistributionItemDTO[];
  className?: string;
}

export function DeviceDistributionChart({
  distribution,
  className,
}: DeviceDistributionChartProps) {
  const [showTable, setShowTable] = useState(false);
  const total = distribution.reduce((acc, d) => acc + d.count, 0);

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
            Device Type
          </h3>
          <p className="text-[11px] text-slate-400">
            {total} total sessions
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

      {total === 0 ? (
        <div className="h-[170px] flex flex-col items-center justify-center text-xs text-slate-400 text-center p-4">
          <Laptop className="w-6 h-6 mb-1 text-slate-300" />
          <span>No device data recorded for this period.</span>
        </div>
      ) : showTable ? (
        <div className="max-h-[170px] overflow-y-auto text-xs border rounded-lg p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-1">Device</th>
                <th className="pb-1 text-right">Count</th>
                <th className="pb-1 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((d) => (
                <tr key={d.key} className="border-b last:border-0">
                  <td className="py-1 text-slate-700 dark:text-slate-300">
                    {d.name}
                  </td>
                  <td className="py-1 text-right font-medium">{d.count}</td>
                  <td className="py-1 text-right text-slate-400">
                    {d.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[170px] flex items-center justify-between gap-4 px-2">
          {/* Donut SVG */}
          <div className="w-28 h-28 relative shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {(() => {
                let cumulative = 0;
                return distribution.map((item) => {
                  const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                  const strokeDashoffset = -cumulative;
                  cumulative += item.percentage;

                  return (
                    <circle
                      key={item.key}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={item.color}
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
                {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
              </span>
              <span className="text-[9px] text-slate-400">Total Views</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 overflow-hidden">
            {distribution.map((d) => (
              <div
                key={d.key}
                className="flex items-center justify-between text-xs gap-1.5"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
                    {d.name}
                  </span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] shrink-0">
                  {d.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 mt-2">
        Coarse device breakdown
      </div>
    </div>
  );
}
