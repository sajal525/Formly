"use client";

import React, { useState } from "react";
import { ThemeOverrides, PrimaryColorKey, FontPairKey, CardStyle, BackgroundMode } from "../schema";
import {
  PRIMARY_COLOR_SWATCHES,
  FONT_PAIR_OPTIONS,
  CARD_STYLE_OPTIONS,
} from "../tokens";
import { findThemePreset } from "../catalog";
import {
  SlidersHorizontal,
  RotateCcw,
  Palette,
  Type,
  ImageIcon,
  LayoutTemplate,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeCustomizationCardProps {
  themeKey: string;
  themeOverrides?: ThemeOverrides;
  onChangeOverrides: (updates: Partial<ThemeOverrides>) => void;
  onResetOverrides: () => void;
}

type CustomTab = "colors" | "fonts" | "background" | "header";

export function ThemeCustomizationCard({
  themeKey,
  themeOverrides,
  onChangeOverrides,
  onResetOverrides,
}: ThemeCustomizationCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<CustomTab>("colors");
  const preset = findThemePreset(themeKey);

  const hasOverrides =
    Boolean(themeOverrides?.primaryColorKey) ||
    Boolean(themeOverrides?.fontPairKey) ||
    Boolean(themeOverrides?.cardStyle && themeOverrides.cardStyle !== "default") ||
    Boolean(themeOverrides?.background?.mode && themeOverrides.background.mode !== "gradient") ||
    Boolean(themeOverrides?.header?.layout && themeOverrides.header.layout !== "left") ||
    Boolean(themeOverrides?.header?.height && themeOverrides.header.height !== "medium");

  const currentPrimary = themeOverrides?.primaryColorKey;
  const currentCardStyle = themeOverrides?.cardStyle || "default";
  const currentFontPair = themeOverrides?.fontPairKey || "sans";
  const currentBgMode = themeOverrides?.background?.mode || "gradient";
  const currentHeaderLayout = themeOverrides?.header?.layout || "left";
  const currentHeaderHeight = themeOverrides?.header?.height || "medium";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Theme Customization
          </h3>
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={onResetOverrides}
          disabled={!hasOverrides}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 outline-none",
            hasOverrides
              ? "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50"
              : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
          )}
          title="Reset overrides to theme defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset defaults</span>
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab("colors")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150",
            activeSubTab === "colors"
              ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Colors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("fonts")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150",
            activeSubTab === "fonts"
              ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Fonts</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("background")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150",
            activeSubTab === "background"
              ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Background</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("header")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150",
            activeSubTab === "header"
              ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Header</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 space-y-4">
        {/* COLORS TAB */}
        {activeSubTab === "colors" && (
          <div className="space-y-4">
            {/* Primary Accent Color Swatches */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Primary Accent Color
                </label>
                <span className="text-[11px] text-slate-400">
                  {currentPrimary
                    ? PRIMARY_COLOR_SWATCHES.find((s) => s.key === currentPrimary)?.label
                    : "Preset Default"}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="Primary accent color swatches"
                className="grid grid-cols-5 sm:grid-cols-9 gap-2"
              >
                {PRIMARY_COLOR_SWATCHES.map((swatch) => {
                  const isSelected = currentPrimary === swatch.key;
                  return (
                    <button
                      key={swatch.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={swatch.label}
                      title={swatch.label}
                      onClick={() =>
                        onChangeOverrides({ primaryColorKey: swatch.key })
                      }
                      style={{ backgroundColor: swatch.hex }}
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-150 outline-none",
                        "hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-600",
                        isSelected
                          ? "ring-2 ring-violet-600 ring-offset-2 scale-105 shadow-sm"
                          : "border border-black/10 dark:border-white/20"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Card Style */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Form Card Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CARD_STYLE_OPTIONS.map((cardOpt) => {
                  const isSelected = currentCardStyle === cardOpt.key;
                  return (
                    <button
                      key={cardOpt.key}
                      type="button"
                      onClick={() =>
                        onChangeOverrides({ cardStyle: cardOpt.key })
                      }
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all duration-150 outline-none",
                        "focus-visible:ring-2 focus-visible:ring-violet-600",
                        isSelected
                          ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{cardOpt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-violet-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {cardOpt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FONTS TAB */}
        {activeSubTab === "fonts" && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Typography Pairings
            </label>
            <div className="space-y-2">
              {FONT_PAIR_OPTIONS.map((font) => {
                const isSelected = currentFontPair === font.key;
                return (
                  <button
                    key={font.key}
                    type="button"
                    onClick={() =>
                      onChangeOverrides({ fontPairKey: font.key })
                    }
                    className={cn(
                      "w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all duration-150 outline-none",
                      "focus-visible:ring-2 focus-visible:ring-violet-600",
                      isSelected
                        ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold", font.headingFont)}>
                          {font.name}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {font.sampleText}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {font.description}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-violet-600 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeSubTab === "background" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Background Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChangeOverrides({
                      background: { mode: "solid" },
                    })
                  }
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-150 text-xs font-semibold",
                    currentBgMode === "solid"
                      ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  )}
                >
                  Solid Fill
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeOverrides({
                      background: { mode: "gradient" },
                    })
                  }
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-150 text-xs font-semibold",
                    currentBgMode === "gradient"
                      ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  )}
                >
                  Gradient
                </button>

                {/* Gated Image Option */}
                <div className="relative group">
                  <button
                    type="button"
                    disabled
                    className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-center text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1 opacity-70"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Image</span>
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-44 p-2 rounded-lg bg-slate-900 text-white text-[10px] text-center shadow-lg leading-tight pointer-events-none">
                    Image backgrounds require secure Cloudflare R2 storage (Coming soon)
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <span>
                Background gradients adapt dynamically to your active theme preset ({preset.name}).
              </span>
            </div>
          </div>
        )}

        {/* HEADER TAB */}
        {activeSubTab === "header" && (
          <div className="space-y-4">
            {/* Header Layout Alignment */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Title Alignment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChangeOverrides({
                      header: {
                        layout: "left",
                        height: currentHeaderHeight as any,
                      },
                    })
                  }
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-150 text-xs font-semibold",
                    currentHeaderLayout === "left"
                      ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  )}
                >
                  Left Aligned
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeOverrides({
                      header: {
                        layout: "centered",
                        height: currentHeaderHeight as any,
                      },
                    })
                  }
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-150 text-xs font-semibold",
                    currentHeaderLayout === "centered"
                      ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  )}
                >
                  Centered
                </button>
              </div>
            </div>

            {/* Header Spacing Height */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Header Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["compact", "medium", "spacious"] as const).map((h) => {
                  const isSelected = currentHeaderHeight === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        onChangeOverrides({
                          header: {
                            layout: currentHeaderLayout as any,
                            height: h,
                          },
                        })
                      }
                      className={cn(
                        "p-2 rounded-xl border text-center capitalize transition-all duration-150 text-xs font-semibold",
                        isSelected
                          ? "border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-1 ring-violet-600"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
