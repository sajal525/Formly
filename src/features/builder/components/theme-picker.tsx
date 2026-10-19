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
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-5">
      {/* Intro Header */}
      <div className="bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#563BFA]/10 text-[#563BFA] dark:text-[#a594fd] flex items-center justify-center shrink-0">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Form Themes
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Customize how your form looks to respondents with curated, high-contrast accessible design palettes.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {FORMLY_THEMES.map((theme: FormlyTheme) => {
          const isSelected = currentThemeKey === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect(theme.id)}
              className={cn(
                "group text-left rounded-xl p-4 border transition-all relative flex flex-col justify-between overflow-hidden cursor-pointer shadow-2xs",
                isSelected
                  ? "border-[#563BFA] ring-2 ring-[#563BFA]/20 bg-white dark:bg-[#121417]"
                  : "border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:border-neutral-300 dark:hover:border-neutral-700"
              )}
            >
              {/* Top Banner Palette Preview */}
              <div
                className={cn(
                  "w-full h-20 rounded-lg p-2.5 flex flex-col justify-between mb-3 bg-gradient-to-br transition-transform group-hover:scale-[1.01]",
                  theme.gradientClass
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/70 text-neutral-800 dark:text-neutral-200 shadow-2xs backdrop-blur-xs">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#563BFA] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Swatches circles */}
                <div className="flex items-center gap-1.5">
                  {theme.previewColors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/60 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Theme Info */}
              <div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>{theme.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-semibold text-[#563BFA] dark:text-[#a594fd]">
                      (Active)
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
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
