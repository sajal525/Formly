"use client";

import React, { useState, useRef, useEffect } from "react";
import { TrashItemDTO } from "../server/get-trash-page";
import {
  RotateCcw,
  Trash2,
  MoreVertical,
  Clock,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrashTableProps {
  items: TrashItemDTO[];
  selectedIds: Set<string>;
  activeItem: TrashItemDTO | null;
  onSelectItem: (item: TrashItemDTO) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRestore: (item: TrashItemDTO) => void;
  onPermanentDelete: (item: TrashItemDTO) => void;
}

export function TrashTable({
  items,
  selectedIds,
  activeItem,
  onSelectItem,
  onToggleSelect,
  onToggleSelectAll,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  const allVisibleSelected =
    items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someVisibleSelected =
    items.some((i) => selectedIds.has(i.id)) && !allVisibleSelected;

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Your Trash is empty
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Forms you move to Trash will appear here for 30 days before being permanently removed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold select-none">
            <tr>
              <th className="py-3 px-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someVisibleSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all forms on this page"
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  Name
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </span>
              </th>
              <th className="py-3 px-3 w-24">Type</th>
              <th className="py-3 px-3 w-40">
                <span className="flex items-center gap-1.5">
                  Deleted On
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </span>
              </th>
              <th className="py-3 px-3 w-32">
                <span className="flex items-center gap-1.5">
                  Days Left
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </span>
              </th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isActive = activeItem?.id === item.id;

              const formattedDeleted = new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(item.deletedAt));

              return (
                <TrashTableRow
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  isActive={isActive}
                  formattedDeleted={formattedDeleted}
                  onRowClick={() => onSelectItem(item)}
                  onToggleSelect={() => onToggleSelect(item.id)}
                  onRestore={() => onRestore(item)}
                  onPermanentDelete={() => onPermanentDelete(item)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TrashTableRowProps {
  item: TrashItemDTO;
  isSelected: boolean;
  isActive: boolean;
  formattedDeleted: string;
  onRowClick: () => void;
  onToggleSelect: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

function TrashTableRow({
  item,
  isSelected,
  isActive,
  formattedDeleted,
  onRowClick,
  onToggleSelect,
  onRestore,
  onPermanentDelete,
}: TrashTableRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <tr
      onClick={onRowClick}
      className={cn(
        "group cursor-pointer transition-colors",
        isActive
          ? "bg-violet-50/40 dark:bg-violet-950/20"
          : isSelected
          ? "bg-slate-50/70 dark:bg-slate-800/40"
          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      )}
    >
      {/* Checkbox */}
      <td
        className="py-3 px-3.5"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          aria-label={`Select ${item.title}`}
          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4 cursor-pointer"
        />
      </td>

      {/* Name Column */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail preview */}
          <div className="w-12 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
            <FileText className="w-4 h-4 text-[#563BFA] dark:text-violet-400" />
            <div className="absolute inset-x-1 bottom-1 h-1 bg-indigo-200/60 dark:bg-indigo-700/60 rounded-xs" />
          </div>

          {/* Title & Description */}
          <div className="min-w-0 max-w-xs sm:max-w-sm">
            <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {item.title}
            </div>
            {item.description ? (
              <div className="text-[11px] text-slate-400 truncate">
                {item.description}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">No description</div>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-3">
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-[#563BFA] dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
          Form
        </span>
      </td>

      {/* Deleted On */}
      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formattedDeleted}
      </td>

      {/* Days Left */}
      <td className="py-3 px-3 whitespace-nowrap">
        {item.isExpired ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
            <AlertTriangle className="w-3 h-3" />
            Expired
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              item.daysLeft <= 7
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40"
                : "bg-rose-50/70 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40"
            )}
          >
            <Clock className="w-3 h-3" />
            {item.daysLeft} days
          </span>
        )}
      </td>

      {/* Actions */}
      <td
        className="py-3 px-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1" ref={menuRef}>
          {/* Restore Icon Button */}
          <button
            type="button"
            onClick={onRestore}
            title="Restore form"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Delete Permanently Icon Button */}
          <button
            type="button"
            onClick={onPermanentDelete}
            title="Delete permanently"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRowClick();
                  }}
                  className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>View details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRestore();
                  }}
                  className="w-full px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore form</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onPermanentDelete();
                  }}
                  className="w-full px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete permanently</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
