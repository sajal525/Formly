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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 space-y-5",
        className
      )}
    >
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
          Preferences // Appearance
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Appearance
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize how Formly looks for you.
        </p>
      </div>

      {/* Theme Mode Preview Tiles */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
          Theme Mode
        </span>
        <div className="grid grid-cols-3 gap-3">
          {/* Light Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "light")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-lg border transition-all text-center",
              settings.themeMode === "light"
                ? "border-[#563BFA] bg-[#563BFA]/5 text-[#563BFA] dark:text-[#a594fd]"
                : "border-[#E5E7EB] dark:border-[#27272A] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-[#181B20]"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-md bg-white border border-[#E5E7EB] p-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-1 border-b border-[#E5E7EB] pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA]" />
                <span className="w-8 h-1 rounded bg-neutral-300" />
              </div>
              <div className="flex gap-1 flex-1 pt-1">
                <div className="w-3 h-full rounded bg-neutral-100" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-2 rounded bg-neutral-100" />
                  <div className="w-3/4 h-2 rounded bg-neutral-100" />
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              Light
            </span>
          </button>

          {/* Dark Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "dark")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-lg border transition-all text-center",
              settings.themeMode === "dark"
                ? "border-[#563BFA] bg-[#563BFA]/5 text-[#563BFA] dark:text-[#a594fd]"
                : "border-[#E5E7EB] dark:border-[#27272A] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-[#181B20]"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-md bg-[#090A0B] border border-[#27272A] p-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-1 border-b border-[#27272A] pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA]" />
                <span className="w-8 h-1 rounded bg-neutral-700" />
              </div>
              <div className="flex gap-1 flex-1 pt-1">
                <div className="w-3 h-full rounded bg-[#181B20]" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-2 rounded bg-[#181B20]" />
                  <div className="w-3/4 h-2 rounded bg-[#181B20]" />
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              Dark
            </span>
          </button>

          {/* System Mode Tile */}
          <button
            type="button"
            onClick={() => onChange("themeMode", "system")}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-lg border transition-all text-center",
              settings.themeMode === "system"
                ? "border-[#563BFA] bg-[#563BFA]/5 text-[#563BFA] dark:text-[#a594fd]"
                : "border-[#E5E7EB] dark:border-[#27272A] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-[#181B20]"
            )}
          >
            {/* Visual Mini Mockup */}
            <div className="w-full h-14 rounded-md border border-[#E5E7EB] dark:border-[#27272A] p-0 flex overflow-hidden">
              <div className="w-1/2 h-full bg-white p-1 space-y-1 border-r border-[#E5E7EB]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA] block" />
                <span className="w-full h-2 rounded bg-neutral-100 block" />
              </div>
              <div className="w-1/2 h-full bg-[#090A0B] p-1 space-y-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA] block" />
                <span className="w-full h-2 rounded bg-[#181B20] block" />
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              System
            </span>
          </button>
        </div>
      </div>

      {/* Accent Color Swatches */}
      <div className="space-y-2 pt-3 border-t border-[#E5E7EB] dark:border-[#27272A]">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
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
                    ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-white dark:ring-offset-[#121417] scale-110"
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
