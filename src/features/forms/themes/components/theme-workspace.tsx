"use client";

import React, { useState } from "react";
import { BuilderFormDefinition } from "@/features/builder/schemas/builder-definition-schema";
import { ThemeOverrides } from "../schema";
import { ThemeGallery } from "./theme-gallery";
import { ThemePreviewCard } from "./theme-preview-card";
import { ThemeCustomizationCard } from "./theme-customization-card";
import { Palette, Eye, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeWorkspaceProps {
  definition: BuilderFormDefinition;
  onThemeSelect: (themeKey: string) => void;
  onThemeOverridesChange: (updates: Partial<ThemeOverrides>) => void;
  onResetOverrides: () => void;
}

export function ThemeWorkspace({
  definition,
  onThemeSelect,
  onThemeOverridesChange,
  onResetOverrides,
}: ThemeWorkspaceProps) {
  // Mobile / narrow screen view switch (Themes vs Preview & Customize)
  const [mobileTab, setMobileTab] = useState<"gallery" | "customize">("gallery");

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Mobile viewport switcher */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl mb-4 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setMobileTab("gallery")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "gallery"
              ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Themes</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("customize")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "customize"
              ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Preview & Customize</span>
        </button>
      </div>

      {/* Main split workspace */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8 min-w-0">
        {/* Left / Center Gallery */}
        <div
          className={cn(
            "flex-1 min-w-0 w-full",
            mobileTab !== "gallery" && "hidden lg:block"
          )}
        >
          <ThemeGallery
            selectedThemeKey={definition.themeKey}
            onSelectTheme={onThemeSelect}
          />
        </div>

        {/* Right Rail: Theme Preview + Customization */}
        <div
          className={cn(
            "w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-5 sticky top-0",
            mobileTab !== "customize" && "hidden lg:block"
          )}
        >
          {/* Card 1: Live Theme Preview */}
          <ThemePreviewCard
            definition={definition}
            themeKey={definition.themeKey}
            themeOverrides={definition.themeOverrides}
          />

          {/* Card 2: Theme Customization Controls */}
          <ThemeCustomizationCard
            themeKey={definition.themeKey}
            themeOverrides={definition.themeOverrides}
            onChangeOverrides={onThemeOverridesChange}
            onResetOverrides={onResetOverrides}
          />
        </div>
      </div>
    </div>
  );
}
