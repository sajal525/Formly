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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#FAFAFA] dark:bg-[#090A0B] overflow-hidden">
      {/* Subheader / Device & Preview Action Toolbar */}
      <div className="h-12 shrink-0 bg-white dark:bg-[#121417] border-b border-[#E5E7EB] dark:border-[#27272A] px-4 sm:px-6 flex items-center justify-between gap-3 select-none z-20 transition-colors">
        {/* Left: Device Presets Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#181B20] p-0.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A]">
          <button
            type="button"
            onClick={() => setDevicePreset("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer",
              devicePreset === "desktop"
                ? "bg-[#563BFA] text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer",
              devicePreset === "tablet"
                ? "bg-[#563BFA] text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer",
              devicePreset === "mobile"
                ? "bg-[#563BFA] text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
            className="h-8 px-3 rounded-lg text-xs font-medium gap-1.5 border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#181B20] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>View as respondent</span>
          </Button>

          <button
            type="button"
            onClick={handleOpenStandalonePreview}
            className="w-8 h-8 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#181B20] flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
          formId={formId}
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
