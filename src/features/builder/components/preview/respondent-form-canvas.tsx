"use client";

import React, { useState, useRef } from "react";
import { BuilderFormDefinition } from "../../schemas/builder-definition-schema";
import { resolveThemeTokens } from "@/features/forms/themes/resolver";
import { PreviewDisplayOptions } from "./preview-options-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Star,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RespondentFormCanvasProps {
  definition: BuilderFormDefinition;
  displayOptions: PreviewDisplayOptions;
  isStandalone?: boolean;
}

export function RespondentFormCanvas({
  definition,
  displayOptions,
  isStandalone = false,
}: RespondentFormCanvasProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionInputRefs = useRef<Record<string, HTMLElement | null>>({});

  const resolved = resolveThemeTokens(definition.themeKey, definition.themeOverrides);
  const questions = definition.questions || [];
  const totalQuestions = questions.length;

  // Derive answered count
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
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

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

  const handleClearForm = () => {
    setAnswers({});
    setErrors({});
    setIsSubmitted(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = "This question is required.";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first error field
      const firstInvalidId = Object.keys(newErrors)[0];
      if (firstInvalidId && questionInputRefs.current[firstInvalidId]) {
        questionInputRefs.current[firstInvalidId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        questionInputRefs.current[firstInvalidId]?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitted(true);
  };

  // Ensure card background has sufficient contrast in both dark and light modes
  const cardSurfaceClass = resolved.isDark
    ? "bg-slate-900/95 text-white border-white/10"
    : "bg-white text-slate-900 border-slate-200/80 shadow-sm";

  return (
    <div
      style={resolved.backgroundStyle}
      className={cn(
        "w-full min-h-full py-6 px-4 sm:px-6 md:px-8 transition-colors duration-300",
        resolved.backgroundClass ? `bg-gradient-to-br ${resolved.backgroundClass}` : "",
        resolved.isDark ? "text-white" : "text-slate-900"
      )}
    >
      <div className="w-full max-w-2xl mx-auto space-y-5">
        {/* Submitted Simulation Notice Card */}
        {isSubmitted ? (
          <div
            className={cn(
              "rounded-3xl p-8 sm:p-10 border text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200",
              cardSurfaceClass
            )}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${resolved.accentColor}18`,
                color: resolved.accentColor,
              }}
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {definition.settings?.confirmationTitle || "Thank you!"}
              </h2>
              <p className="text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                {definition.settings?.confirmationMessage ||
                  "Your response has been submitted successfully."}
              </p>
            </div>

            <div className="pt-2 pb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">
                <Sparkles className="w-3.5 h-3.5" />
                Preview Mode — No response was stored in the database.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearForm}
                className="gap-2 rounded-xl text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Another Response</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Form Header Card */}
            <div
              className={cn(
                "rounded-3xl border transition-all duration-200 relative overflow-hidden",
                cardSurfaceClass,
                resolved.headerPaddingClass,
                resolved.headerAlignment === "center" ? "text-center" : "text-left"
              )}
            >
              {/* Subtle decorative illustration banner for header (matches B4.png) */}
              <div
                className="absolute top-0 right-0 w-48 sm:w-64 h-full pointer-events-none opacity-30 sm:opacity-50 select-none overflow-hidden"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 200 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full object-cover object-right-top"
                >
                  <circle cx="160" cy="50" r="70" fill={resolved.accentColor} fillOpacity="0.2" />
                  <path
                    d="M110 90 C130 60, 170 70, 190 100 C210 130, 160 160, 130 150 Z"
                    fill={resolved.accentColor}
                    fillOpacity="0.15"
                  />
                  <rect
                    x="120"
                    y="75"
                    width="60"
                    height="18"
                    rx="6"
                    fill={resolved.accentColor}
                    fillOpacity="0.4"
                    transform="rotate(-8 120 75)"
                  />
                  <rect
                    x="115"
                    y="95"
                    width="65"
                    height="18"
                    rx="6"
                    fill={resolved.accentColor}
                    fillOpacity="0.3"
                    transform="rotate(4 115 95)"
                  />
                </svg>
              </div>

              {/* Header Icon Badge */}
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shadow-xs relative z-10",
                  resolved.headerAlignment === "center" ? "mx-auto" : ""
                )}
                style={{
                  backgroundColor: `${resolved.accentColor}18`,
                  color: resolved.accentColor,
                }}
              >
                <GraduationCap className="w-6 h-6" />
              </div>

              {/* Title & Description */}
              <div className="relative z-10 max-w-lg">
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
                      "text-xs sm:text-sm leading-relaxed opacity-80",
                      resolved.bodyFontClass
                    )}
                  >
                    {definition.description}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Indicator Bar (if enabled in displayOptions) */}
            {displayOptions.showProgressIndicator && totalQuestions > 0 && (
              <div
                className={cn(
                  "backdrop-blur-md px-4 py-3 rounded-2xl border shadow-xs space-y-1.5 transition-all",
                  cardSurfaceClass
                )}
              >
                <div className="flex items-center justify-between text-xs font-semibold opacity-85">
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    Progress
                  </span>
                  <span>
                    {answeredCount} of {totalQuestions} &nbsp;({progressPercentage}%)
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

            {/* Single-Page Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => {
                const isInvalid = Boolean(errors[question.id]);
                const answerVal = answers[question.id];

                return (
                  <div
                    key={question.id}
                    className={cn(
                      "rounded-3xl border transition-all p-5 sm:p-7 space-y-4",
                      cardSurfaceClass,
                      isInvalid ? "border-rose-500/80 ring-2 ring-rose-500/20" : ""
                    )}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-2.5">
                      {displayOptions.showQuestionNumbers && (
                        <span
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: resolved.accentColor }}
                        >
                          {index + 1}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2
                          className={cn(
                            "text-sm sm:text-base font-bold",
                            resolved.headingFontClass
                          )}
                        >
                          {question.label}
                          {question.required && displayOptions.showRequiredIndicator && (
                            <span className="text-rose-500 font-bold ml-1" title="Required">
                              *
                            </span>
                          )}
                        </h2>
                        {question.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {question.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Question Input */}
                    <div className={cn(displayOptions.showQuestionNumbers ? "pl-0 sm:pl-8.5" : "")}>
                      {question.type === "SHORT_TEXT" && (
                        <Input
                          ref={(el) => {
                            questionInputRefs.current[question.id] = el;
                          }}
                          type="text"
                          placeholder={
                            question.settings?.placeholder || "Enter your full name"
                          }
                          value={answerVal || ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-2"
                        />
                      )}

                      {question.type === "LONG_TEXT" && (
                        <Textarea
                          ref={(el) => {
                            questionInputRefs.current[question.id] = el;
                          }}
                          rows={3}
                          placeholder={
                            question.settings?.placeholder || "Type your comments here..."
                          }
                          value={answerVal || ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          className="rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm resize-none focus-visible:ring-2"
                        />
                      )}

                      {question.type === "EMAIL" && (
                        <div className="relative">
                          <Input
                            ref={(el) => {
                              questionInputRefs.current[question.id] = el;
                            }}
                            type="email"
                            placeholder="yourname@example.com"
                            value={answerVal || ""}
                            onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="h-11 pl-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-2"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      )}

                      {question.type === "PHONE" && (
                        <div className="relative">
                          <Input
                            ref={(el) => {
                              questionInputRefs.current[question.id] = el;
                            }}
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={answerVal || ""}
                            onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="h-11 pl-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-2"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      )}

                      {question.type === "NUMBER" && (
                        <Input
                          ref={(el) => {
                            questionInputRefs.current[question.id] = el;
                          }}
                          type="number"
                          placeholder="Enter a number..."
                          value={answerVal ?? ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-2"
                        />
                      )}

                      {question.type === "DATE" && (
                        <Input
                          ref={(el) => {
                            questionInputRefs.current[question.id] = el;
                          }}
                          type="date"
                          value={answerVal || ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="h-11 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-2"
                        />
                      )}

                      {question.type === "MULTIPLE_CHOICE" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(question.options || []).map((opt) => {
                            const isChecked = answerVal === opt.value;
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
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                      isChecked
                                        ? "border-violet-600 bg-violet-600"
                                        : "border-slate-300 dark:border-slate-600"
                                    )}
                                  >
                                    {isChecked && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span>{opt.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {question.type === "CHECKBOX" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(question.options || []).map((opt) => {
                            const arr = Array.isArray(answerVal) ? (answerVal as string[]) : [];
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
                          value={answerVal || ""}
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
                            const current = Number(answerVal) || 0;
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

                      {/* Inline Error Message */}
                      {isInvalid && (
                        <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-2 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors[question.id]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Form Actions (matches B4.png) */}
            <div className="pt-3 pb-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearForm}
                className="h-11 px-5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear Form
              </Button>

              <Button
                type="button"
                onClick={() => handleSubmit()}
                style={{ backgroundColor: resolved.accentColor }}
                className="h-11 px-8 text-white font-bold text-sm rounded-2xl shadow-md hover:opacity-90 active:scale-98 transition-all"
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
