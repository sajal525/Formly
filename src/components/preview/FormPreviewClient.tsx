"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit3, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { FormEditorData, SectionData, QuestionData } from "../../server/forms.queries";

interface FormPreviewClientProps {
  formData: FormEditorData;
}

export function FormPreviewClient({ formData }: FormPreviewClientProps) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sections = formData.sections;
  const currentSection = sections[currentSectionIdx] || sections[0];
  const accentColor = formData.theme?.color || "#7C3AED";

  // Filter questions for the current section
  const currentQuestions = formData.questions.filter((q) => {
    if (sections.length <= 1) return true;
    return (q.sectionId || sections[0].id) === currentSection.id;
  });

  function handleAnswerChange(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }

  function handleCheckboxToggle(questionId: string, optionLabel: string) {
    const currentList: string[] = answers[questionId] || [];
    let nextList: string[];
    if (currentList.includes(optionLabel)) {
      nextList = currentList.filter((item) => item !== optionLabel);
    } else {
      nextList = [...currentList, optionLabel];
    }
    handleAnswerChange(questionId, nextList);
  }

  function validateCurrentSection(): boolean {
    const newErrors: Record<string, string> = {};

    for (const q of currentQuestions) {
      if (q.isRequired) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = "This is a required question";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentSection()) return;

    // Check for section routing from multiple choice questions
    let nextSectionIdx = currentSectionIdx + 1;
    for (const q of currentQuestions) {
      if (q.type === "multiple_choice") {
        const chosenLabel = answers[q.id];
        const chosenOpt = q.options.find((o) => o.label === chosenLabel);
        if (chosenOpt?.targetSectionId) {
          const targetIdx = sections.findIndex((s) => s.id === chosenOpt.targetSectionId);
          if (targetIdx !== -1) {
            nextSectionIdx = targetIdx;
            break;
          }
        }
      }
    }

    if (nextSectionIdx < sections.length) {
      setCurrentSectionIdx(nextSectionIdx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleSubmit() {
    if (!validateCurrentSection()) return;
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleClearForm() {
    if (confirm("Clear all answers?")) {
      setAnswers({});
      setOtherTexts({});
      setErrors({});
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0B0E",
        color: "#F4F4F6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Banner: Preview Mode */}
      <div
        style={{
          backgroundColor: "#161820",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "rgba(255, 255, 255, 0.8)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              backgroundColor: "rgba(124, 58, 237, 0.2)",
              color: "#A78BFA",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "11px",
              textTransform: "uppercase",
            }}
          >
            Preview
          </span>
          <span>Responses are not saved in preview mode.</span>
        </div>
        <Link
          href={`/forms/${formData.id}/edit`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#A78BFA",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <Edit3 size={14} />
          <span>Edit this form</span>
        </Link>
      </div>

      {/* Main Container */}
      <main
        style={{
          maxWidth: "720px",
          margin: "32px auto 80px auto",
          padding: "0 16px",
          width: "100%",
        }}
      >
        {isSubmitted ? (
          /* Confirmation Screen */
          <div
            style={{
              backgroundColor: "#111218",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderTop: `10px solid ${accentColor}`,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={24} color="#10B981" />
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF" }}>
                {formData.title}
              </h2>
            </div>
            <p style={{ fontSize: "15px", color: "rgba(255, 255, 255, 0.8)" }}>
              {formData.settings?.confirmationMessage || "Your response has been recorded."}
            </p>
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={() => {
                  setAnswers({});
                  setIsSubmitted(false);
                  setCurrentSectionIdx(0);
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Submit another response
              </button>
            </div>
          </div>
        ) : (
          /* Form Questions Screen */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header Card */}
            <div
              style={{
                backgroundColor: "#111218",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderTop: `10px solid ${accentColor}`,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                padding: "24px",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "var(--font-display)",
                  marginBottom: "8px",
                }}
              >
                {formData.title}
              </h1>
              {formData.description && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.7)",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                  }}
                >
                  {formData.description}
                </p>
              )}
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingTop: "12px",
                  fontSize: "13px",
                  color: "#EF4444",
                }}
              >
                * Indicates required question
              </div>
            </div>

            {/* Questions List */}
            {currentQuestions.map((q) => {
              const hasError = Boolean(errors[q.id]);
              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: "#111218",
                    borderRadius: "10px",
                    border: hasError
                      ? "1px solid #EF4444"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    padding: "24px",
                  }}
                >
                  {/* Question Title & Description */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "#FFFFFF" }}>
                      <span>{q.title || "Untitled Question"}</span>
                      {q.isRequired && <span style={{ color: "#EF4444", marginLeft: "4px" }}>*</span>}
                    </div>
                    {q.description && (
                      <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                        {q.description}
                      </div>
                    )}
                  </div>

                  {/* Question Inputs */}
                  <div>
                    {/* Short answer / Number / Email / URL */}
                    {["short_answer", "number", "email", "url"].includes(q.type) && (
                      <input
                        type={q.type === "number" ? "number" : q.type === "email" ? "email" : "text"}
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your answer"
                        style={{
                          width: "100%",
                          maxWidth: "360px",
                          backgroundColor: "transparent",
                          border: "none",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "6px 0",
                          outline: "none",
                        }}
                      />
                    )}

                    {/* Paragraph */}
                    {q.type === "paragraph" && (
                      <textarea
                        rows={3}
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your answer"
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          border: "none",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "6px 0",
                          outline: "none",
                          resize: "none",
                        }}
                      />
                    )}

                    {/* Multiple Choice */}
                    {q.type === "multiple_choice" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {q.options.map((opt) => (
                          <label
                            key={opt.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontSize: "14px",
                              color: "#F4F4F6",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.label}
                              checked={answers[q.id] === opt.label}
                              onChange={() => handleAnswerChange(q.id, opt.label)}
                              style={{ accentColor, width: "16px", height: "16px" }}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkboxes */}
                    {q.type === "checkboxes" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {q.options.map((opt) => {
                          const isChecked = (answers[q.id] || []).includes(opt.label);
                          return (
                            <label
                              key={opt.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "14px",
                                color: "#F4F4F6",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxToggle(q.id, opt.label)}
                                style={{ accentColor, width: "16px", height: "16px" }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Dropdown */}
                    {q.type === "dropdown" && (
                      <select
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{
                          backgroundColor: "#161820",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "8px 12px",
                          outline: "none",
                          minWidth: "200px",
                        }}
                      >
                        <option value="">Choose</option>
                        {q.options.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Linear Scale */}
                    {q.type === "linear_scale" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 0" }}>
                        {q.config?.startLabel && (
                          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                            {q.config.startLabel}
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "12px" }}>
                          {Array.from(
                            { length: (q.config?.scaleEnd || 5) - (q.config?.scaleStart || 1) + 1 },
                            (_, i) => (q.config?.scaleStart || 1) + i
                          ).map((num) => (
                            <label
                              key={num}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                                {num}
                              </span>
                              <input
                                type="radio"
                                name={q.id}
                                value={num}
                                checked={answers[q.id] === num}
                                onChange={() => handleAnswerChange(q.id, num)}
                                style={{ accentColor, width: "16px", height: "16px" }}
                              />
                            </label>
                          ))}
                        </div>
                        {q.config?.endLabel && (
                          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                            {q.config.endLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {q.type === "rating" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map((level) => {
                          const isFilled = (answers[q.id] || 0) >= level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, level)}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                            >
                              <Star
                                size={24}
                                fill={isFilled ? "#F59E0B" : "none"}
                                color={isFilled ? "#F59E0B" : "rgba(255, 255, 255, 0.3)"}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Date */}
                    {q.type === "date" && (
                      <input
                        type="date"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{
                          backgroundColor: "#161820",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "8px 12px",
                          outline: "none",
                        }}
                      />
                    )}

                    {/* Time */}
                    {q.type === "time" && (
                      <input
                        type="time"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{
                          backgroundColor: "#161820",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "8px 12px",
                          outline: "none",
                        }}
                      />
                    )}

                    {/* File Upload */}
                    {q.type === "file_upload" && (
                      <input
                        type="file"
                        onChange={(e) =>
                          handleAnswerChange(q.id, e.target.files?.[0]?.name || "")
                        }
                        style={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "13px",
                        }}
                      />
                    )}
                  </div>

                  {/* Error Message */}
                  {hasError && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#EF4444",
                        fontSize: "12px",
                        marginTop: "12px",
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>{errors[q.id]}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Actions: Next/Submit, Back, Clear */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                {currentSectionIdx > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "#FFFFFF",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    currentSectionIdx < sections.length - 1 ? handleNext : handleSubmit
                  }
                  style={{
                    backgroundColor: accentColor,
                    border: "none",
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    padding: "8px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {currentSectionIdx < sections.length - 1 ? "Next" : "Submit"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleClearForm}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Clear form
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
