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
        className="h-8 px-3 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
        title="View form details"
      >
        <span>View</span>
      </button>

      {/* Overflow Menu Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="More options"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
            <Link
              href={`/forms/${form.id}/edit`}
              prefetch={true}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-violet-600" />
              <span className="font-semibold text-violet-600 dark:text-violet-400">Edit form</span>
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
