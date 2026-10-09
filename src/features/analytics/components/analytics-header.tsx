"use client";

import React, { useState } from "react";
import { FormStatus } from "@prisma/client";
import { AnalyticsDateRangePreset } from "../schemas/analytics-query-schema";
import {
  Download,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AnalyticsHeaderProps {
  forms: {
    id: string;
    title: string;
    status: FormStatus;
    themeKey: string | null;
    responseCount: number;
    updatedAt: string;
  }[];
  selectedFormId: string | null;
  currentRange: AnalyticsDateRangePreset;
  customFrom?: string;
  customTo?: string;
  totalResponses: number;
  onSelectForm: (formId: string) => void;
  onSelectRange: (
    range: AnalyticsDateRangePreset,
    from?: string,
    to?: string
  ) => void;
  onExportAnalyticsCsv: () => void;
  onExportResponsesCsv: () => void;
  isExporting: boolean;
}

export function AnalyticsHeader({
  forms,
  selectedFormId,
  currentRange,
  customFrom,
  customTo,
  totalResponses,
  onSelectForm,
  onSelectRange,
  onExportAnalyticsCsv,
  onExportResponsesCsv,
  isExporting,
}: AnalyticsHeaderProps) {
  const currentForm = forms.find((f) => f.id === selectedFormId) || forms[0];
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [fromDate, setFromDate] = useState(customFrom || "");
  const [toDate, setToDate] = useState(customTo || "");

  const rangeLabels: Record<AnalyticsDateRangePreset, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    all: "All time",
    custom: "Custom Range",
  };

  const handleApplyCustom = () => {
    if (fromDate && toDate) {
      onSelectRange("custom", fromDate, toDate);
      setShowCustomModal(false);
    }
  };

  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case FormStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
        );
      case FormStatus.DRAFT:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60">
            Draft
          </span>
        );
      case FormStatus.CLOSED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Get detailed insights and understand your form performance.
          </p>
        </div>

        {forms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rangeLabels[currentRange]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem onClick={() => onSelectRange("7d")}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectRange("30d")}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectRange("90d")}>
                  Last 90 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectRange("all")}>
                  All time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setShowCustomModal(true);
                  }}
                >
                  Custom Range...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Report Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isExporting}
                  className="rounded-xl gap-2 font-semibold shadow-xs transition-all bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? "Exporting..." : "Export Report"}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs">
                <DropdownMenuItem
                  onClick={onExportAnalyticsCsv}
                  className="flex items-center gap-2.5 p-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Analytics CSV Report
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Metrics, funnel, devices & sources
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={totalResponses === 0}
                  onClick={onExportResponsesCsv}
                  className={cn(
                    "flex items-center gap-2.5 p-2",
                    totalResponses > 0
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Responses CSV Export
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {totalResponses > 0
                        ? "Raw authorized submissions"
                        : "No submissions yet"}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Select Form Combobox */}
      {forms.length > 0 && (
        <div className="w-full max-w-sm pt-1">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Select Form
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {currentForm?.title || "Select a form"}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{currentForm?.responseCount || 0} responses</span>
                      <span>•</span>
                      {currentForm && getStatusBadge(currentForm.status)}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 max-h-80 overflow-y-auto rounded-xl p-1.5 shadow-xl"
            >
              {forms.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => onSelectForm(f.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer",
                    f.id === selectedFormId
                      ? "bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200 font-semibold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{f.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {f.responseCount} responses • {f.status.toLowerCase()}
                    </p>
                  </div>
                  {f.id === selectedFormId && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select Custom Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Start Date (From)
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  End Date (To)
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustom}
                disabled={!fromDate || !toDate}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
              >
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
