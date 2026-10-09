"use client";

import React from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { FORMLY_THEMES, FormlyTheme } from "../server/theme-registry";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  currentThemeKey: string;
  onThemeSelect: (themeKey: string) => void;
}

export function ThemePicker({
  currentThemeKey,
  onThemeSelect,
}: ThemePickerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Form Themes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how your form looks to respondents with curated, high-contrast accessible design palettes.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORMLY_THEMES.map((theme: FormlyTheme) => {
          const isSelected = currentThemeKey === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect(theme.id)}
              className={cn(
                "group text-left rounded-3xl p-5 border transition-all duration-200 relative flex flex-col justify-between overflow-hidden cursor-pointer",
                isSelected
                  ? "border-violet-600 dark:border-violet-500 ring-2 ring-violet-500/20 bg-white dark:bg-slate-900 shadow-md"
                  : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-sm"
              )}
            >
              {/* Top Banner Palette Preview */}
              <div
                className={cn(
                  "w-full h-24 rounded-2xl p-3 flex flex-col justify-between mb-4 bg-gradient-to-br transition-transform group-hover:scale-[1.02]",
                  theme.gradientClass
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/60 text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Swatches circles */}
                <div className="flex items-center gap-1.5">
                  {theme.previewColors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/60 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Theme Info */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{theme.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                      (Active)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
