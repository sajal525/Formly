"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { BuilderTopbar } from "./builder-topbar";
import { BuilderTabs, BuilderTab } from "./builder-tabs";
import { FormHeaderEditor } from "./form-header-editor";
import { QuestionList } from "./question-list";
import { QuickActionsToolbar } from "./quick-actions-toolbar";
import { QuestionSettingsPanel } from "./question-settings-panel";
import { ThemeWorkspace } from "@/features/forms/themes/components/theme-workspace";
import { ThemeOverrides } from "@/features/forms/themes/schema";
import { FormSettingsPanel } from "./form-settings-panel";
import { PreviewWorkspace } from "./preview/preview-workspace";
import { PublishReviewDialog } from "./publish-review-dialog";
import { useBuilderHistory } from "../hooks/use-builder-history";
import { useDraftAutosave } from "../hooks/use-draft-autosave";
import {
  BuilderFormDefinition,
  BuilderQuestion,
  FormSettings,
} from "../schemas/builder-definition-schema";
import { FormDraftDTO } from "../server/get-form-draft";

interface BuilderShellProps {
  initialDraft: FormDraftDTO;
  user?: {
    id: string;
    username: string;
    displayName: string;
  };
}

export function BuilderShell({ initialDraft, user }: BuilderShellProps) {
  const [activeTab, setActiveTabState] = useState<BuilderTab>("questions");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as BuilderTab | null;
      if (
        tabParam &&
        ["questions", "theme", "settings", "preview"].includes(tabParam)
      ) {
        setActiveTabState(tabParam);
      }
    }
  }, []);

  const setActiveTab = useCallback((newTab: BuilderTab) => {
    setActiveTabState(newTab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("tab", newTab);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, []);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    initialDraft.definition.questions?.[0]?.id || null
  );
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const headerCardRef = useRef<HTMLDivElement>(null);

  // In-memory Undo / Redo history
  const {
    state: definition,
    set: setDefinitionWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBuilderHistory(initialDraft.definition, 50);

  // Cloud debounced autosave
  const {
    status: autosaveStatus,
    lastSavedAt,
    saveNow,
  } = useDraftAutosave({
    formId: initialDraft.id,
    definition,
    initialRevision: initialDraft.draftRevision,
  });

  // Global keyboard shortcuts (Undo / Redo)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Form title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        title: newTitle,
      }));
    },
    [setDefinitionWithHistory]
  );

  // Form description change
  const handleDescriptionChange = useCallback(
    (newDesc: string) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        description: newDesc,
      }));
    },
    [setDefinitionWithHistory]
  );

  // Add question
  const handleAddQuestion = useCallback(() => {
    const newId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const questions = definition.questions || [];
    const newQuestion: BuilderQuestion = {
      id: newId,
      type: "SHORT_TEXT",
      label: "Untitled question",
      description: null,
      required: false,
      settings: {
        placeholder: "Short answer text",
      },
    };

    let nextQuestions: BuilderQuestion[];
    if (selectedQuestionId) {
      const idx = questions.findIndex((q) => q.id === selectedQuestionId);
      if (idx !== -1) {
        nextQuestions = [
          ...questions.slice(0, idx + 1),
          newQuestion,
          ...questions.slice(idx + 1),
        ];
      } else {
        nextQuestions = [...questions, newQuestion];
      }
    } else {
      nextQuestions = [...questions, newQuestion];
    }

    setDefinitionWithHistory((prev) => ({
      ...prev,
      questions: nextQuestions,
    }));
    setSelectedQuestionId(newId);
  }, [definition.questions, selectedQuestionId, setDefinitionWithHistory]);

  // Update question
  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<BuilderQuestion>) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        questions: (prev.questions || []).map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      }));
    },
    [setDefinitionWithHistory]
  );

  // Duplicate question
  const handleDuplicateQuestion = useCallback(
    (questionId: string) => {
      const questions = definition.questions || [];
      const source = questions.find((q) => q.id === questionId);
      if (!source) return;

      const newId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duplicated: BuilderQuestion = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        label: `${source.label} (Copy)`,
      };

      const sourceIdx = questions.findIndex((q) => q.id === questionId);
      const nextQuestions = [
        ...questions.slice(0, sourceIdx + 1),
        duplicated,
        ...questions.slice(sourceIdx + 1),
      ];

      setDefinitionWithHistory((prev) => ({
        ...prev,
        questions: nextQuestions,
      }));
      setSelectedQuestionId(newId);
    },
    [definition.questions, setDefinitionWithHistory]
  );

  // Delete question
  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      const questions = definition.questions || [];
      const nextQuestions = questions.filter((q) => q.id !== questionId);

      setDefinitionWithHistory((prev) => ({
        ...prev,
        questions: nextQuestions,
      }));

      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(nextQuestions[0]?.id || null);
      }
    },
    [definition.questions, selectedQuestionId, setDefinitionWithHistory]
  );

  // Reorder questions
  const handleReorderQuestions = useCallback(
    (reordered: BuilderQuestion[]) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        questions: reordered,
      }));
    },
    [setDefinitionWithHistory]
  );

  // Theme select
  const handleThemeSelect = useCallback(
    (themeKey: string) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        themeKey,
      }));
    },
    [setDefinitionWithHistory]
  );

  // Theme overrides change
  const handleThemeOverridesChange = useCallback(
    (updates: Partial<ThemeOverrides>) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        themeOverrides: {
          ...(prev.themeOverrides || {}),
          ...updates,
        },
      }));
    },
    [setDefinitionWithHistory]
  );

  // Reset theme overrides to defaults
  const handleResetThemeOverrides = useCallback(() => {
    setDefinitionWithHistory((prev) => {
      const next = { ...prev };
      delete next.themeOverrides;
      return next;
    });
  }, [setDefinitionWithHistory]);

  // Settings change
  const handleSettingsChange = useCallback(
    (updatedSettings: Partial<FormSettings>) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...updatedSettings,
        },
      }));
    },
    [setDefinitionWithHistory]
  );

  // Jump to header card
  const handleFocusHeader = useCallback(() => {
    setSelectedQuestionId(null);
    headerCardRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const selectedQuestion =
    definition.questions?.find((q) => q.id === selectedQuestionId) || null;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex w-full bg-[var(--page-bg,#F8F9FA)] text-[var(--body-text,#1E293B)] transition-colors duration-200">
      {/* Shared Formly Left Sidebar (about 244-250px) */}
      <div className="hidden lg:block h-full shrink-0 z-40">
        <AppSidebar />
      </div>

      {/* Main Builder Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Editor Topbar */}
        <BuilderTopbar
          formId={initialDraft.id}
          title={definition.title || "Untitled form"}
          onTitleChange={handleTitleChange}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onPublishClick={() => setIsPublishDialogOpen(true)}
          isPublished={initialDraft.status === "PUBLISHED"}
          user={user}
        />

        {/* Editor Navigation Tabs */}
        <BuilderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          questionCount={definition.questions?.length || 0}
        />

        {/* Tab View Body */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/60 dark:bg-slate-950/60">
          {activeTab === "questions" && (
            <div className="h-full flex flex-col lg:flex-row min-w-0">
              {/* Central Canvas Area */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto flex items-start gap-4">
                  {/* Central Stack: Header + Question Cards */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div ref={headerCardRef}>
                      <FormHeaderEditor
                        title={definition.title || "Untitled form"}
                        description={definition.description}
                        onTitleChange={handleTitleChange}
                        onDescriptionChange={handleDescriptionChange}
                        isSelected={selectedQuestionId === null}
                        onSelect={() => setSelectedQuestionId(null)}
                      />
                    </div>

                    <QuestionList
                      questions={definition.questions || []}
                      selectedQuestionId={selectedQuestionId}
                      onSelectQuestion={setSelectedQuestionId}
                      onUpdateQuestion={handleUpdateQuestion}
                      onDuplicateQuestion={handleDuplicateQuestion}
                      onDeleteQuestion={handleDeleteQuestion}
                      onReorderQuestions={handleReorderQuestions}
                      onAddQuestion={handleAddQuestion}
                    />
                  </div>

                  {/* Floating Quick Actions Toolbar on Right of Canvas */}
                  <div className="sticky top-6 hidden sm:block">
                    <QuickActionsToolbar
                      onAddQuestion={handleAddQuestion}
                      onFocusHeader={handleFocusHeader}
                    />
                  </div>
                </div>
              </main>

              {/* Contextual Question Settings Panel */}
              <div className="shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10">
                <QuestionSettingsPanel
                  question={selectedQuestion}
                  onClose={() => setSelectedQuestionId(null)}
                  onChange={(updates) => {
                    if (selectedQuestionId) {
                      handleUpdateQuestion(selectedQuestionId, updates);
                    }
                  }}
                  onDuplicate={() => {
                    if (selectedQuestionId) {
                      handleDuplicateQuestion(selectedQuestionId);
                    }
                  }}
                  onDelete={() => {
                    if (selectedQuestionId) {
                      handleDeleteQuestion(selectedQuestionId);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <ThemeWorkspace
              definition={definition}
              onThemeSelect={handleThemeSelect}
              onThemeOverridesChange={handleThemeOverridesChange}
              onResetOverrides={handleResetThemeOverrides}
            />
          )}

          {activeTab === "settings" && (
            <FormSettingsPanel
              formId={initialDraft.id}
              definition={definition}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              onSettingsChange={handleSettingsChange}
            />
          )}

          {activeTab === "preview" && (
            <PreviewWorkspace
              formId={initialDraft.id}
              definition={definition}
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </div>

      {/* Publish Review Modal */}
      <PublishReviewDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        formId={initialDraft.id}
        definition={definition}
        onPublishSuccess={() => {
          saveNow();
        }}
      />
    </div>
  );
}
