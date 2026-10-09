"use client";

import React from "react";
import { TrashItemDTO } from "../server/get-trash-page";
import {
  RotateCcw,
  Trash2,
  Calendar,
  Clock,
  Link as LinkIcon,
  Users,
  Info,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrashDetailsPanelProps {
  item: TrashItemDTO | null;
  onRestore: (item: TrashItemDTO) => void;
  onPermanentDelete: (item: TrashItemDTO) => void;
  className?: string;
}

export function TrashDetailsPanel({
  item,
  onRestore,
  onPermanentDelete,
  className,
}: TrashDetailsPanelProps) {
  if (!item) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[360px] text-slate-400",
          className
        )}
      >
        <FileText className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Select a deleted form to inspect details and actions
        </p>
      </div>
    );
  }

  const formattedDeleted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(item.deletedAt));

  const formattedCreated = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(item.createdAt));

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5",
        className
      )}
    >
      {/* Top Visual Preview Banner */}
      <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50 dark:from-slate-800 dark:via-indigo-950/20 dark:to-slate-800 border border-indigo-100/60 dark:border-slate-700/60 p-4 flex flex-col justify-between overflow-hidden relative">
        <div className="flex items-center justify-between z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {item.themeKey || "Standard Theme"}
          </span>
          {item.isExpired ? (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md">
              Expired
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {item.daysLeft}d left
            </span>
          )}
        </div>

        {/* Abstract preview skeleton mimicking 10.png illustration */}
        <div className="space-y-1.5 z-10 max-w-[85%]">
          <div className="h-3 w-3/4 bg-indigo-200/60 dark:bg-indigo-700/40 rounded-sm" />
          <div className="h-2 w-full bg-indigo-100/80 dark:bg-indigo-900/40 rounded-sm" />
          <div className="h-2 w-1/2 bg-indigo-100/60 dark:bg-indigo-900/30 rounded-sm" />
        </div>

        {/* Background decorative watermark */}
        <FileText className="w-24 h-24 text-indigo-200/20 dark:text-indigo-900/10 absolute -right-4 -bottom-4 pointer-events-none" />
      </div>

      {/* Title & Description */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {item.title}
          </h2>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-[#563BFA] dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40 shrink-0">
            Form
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Metadata Attributes */}
      <div className="space-y-2.5 text-xs border-y border-slate-100 dark:border-slate-800 py-3.5">
        {/* Deleted On */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Deleted On</span>
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formattedDeleted}
          </span>
        </div>

        {/* Days Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Days Left</span>
          </div>
          {item.isExpired ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              Expired
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {item.daysLeft} days
            </span>
          )}
        </div>

        {/* Original Created */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Original Created</span>
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formattedCreated}
          </span>
        </div>

        {/* Total Responses */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>Total Responses</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {item.totalResponses} {item.totalResponses === 1 ? "response" : "responses"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Actions
        </h4>
        <Button
          type="button"
          onClick={() => onRestore(item)}
          className="w-full h-10 rounded-xl bg-[#563BFA] hover:bg-violet-700 text-white font-semibold text-xs shadow-xs gap-2 transition-all active:scale-[0.99]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Form</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onPermanentDelete(item)}
          className="w-full h-10 rounded-xl bg-rose-50/60 hover:bg-rose-100 text-rose-600 hover:text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 border-rose-200/80 dark:border-rose-900/60 font-semibold text-xs gap-2 transition-all active:scale-[0.99]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Permanently</span>
        </Button>
      </div>

      {/* Policy Callout */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          {item.isExpired
            ? "This form has exceeded the retention deadline and is queued for automated removal."
            : `This form will be permanently deleted in ${item.daysLeft} days. After that, it cannot be recovered.`}
        </span>
      </div>
    </div>
  );
}
