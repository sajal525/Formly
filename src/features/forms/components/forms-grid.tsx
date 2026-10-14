"use client";

import React from "react";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import { FormThumbnail } from "./form-thumbnail";
import { FormStatusBadge } from "./form-status-badge";
import { FormRowActions } from "./form-row-actions";
import { formatDate, formatDateTime, formatRelativeTime } from "../utils/formatters";
import { Clock, Calendar } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
      {forms.map((form) => {
        const isSelected = selectedIds.has(form.id);

        return (
          <div
            key={form.id}
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between gap-4 relative group min-w-0 overflow-hidden ${
              isSelected
                ? "border-[#563BFA] ring-2 ring-[#563BFA]/20 shadow-md"
                : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-md"
            }`}
          >
            {/* Top row: Checkbox, Thumbnail, Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(form.id)}
                  aria-label={`Select form ${form.title}`}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#563BFA] focus:ring-[#563BFA] accent-[#563BFA] cursor-pointer"
                />
                <FormThumbnail themeKey={form.themeKey} />
              </div>

              <FormStatusBadge status={form.status} />
            </div>

            {/* Middle: Title & Description */}
            <div className="space-y-1.5 min-w-0">
              <button
                type="button"
                onClick={() => onViewDetails(form)}
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 hover:text-[#563BFA] dark:hover:text-indigo-400 text-left transition-colors w-full"
                title={form.title}
              >
                {form.title}
              </button>
              <p
                className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed break-words"
                title={form.description || "No description provided"}
              >
                {form.description || "No description provided"}
              </p>
            </div>

            {/* Timestamps & Metrics */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    Updated {formatRelativeTime(form.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Created {formatDate(form.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-500">Responses:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {form.responsesCount !== null && form.responsesCount !== undefined ? form.responsesCount : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-500">Views:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {form.viewsCount !== null && form.viewsCount !== undefined ? form.viewsCount : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer: View details link on left, View button & three-dot actions menu on right */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onViewDetails(form)}
                className="text-xs font-semibold text-[#563BFA] dark:text-indigo-400 hover:underline transition-colors"
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
