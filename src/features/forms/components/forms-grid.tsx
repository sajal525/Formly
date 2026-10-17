"use client";

import React from "react";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import { FormStatusBadge } from "./form-status-badge";
import { FormRowActions } from "./form-row-actions";
import { formatDate, formatRelativeTime } from "../utils/formatters";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormsGridProps {
  forms: MyFormItemDTO[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewDetails: (form: MyFormItemDTO) => void;
  onRename: (form: MyFormItemDTO) => void;
  onArchive: (form: MyFormItemDTO) => void;
  onRestore: (form: MyFormItemDTO) => void;
  onTrash: (form: MyFormItemDTO) => void;
}

/**
 * Quiet neutral Formly placeholders for forms without covers.
 */
function FormlyNeutralCoverPlaceholder({ index }: { index: number }) {
  const patterns = [
    <div
      key="lavender"
      className="w-full h-full bg-gradient-to-tr from-[#ede9fe] via-[#f5f3ff] to-[#e0e7ff] dark:from-[#2e1065]/40 dark:via-[#1e1b4b]/30 dark:to-[#0f172a] relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 80 C 100 120, 200 40, 400 80 L 400 160 L 0 160 Z"
          fill="url(#wave-grad-grid)"
        />
        <defs>
          <linearGradient id="wave-grad-grid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>,

    <div
      key="slate"
      className="w-full h-full bg-gradient-to-br from-zinc-100 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-30 dark:opacity-15"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 120 Q 150 60, 300 130 T 400 100 L 400 160 L 0 160 Z"
          fill="currentColor"
          className="text-zinc-400 dark:text-zinc-600"
        />
      </svg>
    </div>,

    <div
      key="architectural"
      className="w-full h-full bg-gradient-to-tr from-neutral-200 via-neutral-100 to-stone-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-25 dark:opacity-15"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <polygon
          points="0,160 180,40 320,160"
          fill="currentColor"
          className="text-neutral-400 dark:text-zinc-700"
        />
        <polygon
          points="160,160 280,70 400,160"
          fill="currentColor"
          className="text-neutral-500 dark:text-zinc-600 opacity-60"
        />
      </svg>
    </div>,

    <div
      key="graphite"
      className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-600 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
    </div>,
  ];

  return patterns[index % patterns.length];
}

export function FormsGrid({
  forms,
  selectedIds,
  onToggleSelect,
  onViewDetails,
  onRename,
  onArchive,
  onRestore,
  onTrash,
}: FormsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4 w-full min-w-0">
      {forms.map((form, index) => {
        const isSelected = selectedIds.has(form.id);
        const crop = form.coverImage?.transform?.crop;

        const objectPosition = crop
          ? `${Math.max(0, Math.min(100, crop.x + crop.width / 2))}% ${Math.max(0, Math.min(100, crop.y + crop.height / 2))}%`
          : "center";

        return (
          <div
            key={form.id}
            className={cn(
              "rounded-xl bg-white dark:bg-zinc-900/80 border transition-all flex flex-col justify-between relative group min-w-0 overflow-hidden shadow-2xs",
              isSelected
                ? "border-purple-600 ring-1 ring-purple-600/30"
                : "border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
          >
            {/* 1. Cover Image Top Half with Crop Preservation */}
            <div className="h-28 sm:h-32 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border-b border-zinc-100 dark:border-zinc-800/80">
              {form.coverAssetId ? (
                <img
                  src={`/api/v1/forms/${form.id}/assets/${form.coverAssetId}`}
                  alt=""
                  style={{ objectPosition }}
                  className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <FormlyNeutralCoverPlaceholder index={index} />
              )}

              {/* Selection Checkbox (Top-Left) */}
              <div
                className="absolute top-2.5 left-2.5 p-1 rounded-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center border border-black/5 dark:border-white/10 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(form.id)}
                  aria-label={`Select form ${form.title}`}
                  className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Status Badge (Top-Right) */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <FormStatusBadge status={form.status} />
              </div>
            </div>

            {/* 2. Middle: Title & Description */}
            <div className="p-3.5 space-y-1 min-w-0">
              <button
                type="button"
                onClick={() => onViewDetails(form)}
                className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400 text-left transition-colors w-full font-sans cursor-pointer"
                title={form.title}
              >
                {form.title}
              </button>
              <p
                className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 min-h-[30px] leading-relaxed break-words"
                title={form.description || "No description provided"}
              >
                {form.description || "No description provided"}
              </p>
            </div>

            {/* 3. Timestamps & Metrics */}
            <div className="px-3.5 py-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">
                    Updated {formatRelativeTime(form.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{formatDate(form.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <span>Responses:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {form.responsesCount !== null && form.responsesCount !== undefined
                      ? form.responsesCount
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Views:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {form.viewsCount !== null && form.viewsCount !== undefined
                      ? form.viewsCount
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Actions Footer */}
            <div className="px-3.5 pb-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onViewDetails(form)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline transition-colors cursor-pointer"
              >
                View details
              </button>

              <FormRowActions
                form={form}
                onViewDetails={onViewDetails}
                onRename={onRename}
                onArchive={onArchive}
                onRestore={onRestore}
                onTrash={onTrash}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
