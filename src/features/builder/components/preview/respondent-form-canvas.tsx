"use client";

import React, { useState, useRef } from "react";
import {
  BuilderFormDefinition,
  ensureDefinitionBlocks,
} from "../../schemas/builder-definition-schema";
import { resolveThemeTokens } from "@/features/forms/themes/resolver";
import { PreviewDisplayOptions } from "./preview-options-types";
import { RenderedImageBlock } from "../image-block/rendered-image-block";
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
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RespondentFormCanvasProps {
  definition: BuilderFormDefinition;
  displayOptions: PreviewDisplayOptions;
  isStandalone?: boolean;
  formId?: string;
}

export function RespondentFormCanvas({
  definition,
  displayOptions,
  isStandalone = false,
  formId,
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
  const isNothing = resolved.isNothing;
  const cardSurfaceClass = isNothing
    ? "bg-white text-neutral-950 border border-neutral-900 rounded-2xl shadow-none"
    : resolved.isDark
    ? "bg-slate-900/95 text-white border-white/10 rounded-3xl"
    : "bg-white text-slate-900 border-slate-200/80 shadow-sm rounded-3xl";

  return (
    <div
      style={resolved.backgroundStyle}
      className={cn(
        "w-full min-h-full py-6 px-4 sm:px-6 md:px-8 transition-colors duration-300 relative overflow-hidden",
        isNothing
          ? "bg-[#FAFAFA] [background-image:radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:18px_18px] text-neutral-950"
          : resolved.backgroundClass
          ? `bg-gradient-to-br ${resolved.backgroundClass}`
          : "",
        resolved.isDark ? "text-white" : "text-slate-900"
      )}
    >
      {/* Nothing Bauhaus Decorative Elements (visible on desktop/tablet) */}
      {isNothing && (
        <>
          {/* Top-Left Axis & Red Circle */}
          <div
            className="absolute top-6 left-6 lg:top-8 lg:left-8 pointer-events-none select-none hidden md:flex flex-col items-center gap-2.5 z-0"
            aria-hidden="true"
          >
            <div className="w-px h-16 bg-neutral-900" />
            <div className="w-2.5 h-2.5 rounded-full border border-neutral-900 bg-white" />
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-xs" />
            <div className="w-px h-14 bg-neutral-900" />
          </div>

          {/* Bottom-Left Bauhaus Block & Dot Matrix */}
          <div
            className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 pointer-events-none select-none hidden md:block z-0"
            aria-hidden="true"
          >
            <div className="relative">
              <div className="w-24 h-24 border-l border-b border-neutral-900 relative">
                <div className="absolute bottom-0 left-0 w-18 h-18 bg-neutral-950 rounded-tr-full overflow-hidden p-2 text-white">
                  <div className="w-full h-full [background-image:radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:5px_5px]" />
                </div>
                <div className="absolute -top-3 left-0 w-12 h-6 [background-image:radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] [background-size:5px_5px]" />
              </div>
            </div>
          </div>

          {/* Top-Right Minimal Tech Metadata & Arc */}
          <div
            className="absolute top-6 right-6 lg:top-8 lg:right-8 pointer-events-none select-none hidden md:block text-right z-0"
            aria-hidden="true"
          >
            <div className="font-mono text-[10px] tracking-[0.25em] text-neutral-800 font-bold uppercase space-y-0.5">
              <div>FORM</div>
              <div className="flex items-center justify-end gap-1">
                <span>01</span>
                <span className="text-red-600 font-bold">—</span>
              </div>
            </div>
            <div className="relative mt-2 w-28 h-28">
              <div className="w-28 h-28 rounded-full border border-neutral-900/80 -mr-6" />
              <div className="absolute top-6 left-2 w-3.5 h-3.5 rounded-full bg-red-600" />
              <div className="absolute bottom-2 right-2 w-10 h-10 [background-image:radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] [background-size:5px_5px]" />
            </div>
          </div>
        </>
      )}

      <div className="w-full max-w-2xl mx-auto space-y-5 relative z-10">
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
                backgroundColor: isNothing ? "#DC262615" : `${resolved.accentColor}18`,
                color: isNothing ? "#DC2626" : resolved.accentColor,
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
                "border transition-all duration-200 relative overflow-hidden",
                cardSurfaceClass,
                resolved.headerPaddingClass,
                resolved.headerAlignment === "center" ? "text-center" : "text-left"
              )}
            >
              {/* Nothing Corner Red Dot Accent */}
              {isNothing && (
                <span
                  className="w-3.5 h-3.5 rounded-full bg-red-600 absolute -top-1.5 -right-1.5 md:right-8 md:-top-1.5 z-20 shadow-xs"
                  aria-hidden="true"
                />
              )}

              {/* Cover Banner or Decorative illustration */}
              {definition.coverImage ? (
                <div
                  className={cn(
                    "w-full relative overflow-hidden border-b border-slate-100 dark:border-white/10 -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 mb-6",
                    definition.coverImage.transform?.aspectPreset === "16:9"
                      ? "aspect-[16/9] max-h-[380px]"
                      : "aspect-[4/1] min-h-[130px] max-h-[260px]"
                  )}
                >
                  <img
                    src={formId ? `/api/v1/forms/${formId}/assets/${definition.coverImage.assetId}` : `/api/v1/assets/${definition.coverImage.assetId}`}
                    alt={definition.coverImage.altText || "Cover banner"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : !isNothing ? (
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
              ) : null}

              {/* Header Icon Badge */}
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shadow-xs relative z-10",
                  isNothing
                    ? "border border-neutral-200 bg-white text-neutral-950"
                    : "",
                  resolved.headerAlignment === "center" ? "mx-auto" : ""
                )}
                style={
                  isNothing
                    ? undefined
                    : {
                        backgroundColor: `${resolved.accentColor}18`,
                        color: resolved.accentColor,
                      }
                }
              >
                {isNothing && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-red-600 absolute -top-0.5 -right-0.5"
                    aria-hidden="true"
                  />
                )}
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
              isNothing ? (
                <div className="bg-white rounded-xl border border-neutral-900 px-4 py-3 shadow-none space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-mono text-[10px] tracking-[0.25em] font-bold text-neutral-900 uppercase">
                      P R O G R E S S
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-800 flex items-center gap-2">
                      <span>
                        {answeredCount} of {totalQuestions} &nbsp;({progressPercentage}%)
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" aria-hidden="true" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-red-600"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              ) : (
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
              )
            )}

            {/* Single-Page Content Blocks & Questions List */}
            <div className="space-y-4">
              {(() => {
                const blocks = ensureDefinitionBlocks(definition);
                let questionCounter = 0;
                return blocks.map((block) => {
                  if (block.kind === "image") {
                    const assetUrl = formId
                      ? `/api/v1/forms/${formId}/assets/${block.assetId}`
                      : `/api/v1/assets/${block.assetId}`;
                    return (
                      <RenderedImageBlock
                        key={block.id}
                        block={block}
                        imageUrl={assetUrl}
                      />
                    );
                  }

                  const question = block.question;
                  const index = questionCounter++;
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
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {displayOptions.showQuestionNumbers && (
                          <span
                            className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              backgroundColor: isNothing ? "#DC2626" : resolved.accentColor,
                            }}
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
                              <span className="text-red-600 font-bold ml-1" title="Required">
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
                      {isNothing && (
                        <MoreVertical className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                      )}
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
                            question.settings?.placeholder || (isNothing ? "Short answer text" : "Enter your full name")
                          }
                          value={answerVal || ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className={cn(
                            "h-11 rounded-xl text-sm focus-visible:ring-2",
                            isNothing
                              ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                              : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                          )}
                        />
                      )}

                      {question.type === "LONG_TEXT" && (
                        <Textarea
                          ref={(el) => {
                            questionInputRefs.current[question.id] = el;
                          }}
                          rows={3}
                          placeholder={
                            question.settings?.placeholder || (isNothing ? "Long answer text" : "Type your comments here...")
                          }
                          value={answerVal || ""}
                          onChange={(e) => handleUpdateAnswer(question.id, e.target.value)}
                          className={cn(
                            "rounded-xl text-sm resize-none focus-visible:ring-2",
                            isNothing
                              ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                              : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                          )}
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
                            className={cn(
                              "h-11 pl-10 rounded-xl text-sm focus-visible:ring-2",
                              isNothing
                                ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                                : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                            )}
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
                            className={cn(
                              "h-11 pl-10 rounded-xl text-sm focus-visible:ring-2",
                              isNothing
                                ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                                : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                            )}
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
                          className={cn(
                            "h-11 rounded-xl text-sm focus-visible:ring-2",
                            isNothing
                              ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                              : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                          )}
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
                          className={cn(
                            "h-11 rounded-xl text-sm focus-visible:ring-2",
                            isNothing
                              ? "bg-white border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
                              : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                          )}
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
                                  isNothing
                                    ? isChecked
                                      ? "border-neutral-900 bg-neutral-50 text-neutral-950 font-bold"
                                      : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900"
                                    : isChecked
                                    ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-950 dark:text-violet-200 font-bold"
                                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                      isNothing
                                        ? isChecked
                                          ? "border-neutral-900 bg-neutral-900"
                                          : "border-neutral-400"
                                        : isChecked
                                        ? "border-violet-600 bg-violet-600"
                                        : "border-slate-300 dark:border-slate-600"
                                    )}
                                  >
                                    {isChecked && (
                                      <div
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          isNothing ? "bg-red-600" : "bg-white"
                                        )}
                                      />
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
                                  isNothing
                                    ? isChecked
                                      ? "border-neutral-900 bg-neutral-50 text-neutral-950 font-bold"
                                      : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900"
                                    : isChecked
                                    ? "border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 text-violet-950 dark:text-violet-200 font-bold"
                                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                                )}
                              >
                                <span>{opt.label}</span>
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                                    isNothing
                                      ? isChecked
                                        ? "bg-neutral-900 border-neutral-900 text-white"
                                        : "border-neutral-400"
                                      : isChecked
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
                          className={cn(
                            "w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm focus:outline-none cursor-pointer",
                            isNothing
                              ? "bg-white border-neutral-300 text-neutral-900"
                              : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          )}
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
                                    ? isNothing
                                      ? "text-red-600 bg-red-50"
                                      : "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                                    : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                                )}
                              >
                                <Star
                                  className={cn("w-6 h-6", active ? (isNothing ? "fill-red-600 text-red-600" : "fill-amber-400 text-amber-400") : "")}
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
              });
            })()}
          </div>

            {/* Bottom Form Actions (matches Screenshot 2) */}
            <div className="pt-3 pb-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearForm}
                className={cn(
                  "h-11 px-5 rounded-xl text-xs font-bold transition-all",
                  isNothing
                    ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100 shadow-none"
                    : "rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Clear Form
              </Button>

              <Button
                type="button"
                onClick={() => handleSubmit()}
                style={isNothing ? undefined : { backgroundColor: resolved.accentColor }}
                className={cn(
                  "h-11 px-8 text-white font-bold text-sm shadow-md transition-all active:scale-98 relative",
                  isNothing
                    ? "bg-neutral-950 hover:bg-neutral-800 rounded-xl shadow-none flex items-center gap-2"
                    : "rounded-2xl hover:opacity-90"
                )}
              >
                <span>Submit</span>
                {isNothing && (
                  <>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -top-1 -right-1 shadow-xs"
                      aria-hidden="true"
                    />
                  </>
                )}
              </Button>
            </div>

            {/* Nothing Minimal Tech Footer */}
            {isNothing && (
              <footer
                className="w-full max-w-2xl mx-auto pt-6 pb-2 border-t border-neutral-300/80 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase select-none"
                aria-hidden="true"
              >
                <div className="flex items-center gap-1.5">
                  <span>BUILT WITH FORMLY</span>
                  <span className="text-red-600 font-bold">—</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>SIMPLE FORMS FOR A BRIGHTER TOMORROW</span>
                  <span className="text-red-600 font-bold">—</span>
                </div>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
