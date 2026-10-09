"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, ChevronDown, FilePlus, Sparkles, LayoutGrid } from "lucide-react";

interface WelcomeHeaderProps {
  displayName: string;
  onCreateClick: () => void;
}

export function WelcomeHeader({ displayName, onCreateClick }: WelcomeHeaderProps) {
  const [greeting, setGreeting] = useState("Good day");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>{greeting},</span>{" "}
          <span className="bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-[#BD45E8] bg-clip-text text-transparent">
            {displayName}
          </span>
          <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform">
            👋
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create, share and collect responses with Formly.
        </p>
      </div>

      {/* Create Form Action */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <div className="inline-flex items-center rounded-2xl bg-gradient-to-r from-[#5938F5] to-[#7B52F8] shadow-md shadow-indigo-500/25 p-0.5">
          <button
            type="button"
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
          <div className="w-[1px] h-5 bg-white/20" />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2.5 py-2.5 text-white/80 hover:text-white transition-colors"
            aria-label="More creation options"
            aria-expanded={isDropdownOpen}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                onCreateClick();
              }}
              className="w-full px-4 py-2.5 text-left text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors font-medium"
            >
              <div className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#563BFA] flex items-center justify-center">
                <FilePlus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Blank Form
                </div>
                <div className="text-[10px] text-slate-400">
                  Start from scratch
                </div>
              </div>
            </button>

            <div
              className="w-full px-4 py-2.5 text-left text-xs text-slate-400 flex items-center justify-between cursor-not-allowed opacity-60"
              title="Coming soon"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Import with AI
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Paste text or file
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                Soon
              </span>
            </div>

            <Link
              href="/templates"
              onClick={() => setIsDropdownOpen(false)}
              className="w-full px-4 py-2.5 text-left text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Use Template
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Choose 50+ designs
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold">
                Active
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
