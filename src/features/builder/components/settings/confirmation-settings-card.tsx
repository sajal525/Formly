"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { FormSettings, ConfirmationMessageType } from "../../schemas/builder-definition-schema";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConfirmationSettingsCardProps {
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function ConfirmationSettingsCard({
  settings,
  onSettingsChange,
}: ConfirmationSettingsCardProps) {
  const messageType = settings.confirmationType || "text";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Confirmation Message
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            What respondents see after submitting the form.
          </p>
        </div>
      </div>

      {/* Message Type Selector Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Message Type
        </label>
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => onSettingsChange({ confirmationType: "text" })}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all",
              messageType === "text"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Text Message
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ confirmationType: "custom_page" })}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all",
              messageType === "custom_page"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Custom Page
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ confirmationType: "redirect" })}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all",
              messageType === "redirect"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Redirect to URL
          </button>
        </div>
      </div>

      {/* Conditional Inputs based on message type */}
      {messageType === "text" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Confirmation Title
            </label>
            <Input
              value={settings.confirmationTitle || "Thank you!"}
              onChange={(e) => onSettingsChange({ confirmationTitle: e.target.value })}
              placeholder="Thank you!"
              className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Confirmation Message
            </label>
            <Input
              value={settings.confirmationMessage || "Your response has been submitted successfully."}
              onChange={(e) => onSettingsChange({ confirmationMessage: e.target.value })}
              placeholder="Your response has been submitted successfully."
              className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      )}

      {messageType === "custom_page" && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Custom Page Heading
            </label>
            <Input
              value={settings.customPageTitle || "Submission Successful"}
              onChange={(e) => onSettingsChange({ customPageTitle: e.target.value })}
              placeholder="Submission Successful"
              className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Custom Page Message
            </label>
            <Input
              value={settings.customPageDescription || "Thank you for completing this form. We have received your answers."}
              onChange={(e) => onSettingsChange({ customPageDescription: e.target.value })}
              placeholder="Thank you for completing this form."
              className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      )}

      {messageType === "redirect" && (
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Destination URL
          </label>
          <Input
            value={settings.redirectUrl || ""}
            onChange={(e) => onSettingsChange({ redirectUrl: e.target.value })}
            placeholder="https://example.com/thank-you"
            className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <p className="text-[11px] text-slate-500">
            Respondents will be automatically redirected to this URL after submitting.
          </p>
        </div>
      )}
    </div>
  );
}
