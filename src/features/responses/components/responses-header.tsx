"use client";

import React, { useRef } from "react";
import {
  FormResponseSelectorDTO,
  ResponseSummaryKPIs,
} from "../server/get-responses-workspace";
import { FormStatus } from "@prisma/client";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ResponsesHeaderProps {
  forms: FormResponseSelectorDTO[];
  selectedFormId: string | null;
  kpis: ResponseSummaryKPIs;
  onSelectForm: (formId: string) => void;
  onExportCsv: () => void;
  isExporting: boolean;
}

export function ResponsesHeader({
  forms,
  selectedFormId,
  kpis,
  onSelectForm,
  onExportCsv,
  isExporting,
}: ResponsesHeaderProps) {
  const currentForm = forms.find((f) => f.id === selectedFormId) || forms[0];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case FormStatus.PUBLISHED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
        );
      case FormStatus.DRAFT:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
            Draft
          </span>
        );
      case FormStatus.CLOSED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Closed
          </span>
        );
      case FormStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Global Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Responses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage submissions from any of your forms.
          </p>
        </div>

        {forms.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onExportCsv}
              disabled={kpis.totalResponses === 0 || isExporting}
              title={
                kpis.totalResponses === 0
                  ? "No responses available to export yet."
                  : "Download authorized responses as CSV"
              }
              className={cn(
                "rounded-xl gap-2 font-semibold shadow-xs transition-all",
                kpis.totalResponses > 0
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
              )}
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Export"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Form Selector Row & Shortcut Strip */}
      {forms.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
          {/* Combobox Form Dropdown */}
          <div className="w-full lg:w-72 shrink-0">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Form
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
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
                className="w-72 max-h-80 overflow-y-auto rounded-xl p-1.5 shadow-xl"
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

          {/* Horizontal Shortcut Strip */}
          <div className="relative flex-1 min-w-0 hidden sm:flex items-center">
            {/* Scroll navigation arrows */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll forms left"
              className="p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 shrink-0 mr-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
            >
              {forms.map((f) => {
                const isSelected = f.id === selectedFormId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectForm(f.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all duration-150 min-w-[160px] max-w-[220px]",
                      isSelected
                        ? "bg-violet-50/80 dark:bg-violet-950/30 border-violet-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-violet-500/20"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                        isSelected
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}
                    >
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {f.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {f.responseCount} responses
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll forms right"
              className="p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 shrink-0 ml-1.5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
