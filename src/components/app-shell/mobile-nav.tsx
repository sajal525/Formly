"use client";

import React from "react";
import { AppSidebar } from "./app-sidebar";
import { X } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[280px] max-w-[85%] h-full bg-white dark:bg-slate-900 shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <AppSidebar className="w-full h-full border-r-0" onNavigate={onClose} />
      </div>
    </div>
  );
}
