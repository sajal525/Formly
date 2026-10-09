"use client";

import React from "react";
import {
  UserSettingsDTO,
  ThemeMode,
  AccentColor,
} from "../schemas/settings-schema";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppearanceSettingsCardProps {
  settings: UserSettingsDTO;
  onChange: <K extends keyof UserSettingsDTO>(key: K, value: UserSettingsDTO[K]) => void;
  className?: string;
}

export function AppearanceSettingsCard({
  settings,
  onChange,
  className,
}: AppearanceSettingsCardProps) {
  const accentColors: { key: AccentColor; label: string; hex: string }[] = [
    { key: "violet", label: "Violet", hex: "#8B5CF6" },
    { key: "blue", label: "Blue", hex: "#3B82F6" },
    { key: "pink", label: "Pink", hex: "#EC4899" },
    { key: "red", label: "Red", hex: "#EF4444" },
    { key: "orange", label: "Orange", hex: "#F97316" },
    { key: "green", label: "Green", hex: "#10B981" },
    { key: "teal", label: "Teal", hex: "#14B8A6" },
    { key: "slate", label: "Slate", hex: "#64748B" },
  ];

  return (
    <div
      id="appearance-section"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize how Formly looks for you.
        </p>
      </div>

      {/* Theme Mode Preview Tiles */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
          Theme Mode
        </span>
        <div className="grid grid-cols-3 gap-3">
          {/* Light Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "light")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all text-center",
              settings.themeMode === "light"
                ? "border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/20 dark:bg-violet-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-lg bg-slate-100 border border-slate-200/70 p-1 flex flex-col justify-between overflow-hidden shadow-2xs">
              <div className="flex items-center gap-1 border-b border-slate-200/60 pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="w-8 h-1 rounded bg-slate-300" />
              </div>
              <div className="flex gap-1 flex-1 pt-1">
                <div className="w-3 h-full rounded bg-slate-200/80" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-2 rounded bg-white" />
                  <div className="w-3/4 h-2 rounded bg-white" />
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Light
            </span>
          </button>

          {/* Dark Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "dark")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all text-center",
              settings.themeMode === "dark"
                ? "border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/20 dark:bg-violet-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-lg bg-slate-900 border border-slate-800 p-1 flex flex-col justify-between overflow-hidden shadow-2xs">
              <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="w-8 h-1 rounded bg-slate-700" />
              </div>
              <div className="flex gap-1 flex-1 pt-1">
                <div className="w-3 h-full rounded bg-slate-800" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-2 rounded bg-slate-800/90" />
                  <div className="w-3/4 h-2 rounded bg-slate-800/90" />
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Dark
            </span>
          </button>

          {/* System Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "system")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all text-center",
              settings.themeMode === "system"
                ? "border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/20 dark:bg-violet-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700 p-1 flex overflow-hidden shadow-2xs">
              <div className="w-1/2 h-full bg-slate-100 p-0.5 space-y-1 border-r border-slate-200">
                <span className="w-1 h-1 rounded-full bg-violet-500 block" />
                <span className="w-full h-2 rounded bg-white block" />
              </div>
              <div className="w-1/2 h-full bg-slate-900 p-0.5 space-y-1">
                <span className="w-1 h-1 rounded-full bg-violet-400 block" />
                <span className="w-full h-2 rounded bg-slate-800 block" />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              System
            </span>
          </button>
        </div>
      </div>

      {/* Accent Color Swatches */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
          Accent Color
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {accentColors.map((color) => {
            const isSelected = settings.accentColor === color.key;
            return (
              <button
                key={color.key}
                type="button"
                onClick={() => onChange("accentColor", color.key)}
                title={color.label}
                aria-label={`Select ${color.label} accent color`}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all focus:outline-none relative",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110"
                    : "hover:scale-105 opacity-90 hover:opacity-100"
                )}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
