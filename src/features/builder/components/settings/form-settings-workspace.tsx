"use client";

import React, { useState } from "react";
import { BuilderFormDefinition, FormSettings } from "../../schemas/builder-definition-schema";
import { GeneralSettingsCard } from "./general-settings-card";
import { FormAccessCard } from "./form-access-card";
import { ResponseSettingsCard } from "./response-settings-card";
import { FormBehaviorCard } from "./form-behavior-card";
import { ConfirmationSettingsCard } from "./confirmation-settings-card";
import { NotificationsSettingsCard } from "./notifications-settings-card";
import { AdvancedSettingsCard } from "./advanced-settings-card";
import { DangerZoneCard } from "./danger-zone-card";
import { SettingsLivePreview } from "./settings-live-preview";
import { Sliders, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSettingsWorkspaceProps {
  formId: string;
  definition: BuilderFormDefinition;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function FormSettingsWorkspace({
  formId,
  definition,
  onTitleChange,
  onDescriptionChange,
  onSettingsChange,
}: FormSettingsWorkspaceProps) {
  const [mobileTab, setMobileTab] = useState<"settings" | "preview">("settings");

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Mobile viewport switcher (<lg) */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl mb-4 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setMobileTab("settings")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "settings"
              ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "preview"
              ? "bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main split workspace */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8 min-w-0">
        {/* Left / Center 2-Column Grid */}
        <div
          className={cn(
            "flex-1 min-w-0 w-full grid grid-cols-1 md:grid-cols-2 gap-5",
            mobileTab !== "settings" && "hidden lg:grid"
          )}
        >
          {/* Column 1 */}
          <div className="space-y-5">
            <GeneralSettingsCard
              title={definition.title || "Untitled form"}
              description={definition.description}
              settings={definition.settings}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
              onSettingsChange={onSettingsChange}
            />

            <ResponseSettingsCard
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />

            <ConfirmationSettingsCard
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />

            <AdvancedSettingsCard
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />
          </div>

          {/* Column 2 */}
          <div className="space-y-5">
            <FormAccessCard
              formId={formId}
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />

            <FormBehaviorCard
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />

            <NotificationsSettingsCard
              settings={definition.settings}
              onSettingsChange={onSettingsChange}
            />

            <DangerZoneCard
              formId={formId}
              formTitle={definition.title || "Untitled form"}
            />
          </div>
        </div>

        {/* Right Rail: Live Preview Panel */}
        <div
          className={cn(
            "w-full lg:w-[380px] xl:w-[420px] shrink-0 sticky top-0",
            mobileTab !== "preview" && "hidden lg:block"
          )}
        >
          <SettingsLivePreview definition={definition} />
        </div>
      </div>
    </div>
  );
}
