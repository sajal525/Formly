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
    <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 overflow-y-auto space-y-6 select-none transition-colors">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Preview Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          See how your form will look to respondents.
        </p>
      </div>

      {/* 1. Device Preview Selector Cards */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
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
                  "p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                  isSelected
                    ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-bold shadow-xs ring-1 ring-violet-500/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 mb-1.5 transition-colors",
                    isSelected
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )}
                />
                <span className="text-[11px] leading-tight font-semibold block">
                  {meta.label}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  ({meta.dimensions.replace(" CSS pixels", "")})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Preview Options Switches */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Preview Options</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
              Preview only
            </span>
          </label>
          <button
            type="button"
            onClick={onResetOptions}
            className="text-[10px] text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1 hover:underline cursor-pointer"
            title="Reset options to actual form settings"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
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
                  ? "bg-violet-600"
                  : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  displayOptions.showProgressIndicator ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Switch 2: Show question numbers */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 min-w-0">
              <ListOrdered className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
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
                  ? "bg-violet-600"
                  : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  displayOptions.showQuestionNumbers ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Switch 3: Show required indicator (*) */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
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
                  ? "bg-violet-600"
                  : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
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
            className="text-[11px] text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Edit permanent form settings &rarr;
          </button>
        </div>
      </div>

      {/* 3. Preview Theme Card */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Preview Theme
        </label>
        <button
          type="button"
          onClick={() => onTabChange("theme")}
          className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail swatch */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-white/20"
              style={{
                backgroundColor: currentTheme.solidBgColor,
                backgroundImage: currentTheme.previewColors
                  ? `linear-gradient(135deg, ${currentTheme.previewColors[0]}, ${currentTheme.previewColors[1]})`
                  : undefined,
              }}
            >
              <Sparkles className="w-4 h-4 text-white drop-shadow-xs" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {currentTheme.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                {currentTheme.description}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
        </button>
      </div>

      {/* 4. Share Preview Link */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Share Preview Link
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          Open this link to preview your form in a new tab.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={previewUrl}
            className="flex-1 h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 select-all focus:outline-none truncate font-mono"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="h-9 px-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1.5 shrink-0 shadow-xs"
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

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
          <Lock className="w-3 h-3 shrink-0" />
          <span>Private preview for owner. Submissions are simulated.</span>
        </div>
      </div>
    </aside>
  );
}
