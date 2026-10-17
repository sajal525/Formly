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
      <div className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-12 text-center">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Your Trash is empty
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-mono">
          Forms you move to Trash will appear here for 30 days before being permanently removed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-neutral-50/70 dark:bg-[#181B20]/40 border-b border-[#E5E7EB] dark:border-[#27272A] text-neutral-500 dark:text-neutral-400 font-mono text-[10px] uppercase tracking-wider select-none">
            <tr>
              <th className="py-2.5 px-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someVisibleSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all forms on this page"
                  className="rounded border-[#E5E7EB] dark:border-[#27272A] text-[#563BFA] focus:ring-[#563BFA] h-3.5 w-3.5 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 font-semibold text-neutral-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  Name
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </span>
              </th>
              <th className="py-2.5 px-3 w-20">Type</th>
              <th className="py-2.5 px-3 w-40">
                <span className="flex items-center gap-1.5">
                  Deleted On
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </span>
              </th>
              <th className="py-2.5 px-3 w-32">
                <span className="flex items-center gap-1.5">
                  Days Left
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </span>
              </th>
              <th className="py-2.5 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#27272A]">
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
          ? "bg-[#563BFA]/5 dark:bg-[#563BFA]/10"
          : isSelected
          ? "bg-neutral-100/70 dark:bg-[#181B20]/60"
          : "hover:bg-neutral-50/70 dark:hover:bg-[#181B20]/40"
      )}
    >
      {/* Checkbox */}
      <td
        className="py-2.5 px-3.5"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          aria-label={`Select ${item.title}`}
          className="rounded border-[#E5E7EB] dark:border-[#27272A] text-[#563BFA] focus:ring-[#563BFA] h-3.5 w-3.5 cursor-pointer"
        />
      </td>

      {/* Name Column */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2.5">
          {/* Thumbnail preview */}
          <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 overflow-hidden">
            <FileText className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          </div>

          {/* Title & Description */}
          <div className="min-w-0 max-w-xs sm:max-w-sm">
            <div className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-[#563BFA] dark:group-hover:text-[#a594fd] transition-colors">
              {item.title}
            </div>
            {item.description ? (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {item.description}
              </div>
            ) : (
              <div className="text-[11px] text-neutral-400 italic">No description</div>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-2.5 px-3">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 dark:bg-[#181B20] dark:text-neutral-400 border border-[#E5E7EB] dark:border-[#27272A]">
          Form
        </span>
      </td>

      {/* Deleted On */}
      <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap font-mono text-[11px]">
        {formattedDeleted}
      </td>

      {/* Days Left */}
      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
        {item.isExpired ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            <AlertTriangle className="w-3 h-3" />
            Expired
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border",
              item.daysLeft <= 7
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                : "bg-neutral-100 text-neutral-600 dark:bg-[#181B20] dark:text-neutral-400 border-[#E5E7EB] dark:border-[#27272A]"
            )}
          >
            <Clock className="w-3 h-3" />
            {item.daysLeft}d left
          </span>
        )}
      </td>

      {/* Actions */}
      <td
        className="py-2.5 px-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1" ref={menuRef}>
          {/* Restore Icon Button */}
          <button
            type="button"
            onClick={onRestore}
            title="Restore form"
            className="w-6 h-6 rounded bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Delete Permanently Icon Button */}
          <button
            type="button"
            onClick={onPermanentDelete}
            title="Delete permanently"
            className="w-6 h-6 rounded bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 rounded bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#121417] rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#27272A] py-1 z-40 text-left font-mono animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRowClick();
                  }}
                  className="w-full px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#181B20] flex items-center gap-1.5"
                >
                  <Eye className="w-3 h-3 text-neutral-400" />
                  <span>Inspect</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRestore();
                  }}
                  className="w-full px-2.5 py-1 text-xs text-[#563BFA] dark:text-[#a594fd] hover:bg-[#563BFA]/10 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
                <div className="my-1 border-t border-[#E5E7EB] dark:border-[#27272A]" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onPermanentDelete();
                  }}
                  className="w-full px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Purge</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
