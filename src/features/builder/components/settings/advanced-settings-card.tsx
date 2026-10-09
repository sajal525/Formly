"use client";

import React from "react";
import { SlidersHorizontal, Edit3, BookmarkCheck } from "lucide-react";
import { FormSettings } from "../../schemas/builder-definition-schema";
import { Switch } from "@/components/ui/switch";

interface AdvancedSettingsCardProps {
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function AdvancedSettingsCard({
  settings,
  onSettingsChange,
}: AdvancedSettingsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Advanced Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Additional options for your form.
          </p>
        </div>
      </div>

      {/* Toggles list */}
      <div className="space-y-3.5 pt-1">
        {/* Allow editing after submission */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-allow-edit"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Allow editing after submission
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Let respondents edit their answers.
            </p>
          </div>
          <Switch
            id="toggle-allow-edit"
            checked={settings.allowEditAfterSubmission}
            onCheckedChange={(checked) =>
              onSettingsChange({ allowEditAfterSubmission: checked })
            }
          />
        </div>

        {/* Save and continue later */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-save-continue"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Save and continue later
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Allow respondents to save progress and return.
            </p>
          </div>
          <Switch
            id="toggle-save-continue"
            checked={settings.saveAndContinueLater}
            onCheckedChange={(checked) =>
              onSettingsChange({ saveAndContinueLater: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
