"use client";

import React from "react";
import { BuilderFormDefinition } from "@/features/builder/schemas/builder-definition-schema";
import { ThemeOverrides } from "../schema";
import { resolveThemeTokens } from "../resolver";
import { Eye, CheckCircle2, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemePreviewCardProps {
  definition: BuilderFormDefinition;
  themeKey: string;
  themeOverrides?: ThemeOverrides;
}

export function ThemePreviewCard({
  definition,
  themeKey,
  themeOverrides,
}: ThemePreviewCardProps) {
  const resolved = resolveThemeTokens(themeKey, themeOverrides);
  const questions = definition.questions || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar of preview card */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Theme Preview
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {resolved.preset.name}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
            Live
          </span>
        </div>
      </div>

      {/* Embedded Live Preview Surface */}
      <div
        style={resolved.backgroundStyle}
        className={cn(
          "w-full min-h-[340px] max-h-[420px] overflow-y-auto p-4 sm:p-5 transition-colors duration-200 scrollbar-thin",
          resolved.backgroundClass ? `bg-gradient-to-br ${resolved.backgroundClass}` : "",
          resolved.isDark ? "text-white" : "text-slate-900"
        )}
      >
        <div className="max-w-md mx-auto space-y-3.5">
          {/* Header Card */}
          <div
            className={cn(
              "rounded-xl border transition-all duration-200",
              resolved.cardClass,
              resolved.headerPaddingClass,
              resolved.headerAlignment === "center" ? "text-center" : "text-left"
            )}
          >
            {/* Form Title */}
            <h1
              className={cn(
                "text-base sm:text-lg font-bold leading-tight tracking-tight",
                resolved.headingFontClass
              )}
            >
              {definition.title || "Untitled form"}
            </h1>

            {/* Form Description */}
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

          {/* Form Questions */}
          {questions.length === 0 ? (
            <div
              className={cn(
                "p-4 rounded-xl border text-center text-xs opacity-70",
                resolved.cardClass
              )}
            >
              No questions added yet. Add questions in the Questions tab.
            </div>
          ) : (
            questions.slice(0, 3).map((q, idx) => (
              <div
                key={q.id || idx}
                className={cn(
                  "p-3.5 rounded-xl border transition-all duration-200 space-y-2",
                  resolved.cardClass
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <label
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      resolved.headingFontClass
                    )}
                  >
                    <span>{q.label || `Question ${idx + 1}`}</span>
                    {q.required && (
                      <span className="text-red-500 ml-1 font-bold">*</span>
                    )}
                  </label>
                </div>

                {q.description && (
                  <p className="text-[11px] opacity-75">{q.description}</p>
                )}

                {/* Simulated Input based on question type */}
                {q.type === "MULTIPLE_CHOICE" ? (
                  <div className="space-y-1.5 pt-1">
                    {(q.options && q.options.length > 0
                      ? q.options.slice(0, 3)
                      : [
                          { id: "1", label: "Option 1" },
                          { id: "2", label: "Option 2" },
                        ]
                    ).map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className="flex items-center gap-2 text-xs opacity-90 cursor-default"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                          style={{
                            borderColor: oIdx === 0 ? resolved.accentColor : "currentColor",
                          }}
                        >
                          {oIdx === 0 && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: resolved.accentColor }}
                            />
                          )}
                        </div>
                        <span className="text-[11px]">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                ) : q.type === "RATING" ? (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-amber-400 text-amber-400 stroke-1"
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "h-7 w-full rounded-md border px-2 flex items-center text-[11px] opacity-70",
                      resolved.isDark
                        ? "border-white/15 bg-white/5 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    )}
                  >
                    {q.settings?.placeholder || "Your answer..."}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Submit Action Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled
              style={{ backgroundColor: resolved.accentColor }}
              className="w-full h-8 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm opacity-95 cursor-default"
            >
              <span>Submit Form</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
