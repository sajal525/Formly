"use client";

import React from "react";
import { BuilderFormDefinition } from "../../schemas/builder-definition-schema";
import { DevicePreset, PreviewDisplayOptions, DEVICE_PRESETS } from "./preview-options-types";
import { RespondentFormCanvas } from "./respondent-form-canvas";
import { cn } from "@/lib/utils";

interface PreviewDeviceCanvasProps {
  definition: BuilderFormDefinition;
  devicePreset: DevicePreset;
  displayOptions: PreviewDisplayOptions;
}

export function PreviewDeviceCanvas({
  definition,
  devicePreset,
  displayOptions,
}: PreviewDeviceCanvasProps) {
  const meta = DEVICE_PRESETS[devicePreset];

  return (
    <div className="flex-1 w-full min-h-0 flex items-start justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Desktop Viewport Simulation */}
      {devicePreset === "desktop" && (
        <div
          className="w-full max-w-[1040px] xl:max-w-[1160px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col transition-all duration-300"
          style={{ minHeight: "680px" }}
          aria-label={`Desktop preview, ${meta.dimensions} CSS pixels`}
        >
          {/* Subtle desktop browser mockup bar */}
          <div className="h-9 px-4 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="px-3 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-500 font-mono">
              formly.in/f/{definition.title ? definition.title.toLowerCase().replace(/\s+/g, "-") : "preview"}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">1366 × 768</span>
          </div>

          {/* Inner Form Canvas with natural scroll */}
          <div className="flex-1 w-full overflow-y-auto">
            <RespondentFormCanvas definition={definition} displayOptions={displayOptions} />
          </div>
        </div>
      )}

      {/* Tablet Viewport Simulation (768 x 1024) */}
      {devicePreset === "tablet" && (
        <div
          className="w-[768px] max-w-full bg-slate-950 p-3 sm:p-4 rounded-[36px] shadow-2xl border-4 border-slate-800/80 transition-all duration-300 flex flex-col my-auto"
          style={{ minHeight: "840px" }}
          aria-label={`Tablet preview, ${meta.dimensions} CSS pixels`}
        >
          {/* Tablet Camera dot */}
          <div className="w-full flex items-center justify-center pb-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          {/* Screen area with rounded corners */}
          <div className="w-full flex-1 rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
            <div className="flex-1 w-full overflow-y-auto">
              <RespondentFormCanvas definition={definition} displayOptions={displayOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Viewport Simulation (375 x 812) */}
      {devicePreset === "mobile" && (
        <div
          className="w-[375px] max-w-full bg-slate-950 p-3 sm:p-3.5 rounded-[44px] shadow-2xl border-4 border-slate-800/90 transition-all duration-300 flex flex-col my-auto"
          style={{ minHeight: "740px" }}
          aria-label={`Mobile preview, ${meta.dimensions} CSS pixels`}
        >
          {/* Dynamic Island / Notch pill */}
          <div className="w-full flex items-center justify-center pb-2.5 select-none">
            <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Phone Screen area */}
          <div className="w-full flex-1 rounded-[30px] overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
            <div className="flex-1 w-full overflow-y-auto">
              <RespondentFormCanvas definition={definition} displayOptions={displayOptions} />
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full flex items-center justify-center pt-2 select-none">
            <span className="w-28 h-1 rounded-full bg-slate-700/60" />
          </div>
        </div>
      )}
    </div>
  );
}
