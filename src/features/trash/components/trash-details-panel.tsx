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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 space-y-4",
        className
      )}
    >
      {/* Top Visual Preview Banner */}
      <div className="w-full h-28 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] p-3 flex flex-col justify-between overflow-hidden relative">
        <div className="flex items-center justify-between z-10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] px-2 py-0.5 rounded">
            {item.themeKey || "Standard Theme"}
          </span>
          {item.isExpired ? (
            <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
              Expired
            </span>
          ) : (
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {item.daysLeft}d left
            </span>
          )}
        </div>

        {/* Abstract preview skeleton */}
        <div className="space-y-1 z-10 max-w-[85%]">
          <div className="h-2.5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-xs" />
          <div className="h-2 w-full bg-neutral-200/60 dark:bg-neutral-800/60 rounded-xs" />
        </div>

        {/* Background icon watermark */}
        <FileText className="w-16 h-16 text-neutral-200/50 dark:text-neutral-800/40 absolute -right-2 -bottom-2 pointer-events-none" />
      </div>

      {/* Title & Description */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
            {item.title}
          </h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 dark:bg-[#181B20] dark:text-neutral-400 border border-[#E5E7EB] dark:border-[#27272A] shrink-0">
            Form
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Metadata Attributes */}
      <div className="space-y-2 text-xs border-y border-[#E5E7EB] dark:border-[#27272A] py-3 font-mono">
        {/* Deleted On */}
        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Deleted</span>
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[11px]">
            {formattedDeleted}
          </span>
        </div>

        {/* Days Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Days Left</span>
          </div>
          {item.isExpired ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
              Expired
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600 dark:bg-[#181B20] dark:text-neutral-400 border border-[#E5E7EB] dark:border-[#27272A] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {item.daysLeft}d left
            </span>
          )}
        </div>

        {/* Original Created */}
        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Created</span>
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[11px]">
            {formattedCreated}
          </span>
        </div>

        {/* Total Responses */}
        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Users className="w-3.5 h-3.5" />
            <span>Responses</span>
          </div>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {item.totalResponses}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1 font-mono">
        <Button
          type="button"
          onClick={() => onRestore(item)}
          className="w-full h-8 rounded-lg bg-[#563BFA] hover:bg-[#4830d9] text-white font-medium text-xs shadow-none gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Form</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onPermanentDelete(item)}
          className="w-full h-8 rounded-lg bg-rose-50/40 hover:bg-rose-100/60 text-rose-600 hover:text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 font-medium text-xs gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Permanently</span>
        </Button>
      </div>

      {/* Policy Callout */}
      <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <span>
          {item.isExpired
            ? "Retention deadline exceeded: queued for automated removal."
            : `Permanently deleted in ${item.daysLeft} days. Cannot be recovered after.`}
        </span>
      </div>
    </div>
  );
}
