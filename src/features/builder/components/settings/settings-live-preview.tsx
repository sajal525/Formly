"use client";

import React, { useState } from "react";
import { Eye, Monitor, Smartphone, Check, ChevronRight } from "lucide-react";
import { BuilderFormDefinition } from "../../schemas/builder-definition-schema";
import { resolveThemeTokens } from "@/features/forms/themes/resolver";
import { cn } from "@/lib/utils";

interface SettingsLivePreviewProps {
  definition: BuilderFormDefinition;
}

export function SettingsLivePreview({ definition }: SettingsLivePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const settings = definition.settings;
  const resolved = resolveThemeTokens(definition.themeKey, definition.themeOverrides);

  const rawQuestions = definition.questions || [];
  // Use defined questions or representative default questions matching the screenshot
  const previewQuestions =
    rawQuestions.length > 0
      ? rawQuestions.slice(0, 3)
      : [
          {
            id: "sample-1",
            type: "SHORT_TEXT" as const,
            label: "What is your full name?",
            required: true,
            settings: { placeholder: "Your answer" },
          },
          {
            id: "sample-2",
            type: "MULTIPLE_CHOICE" as const,
            label: "Select your department",
            required: true,
            options: [
              { id: "opt-1", label: "Computer Engineering", value: "CE" },
              { id: "opt-2", label: "AIML", value: "AIML" },
              { id: "opt-3", label: "Information Technology", value: "IT" },
              { id: "opt-4", label: "Mechanical Engineering", value: "ME" },
            ],
          },
          {
            id: "sample-3",
            type: "EMAIL" as const,
            label: "Enter your email address",
            required: true,
            settings: { placeholder: "yourname@example.com" },
          },
        ];

  // Scoped card and text colors based strictly on theme preset isDark to prevent creator dark mode bleed
  const cardSurfaceClass = resolved.isDark
    ? "bg-slate-900/95 text-white border-white/15 shadow-xl"
    : "bg-white/95 text-slate-900 border-slate-200/90 shadow-sm";

  const inputSurfaceClass = resolved.isDark
    ? "border-white/15 bg-white/5 text-slate-200"
    : "border-slate-200 bg-slate-50/80 text-slate-700";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with Device Toggle */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Live Preview
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              See how your form will look with current settings.
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-0.5">
          <button
            type="button"
            aria-label="Desktop preview"
            onClick={() => setDevice("desktop")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              device === "desktop"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Mobile preview"
            onClick={() => setDevice("mobile")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              device === "mobile"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Preview Canvas Surface */}
      <div
        style={resolved.backgroundStyle}
        className={cn(
          "w-full flex-1 min-h-[560px] max-h-[720px] overflow-y-auto p-4 sm:p-6 transition-all duration-300 scrollbar-thin",
          resolved.backgroundClass ? `bg-gradient-to-br ${resolved.backgroundClass}` : "",
          resolved.isDark ? "text-white" : "text-slate-900"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 space-y-4",
            device === "mobile"
              ? "max-w-[320px] mx-auto p-3 bg-slate-950/20 rounded-3xl border-2 border-slate-700/40 shadow-xl"
              : "w-full max-w-md mx-auto"
          )}
        >
          {/* Progress Indicator (Reactive to showProgressIndicator) */}
          {settings.showProgressIndicator && (
            <div
              className={cn(
                "p-3 rounded-xl border backdrop-blur-md space-y-1.5 animate-in fade-in duration-200",
                cardSurfaceClass
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                <span>Progress</span>
                <span>0 of {previewQuestions.length} (0%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full w-1/4 transition-all"
                  style={{ backgroundColor: resolved.accentColor }}
                />
              </div>
            </div>
          )}

          {/* Form Header Card */}
          <div
            className={cn(
              "rounded-2xl border transition-all duration-200",
              cardSurfaceClass,
              resolved.headerPaddingClass,
              resolved.headerAlignment === "center" ? "text-center" : "text-left"
            )}
          >
            <h1
              className={cn(
                "text-lg sm:text-xl font-bold tracking-tight leading-tight",
                resolved.headingFontClass
              )}
            >
              {definition.title || "Untitled form"}
            </h1>
            {definition.description && (
              <p
                className={cn(
                  "text-xs mt-1.5 leading-relaxed opacity-80",
                  resolved.bodyFontClass
                )}
              >
                {definition.description}
              </p>
            )}

            {/* Accent Highlight Bar */}
            <div
              className={cn(
                "h-1 w-12 rounded-full mt-3",
                resolved.headerAlignment === "center" ? "mx-auto" : ""
              )}
              style={{ backgroundColor: resolved.accentColor }}
            />
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {previewQuestions.map((q, idx) => {
              // Format label with question numbers reactive to showQuestionNumbers
              const displayLabel = settings.showQuestionNumbers
                ? `${idx + 1}. ${q.label}`
                : q.label;

              return (
                <div
                  key={q.id || idx}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all duration-200 space-y-2",
                    cardSurfaceClass
                  )}
                >
                  <label
                    className={cn(
                      "text-xs font-semibold leading-tight block",
                      resolved.headingFontClass
                    )}
                  >
                    <span>{displayLabel}</span>
                    {q.required && (
                      <span className="text-rose-500 ml-1 font-bold">*</span>
                    )}
                  </label>

                  {/* Render based on type */}
                  {q.type === "MULTIPLE_CHOICE" ? (
                    <div className="space-y-1.5 pt-0.5">
                      {(q.options || []).map((opt, oIdx) => (
                        <div
                          key={opt.id || oIdx}
                          className="flex items-center gap-2 text-xs opacity-90 cursor-default"
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-current/40 flex items-center justify-center shrink-0" />
                          <span className="text-[11px]">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "h-8 w-full rounded-lg border px-2.5 flex items-center text-xs opacity-80",
                        inputSurfaceClass
                      )}
                    >
                      {q.settings?.placeholder || "Your answer"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled
              style={{ backgroundColor: resolved.accentColor }}
              className="w-full h-9 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm opacity-95 cursor-default"
            >
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
