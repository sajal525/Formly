"use client";

import React from "react";
import { FormlyThemePreset } from "../catalog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeCardProps {
  preset: FormlyThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ preset, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${preset.name} theme, ${preset.category} category. ${preset.description}`}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col w-full text-left rounded-2xl border transition-all duration-200 outline-none overflow-hidden",
        "hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2",
        isSelected
          ? "border-violet-600 ring-2 ring-violet-600/30 shadow-md bg-white dark:bg-slate-900"
          : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Miniature Visual Preview Canvas */}
      <div
        className={cn(
          "relative h-32 w-full p-3.5 flex flex-col justify-between overflow-hidden bg-gradient-to-br",
          preset.gradientClass
        )}
      >
        {/* Subtle decorative pattern element */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          {preset.decorativeStyle === "floral" && (
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border-4 border-pink-400/40" />
          )}
          {preset.decorativeStyle === "tech" && (
            <div className="absolute right-2 top-2 font-mono text-[9px] text-cyan-300/40 select-none">
              // 01010
            </div>
          )}
          {preset.decorativeStyle === "space" && (
            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-indigo-200 shadow-sm shadow-indigo-300" />
          )}
          {preset.decorativeStyle === "royal" && (
            <div className="absolute right-2 bottom-2 w-12 h-12 rotate-45 border border-amber-400/30" />
          )}
        </div>

        {/* Top bar of miniature: Mock Form Title + Category Badge */}
        <div className="flex items-center justify-between gap-1 z-10">
          <div className="h-2 w-14 rounded-full bg-current opacity-30" />
          <span
            className={cn(
              "text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs",
              preset.badgeClass
            )}
          >
            {preset.category}
          </span>
        </div>

        {/* Miniature Question Card Container */}
        <div
          className={cn(
            "p-2 rounded-lg border shadow-xs z-10 transition-transform duration-200 group-hover:scale-[1.02]",
            preset.cardClass
          )}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: preset.accentColor }}
            />
            <div className="h-1.5 w-20 rounded bg-current opacity-30" />
          </div>
          {/* Simulated input bar */}
          <div className="h-3 w-full rounded border border-current/10 bg-current/5 flex items-center px-1">
            <div className="h-1 w-10 rounded bg-current opacity-20" />
          </div>
        </div>

        {/* Color Palette Dots (Bottom Right of miniature) */}
        <div className="flex items-center gap-1 z-10 self-end">
          {preset.previewColors.map((color, idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Selected Checkmark Badge */}
        {isSelected && (
          <div className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md animate-in fade-in zoom-in-75">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {preset.name}
            </h4>
            {isSelected && (
              <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {preset.description}
          </p>
        </div>
      </div>
    </button>
  );
}
