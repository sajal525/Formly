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
  const isNothing = preset.id === "nothing";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${preset.name} theme, ${preset.badgeLabel || preset.category} category. ${preset.description}`}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col w-full text-left rounded-2xl border transition-all duration-200 outline-none overflow-hidden",
        "hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2",
        isSelected
          ? isNothing
            ? "border-neutral-900 ring-2 ring-neutral-900/20 shadow-md bg-white dark:bg-slate-900"
            : "border-violet-600 ring-2 ring-violet-600/30 shadow-md bg-white dark:bg-slate-900"
          : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Miniature Visual Preview Canvas */}
      {isNothing ? (
        <div className="relative h-34 w-full p-3.5 flex flex-col justify-between overflow-hidden bg-white text-neutral-900 [background-image:radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:8px_8px] border-b border-slate-100 dark:border-slate-800">
          {/* Subtle curved arc in top right */}
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full border border-slate-300/80 pointer-events-none" />

          {/* Quarter circle dark shape with dot grid in bottom-left */}
          <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-neutral-950 rounded-tr-full pointer-events-none overflow-hidden p-1.5">
            <div className="w-full h-full [background-image:radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:4px_4px]" />
          </div>
          <div className="absolute bottom-1 left-11 w-6 h-6 [background-image:radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none" />

          {/* Top bar: Check circle + bars + Tech badge */}
          <div className="flex items-center justify-between gap-1 z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div className="h-1.5 w-6 rounded-full bg-neutral-950" />
              <div className="h-1.5 w-5 rounded-full bg-neutral-300" />
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-900 text-neutral-900 bg-white/95 shadow-2xs">
              Tech
            </span>
          </div>

          {/* Miniature Question Card Container */}
          <div className="p-2 rounded-lg border border-neutral-900 bg-white shadow-2xs z-10 transition-transform duration-200 group-hover:scale-[1.02] space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <div className="h-1.5 w-20 rounded bg-neutral-950" />
            </div>
            <div className="h-2.5 w-full rounded border border-neutral-300 bg-neutral-50/50" />
            <div className="h-2.5 w-full rounded border border-neutral-300 bg-neutral-50/50" />
          </div>

          {/* Color Palette Dots (Red, Gray, Outline) */}
          <div className="flex items-center gap-1 z-10 self-end">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full border border-neutral-400 bg-white shadow-2xs" />
          </div>
        </div>
      ) : (
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
              {preset.badgeLabel || preset.category}
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
      )}

      {/* Card Info Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {preset.name}
            </h4>
            {isSelected && (
              isNothing ? (
                <span className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200/60 shrink-0">
                  Active
                </span>
              ) : (
                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 shrink-0">
                  Active
                </span>
              )
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
