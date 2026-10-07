"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Copy,
  Trash2,
  MoreVertical,
  Plus,
  X,
  CircleDot,
  CheckSquare,
  ChevronDownSquare,
  AlignLeft,
  AlignJustify,
  SlidersHorizontal,
  Star,
  Calendar,
  Clock,
  UploadCloud,
  Hash,
  Mail,
  Link as LinkIcon,
  HelpCircle,
  Check,
} from "lucide-react";
import { QuestionData, OptionData, SectionData } from "../../server/forms.queries";

export const QUESTION_TYPES = [
  { value: "short_answer", label: "Short answer", icon: AlignLeft },
  { value: "paragraph", label: "Paragraph", icon: AlignJustify },
  { value: "multiple_choice", label: "Multiple choice", icon: CircleDot },
  { value: "checkboxes", label: "Checkboxes", icon: CheckSquare },
  { value: "dropdown", label: "Dropdown", icon: ChevronDownSquare },
  { value: "linear_scale", label: "Linear scale", icon: SlidersHorizontal },
  { value: "rating", label: "Rating", icon: Star },
  { value: "date", label: "Date", icon: Calendar },
  { value: "time", label: "Time", icon: Clock },
  { value: "file_upload", label: "File upload", icon: UploadCloud },
  { value: "number", label: "Number", icon: Hash },
  { value: "email", label: "Email", icon: Mail },
  { value: "url", label: "URL", icon: LinkIcon },
];

interface QuestionCardProps {
  question: QuestionData;
  isActive: boolean;
  sections: SectionData[];
  isQuiz?: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<QuestionData>) => void;
  onUpdateOptions: (options: OptionData[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function QuestionCard({
  question,
  isActive,
  sections,
  isQuiz = false,
  onSelect,
  onUpdate,
  onUpdateOptions,
  onDuplicate,
  onDelete,
}: QuestionCardProps) {
  const [showDescription, setShowDescription] = useState(Boolean(question.description));
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAnswerKeyMode, setIsAnswerKeyMode] = useState(false);

  const currentType = QUESTION_TYPES.find((t) => t.value === question.type) || QUESTION_TYPES[2];
  const TypeIcon = currentType.icon;

  const isChoiceType = ["multiple_choice", "checkboxes", "dropdown"].includes(question.type);

  function handleAddOption() {
    const nextOrder = question.options.length;
    const newOption: OptionData = {
      id: "opt_" + Math.random().toString(36).substring(2, 9),
      label: `Option ${question.options.length + 1}`,
      sortOrder: nextOrder,
      isOther: false,
    };
    onUpdateOptions([...question.options, newOption]);
  }

  function handleAddOtherOption() {
    if (question.options.some((o) => o.isOther)) return;
    const nextOrder = question.options.length;
    const otherOption: OptionData = {
      id: "opt_other_" + Math.random().toString(36).substring(2, 9),
      label: "Other...",
      sortOrder: nextOrder,
      isOther: true,
    };
    onUpdateOptions([...question.options, otherOption]);
  }

  function handleOptionLabelChange(index: number, newLabel: string) {
    const updated = [...question.options];
    updated[index] = { ...updated[index], label: newLabel };
    onUpdateOptions(updated);
  }

  function handleOptionSectionRoute(index: number, targetSectionId: string | null) {
    const updated = [...question.options];
    updated[index] = { ...updated[index], targetSectionId };
    onUpdateOptions(updated);
  }

  function handleRemoveOption(index: number) {
    if (question.options.length <= 1) return;
    const updated = question.options.filter((_, idx) => idx !== index);
    onUpdateOptions(updated);
  }

  // Linear scale helpers
  const scaleStart = question.config?.scaleStart ?? 1;
  const scaleEnd = question.config?.scaleEnd ?? 5;
  const startLabel = question.config?.startLabel ?? "";
  const endLabel = question.config?.endLabel ?? "";

  return (
    <div
      onClick={!isActive ? onSelect : undefined}
      style={{
        backgroundColor: "#111218",
        borderRadius: "10px",
        border: isActive ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
        borderLeft: isActive ? "6px solid #7C3AED" : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: isActive ? "0 6px 24px rgba(0, 0, 0, 0.4)" : "0 2px 10px rgba(0, 0, 0, 0.2)",
        padding: "24px",
        marginBottom: "16px",
        cursor: !isActive ? "pointer" : "default",
        transition: "all 0.15s ease",
        position: "relative",
      }}
    >
      {/* Top Drag Handle (Active only) */}
      {isActive && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "-16px",
            marginBottom: "12px",
            color: "rgba(255, 255, 255, 0.2)",
            cursor: "grab",
          }}
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Question Header: Title Input + Question Type Dropdown */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* Title Input or View */}
        <div style={{ flex: 1, minWidth: "240px" }}>
          {isActive ? (
            <div>
              <input
                type="text"
                value={question.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Question"
                style={{
                  width: "100%",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "none",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.15)",
                  padding: "8px 10px",
                  borderRadius: "4px 4px 0 0",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottom = "2px solid #7C3AED";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderBottom = "2px solid rgba(255, 255, 255, 0.15)";
                }}
              />
              {showDescription && (
                <input
                  type="text"
                  value={question.description || ""}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Description (optional)"
                  style={{
                    width: "100%",
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.65)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "6px 10px",
                    marginTop: "6px",
                    outline: "none",
                  }}
                />
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 500, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{question.title || "Untitled Question"}</span>
                {question.isRequired && <span style={{ color: "#EF4444" }}>*</span>}
              </div>
              {question.description && (
                <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                  {question.description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Type Selector (Active Only) */}
        {isActive && (
          <div style={{ position: "relative" }}>
            <select
              value={question.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              style={{
                backgroundColor: "#161820",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "8px 12px",
                outline: "none",
                cursor: "pointer",
                minWidth: "160px",
              }}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Question Body: Based on Question Type */}
      <div style={{ marginTop: "16px", marginBottom: "20px" }}>
        {/* Short answer / Number / Email / URL */}
        {["short_answer", "number", "email", "url"].includes(question.type) && (
          <div
            style={{
              padding: "10px 0",
              borderBottom: "1px dotted rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "14px",
              maxWidth: "320px",
            }}
          >
            {question.type === "number"
              ? "Number input"
              : question.type === "email"
              ? "email@example.com"
              : question.type === "url"
              ? "https://..."
              : "Short answer text"}
          </div>
        )}

        {/* Paragraph */}
        {question.type === "paragraph" && (
          <div
            style={{
              padding: "16px 0",
              borderBottom: "1px dotted rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "14px",
              maxWidth: "480px",
            }}
          >
            Long answer text
          </div>
        )}

        {/* Choice types: Multiple choice, Checkboxes, Dropdown */}
        {isChoiceType && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {question.options.map((option, idx) => {
              const isOther = Boolean(option.isOther);
              return (
                <div
                  key={option.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {/* Indicator Icon */}
                  <div style={{ color: "rgba(255, 255, 255, 0.4)" }}>
                    {question.type === "multiple_choice" && <CircleDot size={18} />}
                    {question.type === "checkboxes" && <CheckSquare size={18} />}
                    {question.type === "dropdown" && (
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{idx + 1}.</span>
                    )}
                  </div>

                  {/* Option Label */}
                  {isActive ? (
                    <input
                      type="text"
                      disabled={isOther}
                      value={isOther ? "Other..." : option.label}
                      onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        color: isOther ? "rgba(255, 255, 255, 0.5)" : "#FFFFFF",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: "1px solid transparent",
                        padding: "4px 0",
                        outline: "none",
                        fontStyle: isOther ? "italic" : "normal",
                      }}
                      onFocus={(e) => {
                        if (!isOther) e.currentTarget.style.borderBottom = "1px solid #7C3AED";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderBottom = "1px solid transparent";
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "14px", color: "#F4F4F6" }}>
                      {isOther ? "Other: _______" : option.label}
                    </span>
                  )}

                  {/* "Go to section" Router Dropdown (Multiple Choice / Dropdown in Active state) */}
                  {isActive && question.type === "multiple_choice" && sections.length > 1 && (
                    <select
                      value={option.targetSectionId || ""}
                      onChange={(e) => handleOptionSectionRoute(idx, e.target.value || null)}
                      style={{
                        background: "#161820",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "12px",
                        padding: "2px 6px",
                        outline: "none",
                      }}
                    >
                      <option value="">Continue to next section</option>
                      {sections.map((s, sIdx) => (
                        <option key={s.id} value={s.id}>
                          Go to section {sIdx + 1}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Remove option button */}
                  {isActive && question.options.length > 1 && (
                    <button
                      onClick={() => handleRemoveOption(idx)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(255, 255, 255, 0.3)",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.3)")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Option & Add Other Buttons */}
            {isActive && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "6px",
                  fontSize: "13px",
                }}
              >
                <button
                  onClick={handleAddOption}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#A78BFA",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 0",
                    fontWeight: 500,
                  }}
                >
                  <Plus size={14} />
                  Add option
                </button>
                {!question.options.some((o) => o.isOther) && (
                  <>
                    <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>or</span>
                    <button
                      onClick={handleAddOtherOption}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#38BDF8",
                        cursor: "pointer",
                        padding: "4px 0",
                        fontWeight: 500,
                      }}
                    >
                      add "Other"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Linear scale */}
        {question.type === "linear_scale" && (
          <div>
            {isActive ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <select
                    value={scaleStart}
                    onChange={(e) =>
                      onUpdate({
                        config: { ...question.config, scaleStart: Number(e.target.value) },
                      })
                    }
                    style={{
                      background: "#161820",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      fontSize: "13px",
                    }}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>to</span>
                  <select
                    value={scaleEnd}
                    onChange={(e) =>
                      onUpdate({
                        config: { ...question.config, scaleEnd: Number(e.target.value) },
                      })
                    }
                    style={{
                      background: "#161820",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      fontSize: "13px",
                    }}
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <input
                    type="text"
                    value={startLabel}
                    onChange={(e) =>
                      onUpdate({
                        config: { ...question.config, startLabel: e.target.value },
                      })
                    }
                    placeholder={`Label for ${scaleStart} (optional)`}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      padding: "4px 0",
                      outline: "none",
                      flex: 1,
                    }}
                  />
                  <input
                    type="text"
                    value={endLabel}
                    onChange={(e) =>
                      onUpdate({
                        config: { ...question.config, endLabel: e.target.value },
                      })
                    }
                    placeholder={`Label for ${scaleEnd} (optional)`}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      padding: "4px 0",
                      outline: "none",
                      flex: 1,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 0" }}>
                {startLabel && <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>{startLabel}</span>}
                <div style={{ display: "flex", gap: "12px" }}>
                  {Array.from({ length: scaleEnd - scaleStart + 1 }, (_, i) => scaleStart + i).map((num) => (
                    <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>{num}</span>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.3)" }} />
                    </div>
                  ))}
                </div>
                {endLabel && <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>{endLabel}</span>}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {question.type === "rating" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={22} color="rgba(255, 255, 255, 0.3)" />
            ))}
          </div>
        )}

        {/* Date & Time */}
        {question.type === "date" && (
          <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} />
            <span>Month, day, year</span>
          </div>
        )}

        {question.type === "time" && (
          <div style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} />
            <span>Time</span>
          </div>
        )}

        {/* File upload */}
        {question.type === "file_upload" && (
          <div
            style={{
              padding: "16px",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <UploadCloud size={18} />
            <span>Respondent can upload files (Max 10MB)</span>
          </div>
        )}
      </div>

      {/* Card Footer: (Active Only) Actions, Required Toggle, More Menu */}
      {isActive && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Left: Answer key button if Quiz mode */}
          {isQuiz ? (
            <button
              onClick={() => setIsAnswerKeyMode(!isAnswerKeyMode)}
              style={{
                background: "transparent",
                border: "1px solid #7C3AED",
                borderRadius: "6px",
                color: "#A78BFA",
                fontSize: "13px",
                fontWeight: 600,
                padding: "4px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Check size={14} />
              Answer key ({question.points || 0} pts)
            </button>
          ) : (
            <div />
          )}

          {/* Right: Duplicate, Delete, Required Switch, Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
              title="Duplicate"
            >
              <Copy size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {/* Divider */}
            <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255, 255, 255, 0.12)" }} />

            {/* Required Switch */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.8)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span>Required</span>
              <input
                type="checkbox"
                checked={question.isRequired}
                onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                style={{
                  accentColor: "#7C3AED",
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                }}
              />
            </label>

            {/* More Menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "4px",
                }}
                title="More options"
              >
                <MoreVertical size={16} />
              </button>

              {showMoreMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    right: 0,
                    marginBottom: "8px",
                    width: "180px",
                    backgroundColor: "#161820",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    padding: "6px",
                    zIndex: 100,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowDescription(!showDescription);
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      color: "#E4E4E7",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Description</span>
                    {showDescription && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
