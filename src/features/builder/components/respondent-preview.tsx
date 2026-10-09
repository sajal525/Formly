"use client";

import React, { useState, useRef } from "react";
import { BuilderFormDefinition } from "../schemas/builder-definition-schema";
import { resolveThemeTokens } from "@/features/forms/themes/resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Star,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RespondentPreviewProps {
  definition: BuilderFormDefinition;
}

export function RespondentPreview({ definition }: RespondentPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const questionInputRefs = useRef<Record<string, HTMLElement | null>>({});

  const resolved = resolveThemeTokens(definition.themeKey, definition.themeOverrides);
  const questions = definition.questions || [];
  const totalQuestions = questions.length;

  // Count answered questions for progress
  const answeredCount = questions.filter((q) => {
    const val = answers[q.id];
    if (val === undefined || val === null || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;

  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleUpdateAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Enter-to-next behavior: pressing Enter on single-line inputs focuses the next question's input
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      if (index < totalQuestions - 1) {
        e.preventDefault();
        const nextQ = questions[index + 1];
        if (nextQ && questionInputRefs.current[nextQ.id]) {
          questionInputRefs.current[nextQ.id]?.focus();
        }
      }
    }
  };

  return (
    <div
      style={resolved.backgroundStyle}
      className={cn(
        "min-h-[calc(100vh-128px)] w-full py-8 px-4 sm:px-6 md:px-8 transition-colors duration-300",
        resolved.backgroundClass ? `bg-gradient-to-br ${resolved.backgroundClass}` : "",
        resolved.isDark ? "text-white" : "text-slate-900"
      )}
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Preview Banner */}
        <div className="p-3.5 rounded-2xl bg-violet-900/90 text-white backdrop-blur-md shadow-lg flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-violet-300 shrink-0" />
            <span>
              Preview Mode — Form submissions are simulated and not saved.
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider font-bold">
            Draft Preview
          </span>
        </div>

        {/* Progress Indicator (if enabled) */}
        {definition.settings?.showProgressIndicator && totalQuestions > 0 && (
          <div
            className={cn(
              "backdrop-blur-md p-4 rounded-2xl border shadow-xs space-y-2 sticky top-4 z-20",
              resolved.cardClass
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold opacity-80">
              <span>Progress</span>
              <span>
                {answeredCount} of {totalQuestions} answered ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: resolved.accentColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Form Header Card */}
        <div
          className={cn(
            "rounded-3xl border shadow-sm transition-all duration-200",
            resolved.cardClass,
            resolved.headerPaddingClass,
            resolved.headerAlignment === "center" ? "text-center" : "text-left"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-xs",
              resolved.headerAlignment === "center" ? "mx-auto" : ""
            )}
            style={{ backgroundColor: `${resolved.accentColor}18`, color: resolved.accentColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <h1
            className={cn(
              "text-2xl sm:text-3xl font-extrabold tracking-tight mb-2",
              resolved.headingFontClass
            )}
          >
            {definition.title || "Untitled form"}
          </h1>
          {definition.description && (
            <p
              className={cn(
                "text-sm leading-relaxed opacity-80",
                resolved.bodyFontClass
              )}
            >
              {definition.description}
            </p>
          )}
        </div>

        {/* Single-Page Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => {
            return (
              <div
                key={question.id}
                className={cn(
                  "rounded-3xl border shadow-xs space-y-4 transition-all p-6 sm:p-7",
                  resolved.cardClass
                )}
              >
                {/* Question Header */}
                <div className="flex items-center gap-2.5">
                  {(definition.settings?.showQuestionNumbers ?? true) && (
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: resolved.accentColor }}
                    >
                      {index + 1}
                    </span>
                  )}
                  <h2
                    className={cn(
                      "text-base sm:text-lg font-bold",
                      resolved.headingFontClass
                    )}
                  >
                    {question.label}
                    {question.required && (
                      <span className="text-rose-500 ml-1" title="Required">*</span>
                    )}
                  </h2>
                </div>

                {/* Helper text / description */}
                {question.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-8.5">
                    {question.description}
                  </p>
                )}

                {/* Question Input */}
                <div className="pl-0 sm:pl-8.5 pt-1">
                  {question.type === "SHORT_TEXT" && (
                    <Input
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      type="text"
                      placeholder={question.settings?.placeholder || "Type your answer here..."}
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm"
                    />
                  )}

                  {question.type === "LONG_TEXT" && (
                    <Textarea
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      rows={3}
                      placeholder={question.settings?.placeholder || "Type your detailed answer here..."}
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      className="rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm resize-none"
                    />
                  )}

                  {question.type === "EMAIL" && (
                    <Input
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      type="email"
                      placeholder="name@example.com"
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm"
                    />
                  )}

                  {question.type === "PHONE" && (
                    <Input
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm"
                    />
                  )}

                  {question.type === "NUMBER" && (
                    <Input
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      type="number"
                      placeholder="Enter a number..."
                      value={answers[question.id] ?? ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm"
                    />
                  )}

                  {question.type === "DATE" && (
                    <Input
                      ref={(el) => {
                        questionInputRefs.current[question.id] = el;
                      }}
                      type="date"
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm"
                    />
                  )}

                  {question.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      {(question.options || []).map((opt) => {
                        const isChecked = answers[question.id] === opt.value;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleUpdateAnswer(question.id, opt.value)}
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer",
                              isChecked
                                ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-950 dark:text-violet-200 font-bold"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <span>{opt.label}</span>
                            {isChecked && <Check className="w-4 h-4 text-violet-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {(question.options || []).map((opt) => {
                        const arr = Array.isArray(answers[question.id])
                          ? (answers[question.id] as string[])
                          : [];
                        const isChecked = arr.includes(opt.value);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const next = isChecked
                                ? arr.filter((x) => x !== opt.value)
                                : [...arr, opt.value];
                              handleUpdateAnswer(question.id, next);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer",
                              isChecked
                                ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-950 dark:text-violet-200 font-bold"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <span>{opt.label}</span>
                            <div
                              className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                                isChecked
                                  ? "bg-violet-600 border-violet-600 text-white"
                                  : "border-slate-300 dark:border-slate-600"
                              )}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "DROPDOWN" && (
                    <select
                      value={answers[question.id] || ""}
                      onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select an option...</option>
                      {(question.options || []).map((opt) => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === "RATING" && (
                    <div className="flex items-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const current = Number(answers[question.id]) || 0;
                        const active = starVal <= current;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => handleUpdateAnswer(question.id, starVal)}
                            className={cn(
                              "p-2.5 rounded-xl transition-all cursor-pointer hover:scale-110",
                              active
                                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                                : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                            )}
                          >
                            <Star
                              className={cn("w-6 h-6", active ? "fill-amber-400" : "")}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button simulation */}
        <div className="pt-4 flex flex-col items-center gap-3">
          <Button
            type="button"
            onClick={() => setSubmitAttempted(true)}
            style={{ backgroundColor: resolved.accentColor }}
            className="w-full sm:w-auto px-8 h-12 text-white font-bold text-sm rounded-2xl shadow-md hover:opacity-90 active:scale-98 transition-all"
          >
            Submit Response
          </Button>

          {submitAttempted && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {definition.settings?.confirmationMessage ||
                  "Thanks for your response. (Simulation in preview mode)"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
