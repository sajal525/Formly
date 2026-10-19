"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, ChevronDown, FileText, Sparkles, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeHeaderProps {
  displayName?: string;
  username?: string;
  onCreateClick: () => void;
  onBlankFormDirect?: () => void;
}

export function WelcomeHeader({
  displayName,
  username,
  onCreateClick,
  onBlankFormDirect,
}: WelcomeHeaderProps) {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const effectiveName = username || displayName || "Creator";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pt-1 pb-1">
      {/* Left: Minimal TUI-Inspired Welcome Banner */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase font-medium">
          W E L C O M E &nbsp; B a c k ,
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
          {effectiveName}
        </h1>
        <div className="text-[10px] font-mono tracking-[0.22em] text-zinc-400 dark:text-zinc-500 uppercase">
          C R E A T E &nbsp; · &nbsp; C O L L E C T &nbsp; · &nbsp; A N A L Y Z E
        </div>
      </div>

      {/* Right: Sleek Consolidated Create Form Action */}
      <div className="relative self-start sm:self-center shrink-0" ref={dropdownRef}>
        <div className="inline-flex items-center rounded-xl bg-[#563BFA] hover:bg-[#4830d9] text-white transition-colors shadow-2xs">
          <button
            type="button"
            onClick={onBlankFormDirect || onCreateClick}
            className="flex items-center gap-2 pl-3.5 pr-2.5 py-2 text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
            aria-label="Create new form"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Form</span>
          </button>
          <div className="w-[1px] h-4 bg-white/25" />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2 py-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="More creation choices"
            aria-expanded={isDropdownOpen}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdown menu preserving all 3 options */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 dark:border-zinc-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            {/* 1. Blank Form (Functional) */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                if (onBlankFormDirect) {
                  onBlankFormDirect();
                } else {
                  onCreateClick();
                }
              }}
              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/70 flex items-center gap-3 transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60 group-hover:text-purple-600 transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>Blank Form</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono">
                    Active
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  Start from scratch
                </div>
              </div>
            </button>

            {/* 2. Import with AI (Preserved Coming Soon) */}
            <div
              className="w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-3 opacity-60 cursor-not-allowed select-none"
              title="Coming soon"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                  <span>Import with AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                    Soon
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  Paste Formly format or text
                </div>
              </div>
            </div>

            {/* 3. Upload File (Preserved Coming Soon) */}
            <div
              className="w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-3 opacity-60 cursor-not-allowed select-none"
              title="Coming soon"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                <UploadCloud className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                  <span>Upload File</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                    Soon
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  Import .formly or .txt file
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
