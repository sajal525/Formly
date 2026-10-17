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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-medium uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Published
          </span>
        );
      case FormStatus.DRAFT:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#1C1F26] text-neutral-600 dark:text-neutral-400 font-mono text-[10px] font-medium uppercase tracking-wider">
            Draft
          </span>
        );
      case FormStatus.CLOSED:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#1C1F26] text-neutral-500 dark:text-neutral-400 font-mono text-[10px] font-medium uppercase tracking-wider">
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Get detailed insights and understand your form performance.
          </p>
        </div>

        {forms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 h-8 px-3 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1C1F26] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{rangeLabels[currentRange]}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs font-mono border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]">
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
                  className="h-8 px-3 rounded-lg text-xs font-mono font-medium gap-1.5 transition-colors bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-neutral-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? "Exporting..." : "Export Report"}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]">
                <DropdownMenuItem
                  onClick={onExportAnalyticsCsv}
                  className="flex items-center gap-2.5 p-2 cursor-pointer font-mono"
                >
                  <FileSpreadsheet className="w-4 h-4 text-neutral-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      Analytics CSV Report
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Metrics, funnel, devices & sources
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={totalResponses === 0}
                  onClick={onExportResponsesCsv}
                  className={cn(
                    "flex items-center gap-2.5 p-2 font-mono",
                    totalResponses > 0
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      Responses CSV Export
                    </p>
                    <p className="text-[10px] text-neutral-400">
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
          <span className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
            Select Form
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {currentForm?.title || "Select a form"}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span>{currentForm?.responseCount || 0} responses</span>
                      <span>•</span>
                      {currentForm && getStatusBadge(currentForm.status)}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 max-h-80 overflow-y-auto rounded-xl p-1.5 border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] shadow-lg"
            >
              {forms.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => onSelectForm(f.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs",
                    f.id === selectedFormId
                      ? "bg-[#563BFA]/10 text-[#563BFA] dark:text-[#8B77FF] font-semibold"
                      : "hover:bg-neutral-100 dark:hover:bg-[#1C1F26] text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{f.title}</p>
                    <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                      {f.responseCount} responses • {f.status.toLowerCase()}
                    </p>
                  </div>
                  {f.id === selectedFormId && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA] shrink-0" />
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
          <div className="bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] p-5 shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Select Custom Date Range
            </h3>
            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Start Date (From)
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 text-xs font-mono rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  End Date (To)
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 text-xs font-mono rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomModal(false)}
                className="text-xs h-7 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustom}
                disabled={!fromDate || !toDate}
                className="bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs h-7 rounded-lg font-mono"
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
