"use client";

import React, { useState, useEffect } from "react";
import { BuilderFormDefinition } from "../../schemas/builder-definition-schema";
import { DevicePreset, PreviewDisplayOptions, DEVICE_PRESETS } from "./preview-options-types";
import { findThemePreset } from "@/features/forms/themes/catalog";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sliders,
  ListOrdered,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewSettingsRailProps {
  formId: string;
  definition: BuilderFormDefinition;
  devicePreset: DevicePreset;
  onDeviceChange: (preset: DevicePreset) => void;
  displayOptions: PreviewDisplayOptions;
  onOptionsChange: (updates: Partial<PreviewDisplayOptions>) => void;
  onResetOptions: () => void;
  onTabChange: (tab: "questions" | "theme" | "settings" | "preview") => void;
}

export function PreviewSettingsRail({
  formId,
  definition,
  devicePreset,
  onDeviceChange,
  displayOptions,
  onOptionsChange,
  onResetOptions,
  onTabChange,
}: PreviewSettingsRailProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const previewUrl = `${origin}/forms/${formId}/preview`;
  const currentTheme = findThemePreset(definition.themeKey);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] p-5 sm:p-6 overflow-y-auto space-y-6 select-none transition-colors">
      {/* Top Header */}
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Preview Settings
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          See how your form will look to respondents.
        </p>
      </div>

      {/* 1. Device Preview Selector Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Device Preview
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["desktop", "tablet", "mobile"] as DevicePreset[]).map((presetKey) => {
            const meta = DEVICE_PRESETS[presetKey];
            const isSelected = devicePreset === presetKey;
            const Icon =
              presetKey === "desktop"
                ? Monitor
                : presetKey === "tablet"
                ? Tablet
                : Smartphone;

            return (
              <button
                key={presetKey}
                type="button"
                onClick={() => onDeviceChange(presetKey)}
                className={cn(
                  "p-2.5 rounded-lg border flex flex-col items-center justify-center text-center transition-colors cursor-pointer group",
                  isSelected
                    ? "border-[#563BFA] bg-violet-50/50 dark:bg-violet-950/20 text-[#563BFA] dark:text-violet-300 font-medium"
                    : "border-[#E5E7EB] dark:border-[#27272A] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-[#181B20]/40 text-zinc-600 dark:text-zinc-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 mb-1.5 transition-colors",
                    isSelected
                      ? "text-[#563BFA] dark:text-violet-400"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  )}
                />
                <span className="text-[11px] leading-tight font-medium block">
                  {meta.label}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block mt-0.5">
                  ({meta.dimensions.replace(" CSS pixels", "")})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Preview Options Switches */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span>Preview Options</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
              PREVIEW ONLY
            </span>
          </label>
          <button
            type="button"
            onClick={onResetOptions}
            className="text-[11px] text-[#563BFA] hover:text-[#4830D9] dark:text-violet-400 flex items-center gap-1 cursor-pointer font-mono"
            title="Reset options to actual form settings"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-2.5 bg-zinc-50/70 dark:bg-[#181B20]/40 p-3 rounded-lg border border-[#E5E7EB] dark:border-[#27272A]">
          {/* Switch 1: Show progress indicator */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                Show progress indicator
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={displayOptions.showProgressIndicator}
              onClick={() =>
                onOptionsChange({
                  showProgressIndicator: !displayOptions.showProgressIndicator,
                })
              }
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                displayOptions.showProgressIndicator
                  ? "bg-[#563BFA]"
                  : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  displayOptions.showProgressIndicator ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Switch 2: Show question numbers */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB] dark:border-[#27272A]">
            <div className="flex items-center gap-2 min-w-0">
              <ListOrdered className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate">
                Show question numbers
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={displayOptions.showQuestionNumbers}
              onClick={() =>
                onOptionsChange({
                  showQuestionNumbers: !displayOptions.showQuestionNumbers,
                })
              }
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                displayOptions.showQuestionNumbers
                  ? "bg-[#563BFA]"
                  : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  displayOptions.showQuestionNumbers ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Switch 3: Show required indicator (*) */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB] dark:border-[#27272A]">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate">
                Show required indicator (*)
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={displayOptions.showRequiredIndicator}
              onClick={() =>
                onOptionsChange({
                  showRequiredIndicator: !displayOptions.showRequiredIndicator,
                })
              }
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                displayOptions.showRequiredIndicator
                  ? "bg-[#563BFA]"
                  : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  displayOptions.showRequiredIndicator ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className="text-[11px] text-zinc-500 hover:text-[#563BFA] dark:hover:text-violet-400 transition-colors font-mono cursor-pointer"
          >
            Edit permanent form settings &rarr;
          </button>
        </div>
      </div>

      {/* 3. Preview Theme Card */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Preview Theme
        </label>
        <button
          type="button"
          onClick={() => onTabChange("theme")}
          className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-[#181B20]/40 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail swatch */}
            {currentTheme.id === "nothing" ? (
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border border-neutral-300 bg-white [background-image:radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:4px_4px] relative overflow-hidden">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <div className="w-4 h-4 rounded-tl-full bg-neutral-950 absolute -bottom-1 -right-1" />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border border-white/20"
                style={{
                  backgroundColor: currentTheme.solidBgColor,
                  backgroundImage: currentTheme.previewColors
                    ? `linear-gradient(135deg, ${currentTheme.previewColors[0]}, ${currentTheme.previewColors[1]})`
                    : undefined,
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                {currentTheme.name}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                {currentTheme.description}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
        </button>
      </div>

      {/* 4. Share Preview Link */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Share Preview Link
        </label>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Open this link to preview your form in a new tab.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={previewUrl}
            className="flex-1 h-8 px-2.5 rounded-lg bg-zinc-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs text-zinc-700 dark:text-zinc-300 select-all focus:outline-none truncate font-mono"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 rounded-lg bg-[#563BFA] hover:bg-[#4830D9] text-white text-xs font-mono font-medium gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 pt-0.5 font-mono">
          <Lock className="w-3 h-3 shrink-0" />
          <span>Private preview for owner. Submissions are simulated.</span>
        </div>
      </div>
    </aside>
  );
}
