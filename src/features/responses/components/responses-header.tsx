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
      case FormStatus.ARCHIVED:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#1C1F26] text-neutral-400 font-mono text-[10px] font-medium uppercase tracking-wider">
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Responses
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
                "h-8 px-3 rounded-lg text-xs font-mono font-medium gap-1.5 transition-colors border",
                kpis.totalResponses > 0
                  ? "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "bg-neutral-100 text-neutral-400 dark:bg-[#1C1F26] dark:text-neutral-600 border-[#E5E7EB] dark:border-[#27272A] cursor-not-allowed"
              )}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Form Selector Row & Shortcut Strip */}
      {forms.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
          {/* Combobox Form Dropdown */}
          <div className="w-full lg:w-72 shrink-0">
            <span className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Select Form
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-left"
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
                className="w-72 max-h-80 overflow-y-auto rounded-xl p-1.5 border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] shadow-lg"
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

          {/* Horizontal Shortcut Strip */}
          <div className="relative flex-1 min-w-0 hidden sm:flex items-center">
            {/* Scroll navigation arrows */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll forms left"
              className="p-1 rounded-md border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-500 shrink-0 mr-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
            >
              {forms.map((f) => {
                const isSelected = f.id === selectedFormId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectForm(f.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-colors min-w-[160px] max-w-[220px]",
                      isSelected
                        ? "bg-[#563BFA]/5 dark:bg-[#563BFA]/10 border-[#563BFA] text-neutral-900 dark:text-white"
                        : "bg-white dark:bg-[#121417] border-[#E5E7EB] dark:border-[#27272A] text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#1C1F26]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                        isSelected
                          ? "bg-[#563BFA] text-white border-[#563BFA]"
                          : "bg-neutral-100 dark:bg-[#1C1F26] border-[#E5E7EB] dark:border-[#27272A] text-neutral-500"
                      )}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {f.title}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
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
              className="p-1 rounded-md border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-500 shrink-0 ml-1.5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
