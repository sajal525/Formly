"use client";

import React, { useState, useEffect } from "react";
import { BuilderFormDefinition } from "../../schemas/builder-definition-schema";
import { DevicePreset, PreviewDisplayOptions } from "./preview-options-types";
import { PreviewDeviceCanvas } from "./preview-device-canvas";
import { PreviewSettingsRail } from "./preview-settings-rail";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewWorkspaceProps {
  formId: string;
  definition: BuilderFormDefinition;
  onTabChange: (tab: "questions" | "theme" | "settings" | "preview") => void;
}

export function PreviewWorkspace({
  formId,
  definition,
  onTabChange,
}: PreviewWorkspaceProps) {
  const [devicePreset, setDevicePreset] = useState<DevicePreset>("desktop");

  const [displayOptions, setDisplayOptions] = useState<PreviewDisplayOptions>({
    showProgressIndicator: definition.settings?.showProgressIndicator ?? true,
    showQuestionNumbers: definition.settings?.showQuestionNumbers ?? true,
    showRequiredIndicator: true,
  });

  // Keep display options initial defaults synchronized if definition settings load
  useEffect(() => {
    setDisplayOptions((prev) => ({
      ...prev,
      showProgressIndicator: definition.settings?.showProgressIndicator ?? true,
      showQuestionNumbers: definition.settings?.showQuestionNumbers ?? true,
    }));
  }, [definition.settings?.showProgressIndicator, definition.settings?.showQuestionNumbers]);

  const handleResetOptions = () => {
    setDisplayOptions({
      showProgressIndicator: definition.settings?.showProgressIndicator ?? true,
      showQuestionNumbers: definition.settings?.showQuestionNumbers ?? true,
      showRequiredIndicator: true,
    });
  };

  const handleOpenStandalonePreview = () => {
    window.open(`/forms/${formId}/preview`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-100/60 dark:bg-slate-950/60 overflow-hidden">
      {/* Subheader / Device & Preview Action Toolbar (matches B4.png) */}
      <div className="h-13 shrink-0 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 select-none z-20 backdrop-blur-xs transition-colors">
        {/* Left: Device Presets Selector */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDevicePreset("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              devicePreset === "desktop"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Desktop preview (1366 × 768)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDevicePreset("tablet")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              devicePreset === "tablet"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Tablet preview (768 × 1024)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDevicePreset("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              devicePreset === "mobile"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Mobile preview (375 × 812)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: View as respondent & Popout buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenStandalonePreview}
            className="h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Eye className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>View as respondent</span>
          </Button>

          <button
            type="button"
            onClick={handleOpenStandalonePreview}
            className="w-8.5 h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open preview in new tab"
            aria-label="Open preview in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Left/Center Device Canvas + Right Settings Rail */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <PreviewDeviceCanvas
          definition={definition}
          devicePreset={devicePreset}
          displayOptions={displayOptions}
        />

        <PreviewSettingsRail
          formId={formId}
          definition={definition}
          devicePreset={devicePreset}
          onDeviceChange={setDevicePreset}
          displayOptions={displayOptions}
          onOptionsChange={(updates) =>
            setDisplayOptions((prev) => ({ ...prev, ...updates }))
          }
          onResetOptions={handleResetOptions}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
}
