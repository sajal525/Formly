"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  FileText,
  LayoutGrid,
  Sparkles,
  Upload,
} from "lucide-react";

interface MyFormsHeaderProps {
  onCreateBlankClick: () => void;
}

export function MyFormsHeader({ onCreateBlankClick }: MyFormsHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white">
          My Forms
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create, manage and track all your forms.
        </p>
      </div>

      {/* Create Form Dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="h-10 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-[#563BFA] to-[#7B52F8] hover:from-[#492de0] hover:to-[#6c40e5] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
        >
          <Plus className="w-4 h-4" />
          <span>Create Form</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
            {/* Active Blank Form option */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                onCreateBlankClick();
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-[#EEF0FF] dark:hover:bg-indigo-950/60 hover:text-[#563BFA] dark:hover:text-indigo-400 flex items-center gap-3 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center text-[#563BFA] dark:text-indigo-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="leading-tight">Blank Form</p>
                <p className="text-[10px] text-slate-400 font-normal">
                  Start with a new empty draft
                </p>
              </div>
            </button>

            <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />

            {/* Deferred Template option */}
            <div
              className="w-full px-4 py-2 text-left text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center justify-between opacity-70"
              title="Templates coming soon"
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <span>From Template</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                Soon
              </span>
            </div>

            {/* Deferred AI option */}
            <div
              className="w-full px-4 py-2 text-left text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center justify-between opacity-70"
              title="AI generator coming soon"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>AI Generator</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                Soon
              </span>
            </div>

            {/* Deferred Import option */}
            <div
              className="w-full px-4 py-2 text-left text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center justify-between opacity-70"
              title="Import coming soon"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Import Form</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                Soon
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
