"use client";

import React, { useState, useEffect, useRef } from "react";
import { PublicFormDTO } from "../server/public-form-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowRight, ArrowLeft, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveThemeTokens } from "@/features/forms/themes/resolver";

interface PublicRespondentFormProps {
  form: PublicFormDTO;
}

export function PublicRespondentForm({ form }: PublicRespondentFormProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const questions = form.definition.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const hasInteractedRef = useRef(false);
  const hasReachedLastRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sourceKey = urlParams.get("src") || undefined;

        const res = await fetch(`/api/public/forms/${form.id}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceKey }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.sessionId) {
            setSessionId(data.sessionId);
          }
        }
      } catch (err) {
        console.error("Failed to start session:", err);
      }
    }
    initSession();
    return () => {
      isMounted = false;
    };
  }, [form.id]);

  // Check milestone when currentIndex changes (e.g. reached last question)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setValidationError(null);

    if (sessionId && currentIndex === totalQuestions - 1 && !hasReachedLastRef.current) {
      hasReachedLastRef.current = true;
      fetch(`/api/public/forms/${form.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          milestone: "REACHED_LAST_QUESTION",
        }),
      }).catch(() => {});
    }
  }, [currentIndex, sessionId, totalQuestions, form.id]);

  const handleNext = () => {
    if (!currentQuestion) return;

    const val = answers[currentQuestion.id];
    if (currentQuestion.required) {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        setValidationError("This question requires an answer.");
        return;
      }
    }

    setValidationError(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (currentQuestion?.type !== "LONG_TEXT") {
        e.preventDefault();
        handleNext();
      }
    }
  };

  const updateAnswer = (val: any) => {
    setValidationError(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));

    if (sessionId && !hasInteractedRef.current) {
      hasInteractedRef.current = true;
      fetch(`/api/public/forms/${form.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          milestone: "FIRST_INTERACTION",
        }),
      }).catch(() => {});
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const res = await fetch(`/api/public/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Failed to submit response.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setValidationError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 100;

  // Resolve dynamic theme tokens (supports all 12 presets and overrides)
  const resolved = resolveThemeTokens(
    form.themeKey || (form.definition as any)?.themeKey,
    (form.definition as any)?.themeOverrides
  );
  const accentColor = resolved.accentColor;
  const getThemeGradient = () => resolved.backgroundClass;

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br",
          getThemeGradient()
        )}
      >
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Thank you!
          </h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">
            Your response for <span className="font-semibold text-slate-800">{form.title}</span> has been securely recorded.
          </p>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Powered by Formly</span>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div
        className={cn(
          "min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br",
          getThemeGradient()
        )}
      >
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{form.title}</h2>
          <p className="text-sm text-slate-500 mb-4">
            This form currently has no questions configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-br transition-colors duration-500 select-none",
        getThemeGradient()
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Top Header & Progress Bar */}
      <header className="w-full max-w-3xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
              {form.title}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span>
              {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-400">({progressPercentage}%)</span>
          </div>
        </div>

        {/* Progress indicator bar */}
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </header>

      {/* Main Single-Question Interactive Container */}
      <main className="w-full max-w-2xl mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 transition-all duration-200">
          {/* Question Index Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              {currentIndex + 1}
            </span>
            {currentQuestion.required && (
              <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Required
              </span>
            )}
          </div>

          {/* Question Label & Description */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {currentQuestion.label}
          </h2>
          {currentQuestion.description && (
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {currentQuestion.description}
            </p>
          )}

          {/* Question Input Renderers */}
          <div className="mt-6 mb-4">
            {currentQuestion.type === "SHORT_TEXT" && (
              <Input
                ref={inputRef as any}
                type="text"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="h-12 text-base px-4 rounded-xl border-slate-200 focus-visible:ring-2"
              />
            )}

            {currentQuestion.type === "LONG_TEXT" && (
              <Textarea
                ref={inputRef as any}
                rows={4}
                placeholder="Type your detailed answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="text-base p-4 rounded-xl border-slate-200 focus-visible:ring-2 resize-none"
              />
            )}

            {currentQuestion.type === "EMAIL" && (
              <Input
                ref={inputRef as any}
                type="email"
                placeholder="name@example.com"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="h-12 text-base px-4 rounded-xl border-slate-200 focus-visible:ring-2"
              />
            )}

            {currentQuestion.type === "PHONE" && (
              <Input
                ref={inputRef as any}
                type="tel"
                placeholder="+1 555-0199"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="h-12 text-base px-4 rounded-xl border-slate-200 focus-visible:ring-2"
              />
            )}

            {currentQuestion.type === "NUMBER" && (
              <Input
                ref={inputRef as any}
                type="number"
                placeholder="Enter a number..."
                value={answers[currentQuestion.id] ?? ""}
                onChange={(e) => updateAnswer(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-12 text-base px-4 rounded-xl border-slate-200 focus-visible:ring-2"
              />
            )}

            {currentQuestion.type === "DATE" && (
              <Input
                ref={inputRef as any}
                type="date"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="h-12 text-base px-4 rounded-xl border-slate-200 focus-visible:ring-2"
              />
            )}

            {currentQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.id || i}
                      type="button"
                      onClick={() => updateAnswer(opt.value)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border font-medium text-sm flex items-center justify-between transition-all duration-150",
                        isSelected
                          ? "border-violet-600 bg-violet-50/60 text-violet-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center text-xs font-semibold",
                            isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-600" />}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "DROPDOWN" && (
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.id || i}
                      type="button"
                      onClick={() => updateAnswer(opt.value)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border font-medium text-sm flex items-center justify-between transition-all duration-150",
                        isSelected
                          ? "border-violet-600 bg-violet-50/60 text-violet-900"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-violet-600" />}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "CHECKBOX" && (
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt, i) => {
                  const selectedArr = Array.isArray(answers[currentQuestion.id])
                    ? (answers[currentQuestion.id] as string[])
                    : [];
                  const isSelected = selectedArr.includes(opt.value);

                  return (
                    <button
                      key={opt.id || i}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? selectedArr.filter((item) => item !== opt.value)
                          : [...selectedArr, opt.value];
                        updateAnswer(next);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border font-medium text-sm flex items-center justify-between transition-all duration-150",
                        isSelected
                          ? "border-violet-600 bg-violet-50/60 text-violet-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      )}
                    >
                      <span>{opt.label}</span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center border transition-colors",
                          isSelected
                            ? "bg-violet-600 border-violet-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "RATING" && (
              <div className="flex items-center justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map((ratingVal) => {
                  const currentRating = Number(answers[currentQuestion.id]) || 0;
                  const isActive = ratingVal <= currentRating;
                  return (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => updateAnswer(ratingVal)}
                      className={cn(
                        "p-3 rounded-2xl transition-all duration-150 flex flex-col items-center gap-1.5 hover:scale-110",
                        isActive
                          ? "text-amber-500 bg-amber-50"
                          : "text-slate-300 hover:text-amber-400"
                      )}
                    >
                      <Star className={cn("w-8 h-8", isActive ? "fill-amber-400" : "")} />
                      <span className="text-xs font-bold text-slate-600">{ratingVal}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <p className="text-xs font-medium text-rose-600 mt-2 animate-in fade-in">
              {validationError}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentQuestion.type !== "LONG_TEXT" && (
                <span className="hidden sm:inline-block text-xs text-slate-400">
                  press <kbd className="font-semibold text-slate-600">Enter ↵</kbd>
                </span>
              )}

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  style={{ backgroundColor: accentColor }}
                  className="text-white hover:opacity-90 shadow-md px-5"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  style={{ backgroundColor: accentColor }}
                  className="text-white hover:opacity-90 shadow-md px-6 font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                  <Check className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <span>Powered by Formly — Responsive & Accessible</span>
      </footer>
    </div>
  );
}
