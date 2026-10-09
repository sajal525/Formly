"use client";

import React, { useState } from "react";
import { AnalyticsHeatmapDayDTO } from "../server/get-form-analytics";
import { Table as TableIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseTimelineHeatmapProps {
  heatmap: AnalyticsHeatmapDayDTO[];
  className?: string;
}

export function ResponseTimelineHeatmap({
  heatmap,
  className,
}: ResponseTimelineHeatmapProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<AnalyticsHeatmapDayDTO | null>(null);

  // Group days into weeks (Mon to Sun)
  // Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Formly layout uses Mon-Sun columns
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Heatmap intensity classes
  const getLevelClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-slate-100 dark:bg-slate-800/80 border-slate-200/40 dark:border-slate-700/50";
      case 1:
        return "bg-violet-200 dark:bg-violet-950/80 border-violet-300 dark:border-violet-800 text-violet-800";
      case 2:
        return "bg-violet-400 dark:bg-violet-700 border-violet-500 text-white";
      case 3:
        return "bg-violet-600 dark:bg-violet-600 border-violet-700 text-white";
      case 4:
        return "bg-violet-800 dark:bg-violet-500 border-violet-900 text-white font-bold";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  const total = heatmap.reduce((acc, h) => acc + h.count, 0);

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
            Response Timeline
          </h3>
          <p className="text-[11px] text-slate-400">
            {total} responses across calendar days
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

      {heatmap.length === 0 ? (
        <div className="h-[180px] flex flex-col items-center justify-center text-xs text-slate-400 text-center p-4">
          <CalendarIcon className="w-6 h-6 mb-1 text-slate-300" />
          <span>No activity found for this date range.</span>
        </div>
      ) : showTable ? (
        <div className="max-h-[180px] overflow-y-auto text-xs border rounded-lg p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-1">Date</th>
                <th className="pb-1 text-right">Responses</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((h) => (
                <tr key={h.dateKey} className="border-b last:border-0">
                  <td className="py-1 text-slate-700 dark:text-slate-300">
                    {h.label}
                  </td>
                  <td className="py-1 text-right font-medium">{h.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[180px] flex flex-col justify-between">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold text-slate-400 mb-1">
            {dayNames.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Grid of days (last 28-35 days arranged into 7 columns) */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
            {heatmap.slice(-28).map((day) => (
              <div
                key={day.dateKey}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={cn(
                  "h-5 rounded-md border transition-all duration-150 cursor-pointer relative flex items-center justify-center text-[9px]",
                  getLevelClass(day.level)
                )}
                title={`${day.label}: ${day.count} responses`}
              >
                {day.count > 0 && (
                  <span className="opacity-90">{day.count}</span>
                )}
              </div>
            ))}
          </div>

          {/* Tooltip detail bar & Legend */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
            <div className="text-slate-500 truncate max-w-[150px] font-medium">
              {hoveredDay ? (
                <span>
                  {hoveredDay.label}:{" "}
                  <strong className="text-violet-600 dark:text-violet-400">
                    {hoveredDay.count}
                  </strong>{" "}
                  responses
                </span>
              ) : (
                <span className="text-slate-400">Hover day for details</span>
              )}
            </div>

            {/* Less -> More legend */}
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[9px]">Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800 border" />
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-200 border border-violet-300" />
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-400 border border-violet-500" />
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-600 border border-violet-700" />
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-800 border border-violet-900" />
              <span className="text-[9px]">More</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 mt-2">
        Daily response density calendar
      </div>
    </div>
  );
}
