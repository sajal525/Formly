"use client";

import React, { useState, useMemo } from "react";
import { FORMLY_THEME_CATALOG, THEME_CATEGORIES, ThemeCategory, FormlyThemePreset } from "../catalog";
import { ThemeCard } from "./theme-card";
import { Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeGalleryProps {
  selectedThemeKey: string;
  onSelectTheme: (themeKey: string) => void;
}

export function ThemeGallery({ selectedThemeKey, onSelectTheme }: ThemeGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("All");

  // Filter presets based on category
  const filteredPresets = useMemo(() => {
    if (selectedCategory === "All") {
      return FORMLY_THEME_CATALOG;
    }
    return FORMLY_THEME_CATALOG.filter((preset) => preset.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="w-full space-y-6">
      {/* Header section matching B2.png */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Choose a Theme
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Give your form a unique look with beautiful themes. You can customize colors, fonts and more.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div
        role="tablist"
        aria-label="Theme categories"
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        {THEME_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === "All"
              ? FORMLY_THEME_CATALOG.length
              : FORMLY_THEME_CATALOG.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-violet-600",
                isActive
                  ? "bg-violet-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isActive ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4-Column Desktop Grid matching B2.png */}
      <div
        role="radiogroup"
        aria-label="Available themes"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {filteredPresets.map((preset) => {
          const isSelected =
            selectedThemeKey === preset.id ||
            (preset.id === "soft-lavender" && selectedThemeKey === "minimal");

          return (
            <ThemeCard
              key={preset.id}
              preset={preset}
              isSelected={isSelected}
              onSelect={() => onSelectTheme(preset.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
