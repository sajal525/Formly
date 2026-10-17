"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import {
  MoreVertical,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
  ChevronDown,
  Trash2,
} from "lucide-react";

interface FormRowActionsProps {
  form: MyFormItemDTO;
  onViewDetails: (form: MyFormItemDTO) => void;
  onRename: (form: MyFormItemDTO) => void;
  onArchive: (form: MyFormItemDTO) => void;
  onRestore: (form: MyFormItemDTO) => void;
  onTrash: (form: MyFormItemDTO) => void;
}

export function FormRowActions({
  form,
  onViewDetails,
  onRename,
  onArchive,
  onRestore,
  onTrash,
}: FormRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isArchived = form.status === "ARCHIVED";

  return (
    <div className="flex items-center justify-end gap-1.5" ref={menuRef}>
      {/* Primary Action Button: View Details */}
      <button
        type="button"
        onClick={() => onViewDetails(form)}
        className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        title="View form details"
      >
        <span>View</span>
      </button>

      {/* Overflow Menu Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="More options"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 dark:border-zinc-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
            <Link
              href={`/forms/${form.id}/edit`}
              prefetch={true}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold text-purple-600 dark:text-purple-400">Edit form</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetails(form);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onRename(form);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Rename</span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-white/5" />

            {isArchived ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onRestore(form);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore form</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onArchive(form);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive form</span>
              </button>
            )}

            <div className="my-1 border-t border-slate-100 dark:border-white/5" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onTrash(form);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move to trash</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
