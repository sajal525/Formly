"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Loader2,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  AlertTriangle,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  ChevronDownSquare,
  Star,
  Mail,
  Hash,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AiDraftQuestion,
  normalizeDraftToBuilderQuestion,
} from "../../schemas/ai-import-schema";
import {
  BuilderQuestion,
  BuilderQuestionType,
} from "../../schemas/builder-definition-schema";
import { cn } from "@/lib/utils";

interface AiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  existingQuestionCount: number;
  onConfirmImport: (questions: BuilderQuestion[]) => void;
}

type ModalStep = "input" | "generating" | "review" | "error";

const QUESTION_TYPES: {
  value: BuilderQuestionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "SHORT_TEXT", label: "Short answer", icon: Type },
  { value: "LONG_TEXT", label: "Paragraph", icon: AlignLeft },
  { value: "MULTIPLE_CHOICE", label: "Multiple choice", icon: List },
  { value: "CHECKBOX", label: "Checkboxes", icon: CheckSquare },
  { value: "DROPDOWN", label: "Dropdown", icon: ChevronDownSquare },
  { value: "RATING", label: "Rating", icon: Star },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "PHONE", label: "Phone", icon: Phone },
  { value: "DATE", label: "Date", icon: Calendar },
];

const SAMPLE_TEMPLATES = [
  {
    name: "Customer Feedback",
    icon: "💬",
    text: `Customer Satisfaction & Experience Survey

1. What is your full name? *
2. What is your business email address? *
3. How long have you been using our product?
   - Less than a month
   - 1-6 months
   - 6-12 months
   - More than a year
4. How would you rate your overall experience? (1-5) *
5. Which features do you use the most? (Select all that apply)
   [ ] Form Builder
   [ ] AI Assistant
   [ ] Real-time Analytics
   [ ] Team Collaboration
   [ ] Export to CSV
6. What improvements or new features would you like to see?
7. How likely are you to recommend us to a colleague? (1-10)`,
  },
  {
    name: "Event Registration",
    icon: "🎟️",
    text: `Annual Developer Summit 2026 Registration

1. Attendee Full Name *
2. Work Email Address *
3. Contact Phone Number
4. What date will you be arriving?
5. Ticket Type:
   - Full Conference Pass (3 Days)
   - Workshop Only
   - Virtual Livestream Pass
6. Dietary restrictions or allergies:
   [ ] None
   [ ] Vegetarian
   [ ] Vegan
   [ ] Gluten-Free
   [ ] Halal / Kosher
7. T-shirt Size:
   - Small
   - Medium
   - Large
   - X-Large
8. Any special accessibility requests or notes?`,
  },
  {
    name: "Job Application",
    icon: "💼",
    text: `Software Engineer Application

1. Full Legal Name *
2. Email Address *
3. Phone Number *
4. Earliest Available Start Date
5. Years of professional software engineering experience *
6. Primary programming language:
   - TypeScript / JavaScript
   - Python
   - Go
   - Rust
   - Other
7. Do you require visa sponsorship?
   - Yes
   - No
8. Please share a brief summary of a project you are proud of:`,
  },
  {
    name: "Course Evaluation",
    icon: "🎓",
    text: `Course & Instructor Feedback Form

1. Student Name (optional)
2. What semester did you complete this course?
3. How would you rate the clarity of course materials? (1-5) *
4. How would you rate instructor responsiveness? (1-5) *
5. What was the most valuable topic covered in the syllabus?
6. Which learning formats worked best for you?
   [ ] Live interactive lectures
   [ ] Hands-on lab assignments
   [ ] Group projects
   [ ] Self-paced reading
7. Suggestions to improve this course in future terms:`,
  },
];

export function AiImportModal({
  isOpen,
  onClose,
  formId,
  existingQuestionCount,
  onConfirmImport,
}: AiImportModalProps) {
  const [step, setStep] = useState<ModalStep>("input");
  const [sourceText, setSourceText] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<AiDraftQuestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [generationTipIndex, setGenerationTipIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generationTips = [
    "Analyzing structure and extracting question prompts...",
    "Detecting field types (text, email, rating, choices)...",
    "Parsing multiple choice options and checkbox lists...",
    "Validating required status and question properties...",
  ];

  // Rotate hints during generating
  useEffect(() => {
    if (step !== "generating") return;
    const interval = setInterval(() => {
      setGenerationTipIndex((prev) => (prev + 1) % generationTips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [step, generationTips.length]);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setErrorMessage(null);
      setIsDiscardConfirmOpen(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleAttemptClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sourceText, draftQuestions, step]);

  if (!isOpen) return null;

  const hasUnsavedWork =
    (step === "input" && sourceText.trim().length > 0) ||
    (step === "review" && draftQuestions.length > 0);

  const handleAttemptClose = () => {
    if (step === "generating") return; // Don't interrupt in-flight generation
    if (hasUnsavedWork) {
      setIsDiscardConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setIsDiscardConfirmOpen(false);
    setSourceText("");
    setDraftQuestions([]);
    setStep("input");
    onClose();
  };

  const handleGenerate = async () => {
    const trimmed = sourceText.trim();
    if (trimmed.length < 5) return;

    setStep("generating");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/forms/${formId}/ai-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract questions from text.");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions could be extracted. Please check the text format.");
      }

      setDraftQuestions(data.questions);
      setStep("review");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setStep("error");
    }
  };

  // Safe client-side file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024) {
      setErrorMessage("File exceeds 50KB size limit. Please select a smaller text file.");
      setStep("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setSourceText(content);
        setErrorMessage(null);
        if (step === "error") setStep("input");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Could not read the selected file. Please paste text directly.");
      setStep("error");
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Review screen handlers
  const handleUpdateQuestion = (
    index: number,
    updates: Partial<AiDraftQuestion>
  ) => {
    setDraftQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== index) return q;
        const updated = { ...q, ...updates };
        // If type changed to choice without options, add defaults
        if (
          ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(updated.type) &&
          (!updated.options || updated.options.length === 0)
        ) {
          updated.options = [
            { id: `opt-${Date.now()}-1`, label: "Option 1", value: "option_1" },
            { id: `opt-${Date.now()}-2`, label: "Option 2", value: "option_2" },
          ];
          updated.needsAttention = false;
        }
        return updated;
      })
    );
  };

  const handleMoveQuestion = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= draftQuestions.length) return;
    setDraftQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setDraftQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = draftQuestions[index];
    if (!target) return;
    const duplicated: AiDraftQuestion = {
      ...target,
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `${target.label} (Copy)`,
      options: target.options?.map((opt, i) => ({
        ...opt,
        id: `opt-${Date.now()}-${i}`,
      })),
    };
    setDraftQuestions((prev) => [
      ...prev.slice(0, index + 1),
      duplicated,
      ...prev.slice(index + 1),
    ]);
  };

  const handleAddOptionToQuestion = (qIndex: number) => {
    setDraftQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentOpts = q.options || [];
        const nextNum = currentOpts.length + 1;
        const newOpt = {
          id: `opt-${Date.now()}-${nextNum}`,
          label: `Option ${nextNum}`,
          value: `option_${nextNum}`,
        };
        return {
          ...q,
          options: [...currentOpts, newOpt],
          needsAttention: false,
        };
      })
    );
  };

  const handleUpdateOption = (
    qIndex: number,
    optId: string,
    newLabel: string
  ) => {
    setDraftQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          options: (q.options || []).map((opt) =>
            opt.id === optId
              ? {
                  ...opt,
                  label: newLabel,
                  value:
                    newLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_") || opt.value,
                }
              : opt
          ),
        };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optId: string) => {
    setDraftQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const filtered = (q.options || []).filter((opt) => opt.id !== optId);
        return {
          ...q,
          options: filtered,
          needsAttention:
            filtered.length < 2
              ? true
              : q.needsAttention && filtered.length >= 2
              ? false
              : q.needsAttention,
        };
      })
    );
  };

  const handleAddNewQuestion = () => {
    const newDraft: AiDraftQuestion = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "New question",
      type: "SHORT_TEXT",
      description: null,
      required: false,
      settings: { placeholder: "Short answer text" },
    };
    setDraftQuestions((prev) => [...prev, newDraft]);
  };

  const handleCommitImport = () => {
    if (draftQuestions.length === 0) return;
    const normalized = draftQuestions.map((draft, idx) =>
      normalizeDraftToBuilderQuestion(draft, idx)
    );
    onConfirmImport(normalized);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={handleAttemptClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-import-dialog-title"
      >
        {/* Modal Window */}
        <div
          className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#121417] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-[#27272A] flex flex-col overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between shrink-0 bg-white dark:bg-[#121417]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#563BFA]/20 flex items-center justify-center text-[#563BFA] dark:text-[#C4B5FD] shrink-0 border border-[#DDD2FF]/60 dark:border-[#563BFA]/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="ai-import-dialog-title"
                  className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
                >
                  <span>Import with AI</span>
                  {step === "review" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#563BFA]/10 text-[#563BFA] dark:text-[#a594fd] border border-[#563BFA]/20 font-medium">
                      {draftQuestions.length} draft question{draftQuestions.length === 1 ? "" : "s"}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {step === "review"
                    ? "Review and customize extracted questions before adding them to your form."
                    : "Paste source material or documents to automatically extract form questions."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              disabled={step === "generating"}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181B20] transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* STEP 1: INPUT */}
            {step === "input" && (
              <div className="space-y-4">
                {/* Guidelines Banner */}
                <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-800 dark:text-violet-300 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-violet-900 dark:text-violet-200">
                      Paste existing text, questionnaire, or exam outline
                    </p>
                    <p className="text-[11px] text-violet-700/90 dark:text-violet-300/80 leading-relaxed">
                      AI extracts question titles, detects types (text, email, rating, multiple choice, dates), and identifies choices and required flags. Nothing is added to your form until you review and confirm.
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <label
                      htmlFor="ai-source-input"
                      className="font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Source Text
                    </label>
                    <div className="flex items-center gap-3">
                      {sourceText.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSourceText("")}
                          className="text-[11px] text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                      <span className="font-mono text-[11px]">
                        {sourceText.length.toLocaleString()} / 50,000
                      </span>
                    </div>
                  </div>

                  <textarea
                    id="ai-source-input"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={`Paste survey text, interview questions, or application fields here. For example:

1. What is your full name? *
2. What is your business email address? *
3. How would you rate your overall experience? (1-5)
4. Which departments did you interact with?
   [ ] Support
   [ ] Sales
   [ ] Engineering
   [ ] Billing
5. Any additional feedback or comments?`}
                    className="w-full h-56 p-3.5 text-xs font-mono rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0B0D11] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#563BFA] dark:focus:ring-[#8E7CFD] resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* File Upload Dropzone + Sample Templates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Text File Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl border border-dashed border-[#D1D5DB] dark:border-[#33373E] hover:border-[#563BFA] dark:hover:border-[#563BFA] bg-neutral-50/60 dark:bg-[#181B20]/40 flex items-center gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#20242B] border border-[#E5E7EB] dark:border-[#2E333B] flex items-center justify-center text-neutral-500 group-hover:text-[#563BFA] transition-colors shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-[#563BFA] dark:group-hover:text-[#a594fd] transition-colors">
                        Upload text document
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        .txt, .md, .csv, .json (max 50KB)
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.markdown,.csv,.json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Sample Templates Quick-Pick */}
                  <div className="p-3 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50/40 dark:bg-[#181B20]/20 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                      Try a starter template
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_TEMPLATES.map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          onClick={() => {
                            setSourceText(sample.text);
                            setErrorMessage(null);
                          }}
                          className="px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-[#1E2229] border border-[#E5E7EB] dark:border-[#2E333B] hover:border-[#563BFA] hover:text-[#563BFA] dark:hover:text-[#a594fd] text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{sample.icon}</span>
                          <span>{sample.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GENERATING PROGRESS */}
            {step === "generating" && (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] dark:bg-[#563BFA]/20 border border-[#DDD2FF] dark:border-[#563BFA]/30 flex items-center justify-center text-[#563BFA] dark:text-[#C4B5FD] animate-pulse">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <Loader2 className="w-6 h-6 text-[#563BFA] absolute -top-1 -right-1 animate-spin" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Generating Draft Questions
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 transition-all duration-300 min-h-8">
                    {generationTips[generationTipIndex]}
                  </p>
                </div>

                <div className="w-48 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-[#563BFA] rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-2/3" />
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW DRAFT */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Draft Summary Banner */}
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong>{draftQuestions.length}</strong> questions extracted. Review, edit, or reorder them below.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewQuestion}
                    className="text-[11px] font-medium text-[#563BFA] dark:text-[#a594fd] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add question</span>
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {draftQuestions.map((q, idx) => {
                    const isChoice = [
                      "MULTIPLE_CHOICE",
                      "CHECKBOX",
                      "DROPDOWN",
                    ].includes(q.type);

                    return (
                      <div
                        key={q.id || idx}
                        className={cn(
                          "p-4 rounded-xl border bg-white dark:bg-[#15181E] space-y-3 transition-all",
                          q.needsAttention
                            ? "border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-300/30"
                            : "border-[#E5E7EB] dark:border-[#27272A]"
                        )}
                      >
                        {/* Card Header: Q# + Type Selector + Required + Actions */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#20242C] text-neutral-600 dark:text-neutral-300 border border-[#E5E7EB] dark:border-[#2E333B]">
                              Q{idx + 1}
                            </span>

                            {/* Question Type Selector */}
                            <select
                              value={q.type}
                              onChange={(e) =>
                                handleUpdateQuestion(idx, {
                                  type: e.target.value as BuilderQuestionType,
                                })
                              }
                              className="text-xs font-mono h-7 px-2 rounded-lg border border-[#E5E7EB] dark:border-[#2E333B] bg-neutral-50 dark:bg-[#1E222A] text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#563BFA]"
                            >
                              {QUESTION_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Required Switch */}
                            <label className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
                              <span>Required</span>
                              <Switch
                                checked={q.required}
                                onCheckedChange={(val) =>
                                  handleUpdateQuestion(idx, { required: val })
                                }
                              />
                            </label>

                            {/* Move Up */}
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, idx + 1)}
                              disabled={idx === draftQuestions.length - 1}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(idx)}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                              title="Duplicate question"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Attention warning banner if needed */}
                        {q.needsAttention && (
                          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>
                              {q.attentionReason ||
                                "Please review this question details before importing."}
                            </span>
                          </div>
                        )}

                        {/* Title input */}
                        <div>
                          <input
                            type="text"
                            value={q.label}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, { label: e.target.value })
                            }
                            placeholder="Question title"
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2E333B] bg-white dark:bg-[#101216] text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-[#563BFA]"
                          />
                        </div>

                        {/* Optional description input */}
                        <div>
                          <input
                            type="text"
                            value={q.description || ""}
                            onChange={(e) =>
                              handleUpdateQuestion(idx, {
                                description: e.target.value || null,
                              })
                            }
                            placeholder="Add description or instructions (optional)"
                            className="w-full text-[11px] px-2.5 py-1 rounded-lg border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#2E333B] focus:border-[#E5E7EB] dark:focus:border-[#2E333B] bg-transparent text-neutral-500 dark:text-neutral-400 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-[#563BFA]"
                          />
                        </div>

                        {/* Options Editor for Choice Questions */}
                        {isChoice && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                              Options:
                            </span>
                            <div className="space-y-1.5">
                              {(q.options || []).map((opt) => (
                                <div
                                  key={opt.id}
                                  className="flex items-center gap-1.5"
                                >
                                  <div className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600 shrink-0" />
                                  <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) =>
                                      handleUpdateOption(
                                        idx,
                                        opt.id,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 text-xs px-2 py-1 rounded border border-[#E5E7EB] dark:border-[#2E333B] bg-neutral-50 dark:bg-[#101216] text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#563BFA]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveOption(idx, opt.id)
                                    }
                                    disabled={(q.options || []).length <= 1}
                                    className="p-1 text-neutral-400 hover:text-rose-500 disabled:opacity-20 transition-colors"
                                    title="Remove option"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddOptionToQuestion(idx)}
                                className="text-[11px] font-medium text-[#563BFA] dark:text-[#a594fd] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add option</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Rating scale editor */}
                        {q.type === "RATING" && (
                          <div className="flex items-center gap-3 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
                            <span>Rating scale:</span>
                            <div className="flex items-center gap-1.5">
                              {[5, 10].map((scale) => (
                                <button
                                  key={scale}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateQuestion(idx, {
                                      settings: {
                                        ...q.settings,
                                        minRating: 1,
                                        maxRating: scale,
                                      },
                                    })
                                  }
                                  className={cn(
                                    "px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer",
                                    (q.settings?.maxRating || 5) === scale
                                      ? "bg-[#563BFA] text-white border-[#563BFA]"
                                      : "bg-neutral-50 dark:bg-[#1E222A] text-neutral-600 dark:text-neutral-400 border-[#E5E7EB] dark:border-[#2E333B]"
                                  )}
                                >
                                  1 to {scale}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Import Destination Notice */}
                <div className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-800 dark:text-violet-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>
                      Importing will append <strong>{draftQuestions.length}</strong> new questions after your current {existingQuestionCount} questions.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ERROR / RETRY */}
            {step === "error" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Import could not be completed
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {errorMessage ||
                      "Failed to extract questions. Please check your source material and try again."}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Edit source text
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    className="text-xs rounded-xl h-8 px-3 bg-[#563BFA] hover:bg-[#4830d9] text-white"
                  >
                    Retry generation
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between shrink-0 bg-neutral-50/60 dark:bg-[#121417]">
            {step === "input" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAttemptClose}
                  className="text-xs rounded-xl h-8 px-3"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={sourceText.trim().length < 5}
                  className="text-xs rounded-xl h-8 px-4 bg-[#563BFA] hover:bg-[#4830d9] text-white gap-1.5 font-medium shadow-none cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Questions</span>
                </Button>
              </>
            )}

            {step === "generating" && (
              <div className="w-full flex items-center justify-end">
                <span className="text-xs text-neutral-400">Processing...</span>
              </div>
            )}

            {step === "review" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="text-xs rounded-xl h-8 px-3 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Source</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAttemptClose}
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={draftQuestions.length === 0}
                    className="text-xs rounded-xl h-8 px-4 bg-[#563BFA] hover:bg-[#4830d9] text-white gap-1.5 font-medium shadow-none cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Import {draftQuestions.length} Question{draftQuestions.length === 1 ? "" : "s"}
                    </span>
                  </Button>
                </div>
              </>
            )}

            {step === "error" && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleAttemptClose}
                className="text-xs rounded-xl h-8 px-3"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {isDiscardConfirmOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setIsDiscardConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#121417] rounded-xl p-5 shadow-2xl border border-[#E5E7EB] dark:border-[#27272A] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Discard draft questions?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Your source text and any unimported draft questions will be lost. Your form will remain unchanged.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDiscardConfirmOpen(false)}
                className="text-xs rounded-lg h-7 px-3"
              >
                Keep editing
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDiscard}
                className="text-xs rounded-lg h-7 px-3 bg-rose-600 hover:bg-rose-700 text-white"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
