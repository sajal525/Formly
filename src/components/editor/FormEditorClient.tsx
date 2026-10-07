"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorTopBar } from "./EditorTopBar";
import { EditorTabs, EditorTabType } from "./EditorTabs";
import { QuestionsTab } from "./QuestionsTab";
import { ResponsesTab } from "./ResponsesTab";
import { SettingsTab } from "./SettingsTab";
import { ThemeDrawer } from "./ThemeDrawer";
import { SendModal } from "./SendModal";
import {
  FormEditorData,
  SectionData,
  QuestionData,
  OptionData,
} from "../../server/forms.queries";
import { FolderRecord } from "../../server/folders.queries";
import {
  updateFormMetaAction,
  addQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  duplicateQuestionAction,
  saveOptionsAction,
  addSectionAction,
  deleteSectionAction,
  updateSectionAction,
} from "../../server/forms.editor.actions";

interface FormEditorClientProps {
  initialData: FormEditorData;
  folders: FolderRecord[];
}

export function FormEditorClient({ initialData, folders }: FormEditorClientProps) {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<EditorTabType>("questions");
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "idle">("idle");
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  // Form metadata
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || "");
  const [isStarred, setIsStarred] = useState(initialData.isStarred);
  const [isQuiz, setIsQuiz] = useState(initialData.isQuiz);
  const [isAcceptingResponses, setIsAcceptingResponses] = useState(
    initialData.isAcceptingResponses
  );
  const [folderId, setFolderId] = useState<string | null | undefined>(
    initialData.folderId
  );
  const [theme, setTheme] = useState(initialData.theme);
  const [settings, setSettings] = useState(initialData.settings);

  // Sections & Questions
  const [sections, setSections] = useState<SectionData[]>(initialData.sections);
  const [questions, setQuestions] = useState<QuestionData[]>(initialData.questions);

  // Debounced autosave ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  function triggerSave() {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saved");
    }, 1200);
  }

  // Handle Title Change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      triggerSave();
      updateFormMetaAction(initialData.id, { title: newTitle });
    },
    [initialData.id]
  );

  // Handle Description Change
  const handleDescriptionChange = useCallback(
    (newDesc: string) => {
      setDescription(newDesc);
      triggerSave();
      updateFormMetaAction(initialData.id, { description: newDesc });
    },
    [initialData.id]
  );

  // Toggle Star
  const handleToggleStar = useCallback(async () => {
    const nextVal = !isStarred;
    setIsStarred(nextVal);
    triggerSave();
    await updateFormMetaAction(initialData.id, { isStarred: nextVal });
  }, [initialData.id, isStarred]);

  // Move Folder
  const handleMoveFolder = useCallback(
    async (targetFolderId: string | null) => {
      setFolderId(targetFolderId);
      triggerSave();
      await updateFormMetaAction(initialData.id, { folderId: targetFolderId });
    },
    [initialData.id]
  );

  // Update Theme
  const handleUpdateTheme = useCallback(
    async (newTheme: any) => {
      setTheme(newTheme);
      triggerSave();
      await updateFormMetaAction(initialData.id, { theme: newTheme });
    },
    [initialData.id]
  );

  // Update Settings
  const handleUpdateSettings = useCallback(
    async (newSettings: any) => {
      setSettings(newSettings);
      triggerSave();
      await updateFormMetaAction(initialData.id, { settings: newSettings });
    },
    [initialData.id]
  );

  // Update Quiz Mode
  const handleUpdateQuiz = useCallback(
    async (val: boolean) => {
      setIsQuiz(val);
      triggerSave();
      await updateFormMetaAction(initialData.id, { isQuiz: val });
    },
    [initialData.id]
  );

  // Toggle Accepting Responses
  const handleToggleAcceptingResponses = useCallback(
    async (val: boolean) => {
      setIsAcceptingResponses(val);
      triggerSave();
      await updateFormMetaAction(initialData.id, { isAcceptingResponses: val });
    },
    [initialData.id]
  );

  // Section Operations
  const handleAddSection = useCallback(async () => {
    triggerSave();
    const sortOrder = sections.length;
    const res = await addSectionAction(initialData.id, sortOrder);
    if (res.success && res.section) {
      setSections((prev) => [...prev, res.section as SectionData]);
    }
  }, [initialData.id, sections.length]);

  const handleUpdateSection = useCallback(
    async (sectionId: string, data: Partial<SectionData>) => {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, ...data } : s))
      );
      triggerSave();
      await updateSectionAction(sectionId, data);
    },
    []
  );

  const handleDeleteSection = useCallback(
    async (sectionId: string) => {
      if (sections.length <= 1) return;
      if (confirm("Delete this section and merge its questions?")) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        // Relink questions to first remaining section
        const remainingFirst = sections.find((s) => s.id !== sectionId);
        if (remainingFirst) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.sectionId === sectionId
                ? { ...q, sectionId: remainingFirst.id }
                : q
            )
          );
        }
        triggerSave();
      }
    },
    [sections]
  );

  // Question Operations
  const handleAddQuestion = useCallback(
    async (sectionId: string) => {
      triggerSave();
      const nextSort = questions.length;
      const res = await addQuestionAction(initialData.id, sectionId, nextSort);
      if (res.success && res.question) {
        setQuestions((prev) => [...prev, res.question as QuestionData]);
      }
    },
    [initialData.id, questions.length]
  );

  const handleUpdateQuestion = useCallback(
    async (questionId: string, data: Partial<QuestionData>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...data } : q))
      );
      triggerSave();
      await updateQuestionAction(questionId, data);
    },
    []
  );

  const handleUpdateOptions = useCallback(
    async (questionId: string, newOptions: OptionData[]) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, options: newOptions } : q
        )
      );
      triggerSave();
      await saveOptionsAction(questionId, newOptions);
    },
    []
  );

  const handleDuplicateQuestion = useCallback(
    async (questionId: string) => {
      triggerSave();
      const res = await duplicateQuestionAction(questionId);
      if (res.success && res.question) {
        setQuestions((prev) => {
          const idx = prev.findIndex((q) => q.id === questionId);
          const nextList = [...prev];
          nextList.splice(idx + 1, 0, res.question as QuestionData);
          return nextList;
        });
      }
    },
    []
  );

  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      triggerSave();
      await deleteQuestionAction(questionId);
    },
    []
  );

  function handlePreview() {
    window.open(`/forms/${initialData.id}/preview`, "_blank");
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
      {/* Top Bar */}
      <EditorTopBar
        formId={initialData.id}
        title={title}
        isStarred={isStarred}
        folderId={folderId}
        saveStatus={saveStatus}
        folders={folders}
        onTitleChange={handleTitleChange}
        onToggleStar={handleToggleStar}
        onMoveFolder={handleMoveFolder}
        onOpenTheme={() => setThemeDrawerOpen(true)}
        onOpenSend={() => setSendModalOpen(true)}
        onPreview={handlePreview}
      />

      {/* Navigation Tabs */}
      <EditorTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        responseCount={initialData.responseCount}
      />

      {/* Tab Panels */}
      <main style={{ flex: 1 }}>
        {activeTab === "questions" && (
          <QuestionsTab
            title={title}
            description={description}
            sections={sections}
            questions={questions}
            isQuiz={isQuiz}
            accentColor={theme?.color || "#7C3AED"}
            onUpdateTitle={handleTitleChange}
            onUpdateDescription={handleDescriptionChange}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onAddSection={handleAddSection}
            onUpdateQuestion={handleUpdateQuestion}
            onUpdateOptions={handleUpdateOptions}
            onAddQuestion={handleAddQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {activeTab === "responses" && (
          <ResponsesTab
            formId={initialData.id}
            responseCount={initialData.responseCount}
            isAcceptingResponses={isAcceptingResponses}
            questions={questions}
            onToggleAcceptingResponses={handleToggleAcceptingResponses}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            isQuiz={isQuiz}
            settings={settings}
            onUpdateQuiz={handleUpdateQuiz}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Theme Drawer */}
      <ThemeDrawer
        open={themeDrawerOpen}
        theme={theme}
        onClose={() => setThemeDrawerOpen(false)}
        onUpdateTheme={handleUpdateTheme}
      />

      {/* Send Modal */}
      <SendModal
        open={sendModalOpen}
        formId={initialData.id}
        onClose={() => setSendModalOpen(false)}
      />
    </div>
  );
}
