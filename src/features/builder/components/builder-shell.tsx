"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { BuilderTopbar } from "./builder-topbar";
import { BuilderTabs, BuilderTab } from "./builder-tabs";
import { FormHeaderEditor } from "./form-header-editor";
import { QuestionList } from "./question-list";
import { QuickActionsToolbar } from "./quick-actions-toolbar";
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
  BuilderContentBlock,
  BuilderQuestionBlock,
  BuilderImageBlock,
  BuilderCoverImage,
  ensureDefinitionBlocks,
  syncBlocksAndQuestions,
  FormSettings,
} from "../schemas/builder-definition-schema";
import { FormDraftDTO } from "../server/get-form-draft";
import { ImageUploadModal } from "./image-block/image-upload-modal";
import { CoverImageEditorModal } from "./cover-image/cover-image-editor-modal";

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

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialDraft.definition.blocks?.[0]?.id ||
      initialDraft.definition.questions?.[0]?.id ||
      null
  );
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [editingImageBlock, setEditingImageBlock] = useState<BuilderImageBlock | null>(null);
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);
  const [coverEditorFile, setCoverEditorFile] = useState<File | null>(null);
  const [coverEditorPreviewUrl, setCoverEditorPreviewUrl] = useState<string | null>(null);

  const handleSelectCoverFile = useCallback((file: File) => {
    setCoverEditorFile(file);
    setCoverEditorPreviewUrl(null);
    setIsCoverEditorOpen(true);
  }, []);

  const handleOpenCoverEditor = useCallback(() => {
    setCoverEditorFile(null);
    setCoverEditorPreviewUrl(null);
    setIsCoverEditorOpen(true);
  }, []);

  const handleCloseCoverEditor = useCallback(() => {
    setIsCoverEditorOpen(false);
    setCoverEditorFile(null);
    setCoverEditorPreviewUrl(null);
  }, []);

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
    error: autosaveError,
    lastSavedAt,
    saveNow,
    retry: retryAutosave,
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
    const newBlock: BuilderQuestionBlock = {
      id: newId,
      kind: "question",
      question: newQuestion,
    };

    setDefinitionWithHistory((prev) => {
      const blocks = ensureDefinitionBlocks(prev);
      let nextBlocks: BuilderContentBlock[];

      if (selectedBlockId) {
        const idx = blocks.findIndex((b) => b.id === selectedBlockId);
        if (idx !== -1) {
          nextBlocks = [
            ...blocks.slice(0, idx + 1),
            newBlock,
            ...blocks.slice(idx + 1),
          ];
        } else {
          nextBlocks = [...blocks, newBlock];
        }
      } else {
        nextBlocks = [...blocks, newBlock];
      }

      const synced = syncBlocksAndQuestions(nextBlocks);
      return {
        ...prev,
        blocks: synced.blocks,
        questions: synced.questions,
      };
    });
    setSelectedBlockId(newId);
  }, [selectedBlockId, setDefinitionWithHistory]);

  // Insert newly confirmed image block
  const handleInsertImage = useCallback(
    (newImageBlock: BuilderImageBlock) => {
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev);
        let nextBlocks: BuilderContentBlock[];

        if (selectedBlockId) {
          const idx = blocks.findIndex((b) => b.id === selectedBlockId);
          if (idx !== -1) {
            nextBlocks = [
              ...blocks.slice(0, idx + 1),
              newImageBlock,
              ...blocks.slice(idx + 1),
            ];
          } else {
            nextBlocks = [...blocks, newImageBlock];
          }
        } else {
          nextBlocks = [...blocks, newImageBlock];
        }

        const synced = syncBlocksAndQuestions(nextBlocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });
      setSelectedBlockId(newImageBlock.id);
    },
    [selectedBlockId, setDefinitionWithHistory]
  );

  // Update question
  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<BuilderQuestion>) => {
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev).map((b) => {
          if (b.kind === "question" && b.id === questionId) {
            return {
              ...b,
              question: { ...b.question, ...updates },
            };
          }
          return b;
        });
        const synced = syncBlocksAndQuestions(blocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });
    },
    [setDefinitionWithHistory]
  );

  // Update image block
  const handleUpdateImageBlock = useCallback(
    (blockId: string, updates: Partial<BuilderImageBlock>) => {
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev).map((b) => {
          if (b.kind === "image" && b.id === blockId) {
            return { ...b, ...updates };
          }
          return b;
        });
        const synced = syncBlocksAndQuestions(blocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });
    },
    [setDefinitionWithHistory]
  );

  // Save existing image block adjustments from modal
  const handleSaveExistingImageBlock = useCallback(
    (updatedBlock: BuilderImageBlock) => {
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev).map((b) => {
          if (b.kind === "image" && b.id === updatedBlock.id) {
            return updatedBlock;
          }
          return b;
        });
        const synced = syncBlocksAndQuestions(blocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });
    },
    [setDefinitionWithHistory]
  );

  // Open adjustment modal for existing image
  const handleEditImage = useCallback((block: BuilderImageBlock) => {
    setEditingImageBlock(block);
    setIsImageUploadOpen(true);
  }, []);

  // Duplicate block (question or image)
  const handleDuplicateBlock = useCallback(
    (blockId: string) => {
      let createdId = "";
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev);
        const sourceIdx = blocks.findIndex((b) => b.id === blockId);
        if (sourceIdx === -1) return prev;
        const source = blocks[sourceIdx];

        const newId = `${source.kind === "image" ? "img" : "q"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        createdId = newId;

        let duplicatedBlock: BuilderContentBlock;
        if (source.kind === "image") {
          duplicatedBlock = {
            ...JSON.parse(JSON.stringify(source)),
            id: newId,
          };
        } else {
          duplicatedBlock = {
            id: newId,
            kind: "question",
            question: {
              ...JSON.parse(JSON.stringify(source.question)),
              id: newId,
              label: `${source.question.label} (Copy)`,
            },
          };
        }

        const nextBlocks = [
          ...blocks.slice(0, sourceIdx + 1),
          duplicatedBlock,
          ...blocks.slice(sourceIdx + 1),
        ];

        const synced = syncBlocksAndQuestions(nextBlocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });

      if (createdId) {
        setSelectedBlockId(createdId);
      }
    },
    [setDefinitionWithHistory]
  );

  // Delete block (question or image)
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      let nextSelectedId: string | null = null;
      setDefinitionWithHistory((prev) => {
        const blocks = ensureDefinitionBlocks(prev);
        const nextBlocks = blocks.filter((b) => b.id !== blockId);
        if (selectedBlockId === blockId) {
          nextSelectedId = nextBlocks[0]?.id || null;
        }
        const synced = syncBlocksAndQuestions(nextBlocks);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });

      if (selectedBlockId === blockId) {
        setSelectedBlockId(nextSelectedId);
      }
    },
    [selectedBlockId, setDefinitionWithHistory]
  );

  // Reorder blocks
  const handleReorderBlocks = useCallback(
    (reordered: BuilderContentBlock[]) => {
      setDefinitionWithHistory((prev) => {
        const synced = syncBlocksAndQuestions(reordered);
        return {
          ...prev,
          blocks: synced.blocks,
          questions: synced.questions,
        };
      });
    },
    [setDefinitionWithHistory]
  );

  // Cover image handlers
  const handleSaveCoverImage = useCallback(
    (cover: BuilderCoverImage) => {
      setDefinitionWithHistory((prev) => ({
        ...prev,
        coverImage: cover,
      }));
      setTimeout(() => {
        saveNow();
      }, 50);
    },
    [setDefinitionWithHistory, saveNow]
  );

  const handleRemoveCoverImage = useCallback(() => {
    setDefinitionWithHistory((prev) => {
      const next = { ...prev };
      delete next.coverImage;
      return next;
    });
  }, [setDefinitionWithHistory]);

  // Theme select
  const handleThemeSelect = useCallback(
    (themeKey: string) => {
      setDefinitionWithHistory((prev) => {
        const isSwitchingToNothing = themeKey === "nothing";
        return {
          ...prev,
          themeKey,
          ...(isSwitchingToNothing ? { themeOverrides: undefined } : {}),
        };
      });
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
    setSelectedBlockId(null);
    headerCardRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const contentBlocks = ensureDefinitionBlocks(definition);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex w-full bg-[#FAFAFA] dark:bg-[#090A0B] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Shared Formly Left Sidebar */}
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
          autosaveError={autosaveError}
          onRetryAutosave={retryAutosave}
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
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#FAFAFA] dark:bg-[#090A0B]">
          {activeTab === "questions" && (
            <main className="h-full w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto flex items-start gap-4 lg:gap-6">
                {/* Central Stack: Header + Question Cards */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div ref={headerCardRef}>
                    <FormHeaderEditor
                      title={definition.title ?? ""}
                      description={definition.description}
                      onTitleChange={handleTitleChange}
                      onDescriptionChange={handleDescriptionChange}
                      isSelected={selectedBlockId === null}
                      onSelect={() => setSelectedBlockId(null)}
                      coverImage={definition.coverImage}
                      onSelectCoverFile={handleSelectCoverFile}
                      onOpenCoverEditor={handleOpenCoverEditor}
                      onOpenCoverUpload={handleOpenCoverEditor}
                      onRemoveCoverImage={handleRemoveCoverImage}
                      formId={initialDraft.id}
                    />
                  </div>

                  <QuestionList
                    blocks={contentBlocks}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onUpdateQuestion={handleUpdateQuestion}
                    onUpdateImageBlock={handleUpdateImageBlock}
                    onDuplicateBlock={handleDuplicateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onReorderBlocks={handleReorderBlocks}
                    onAddQuestion={handleAddQuestion}
                    onAddImage={() => {
                      setEditingImageBlock(null);
                      setIsImageUploadOpen(true);
                    }}
                    onEditImage={handleEditImage}
                    formId={initialDraft.id}
                  />
                </div>

                {/* Floating Quick Actions Toolbar on Right of Canvas */}
                <div className="sticky top-6 hidden sm:block">
                  <QuickActionsToolbar
                    onAddQuestion={handleAddQuestion}
                    onFocusHeader={handleFocusHeader}
                    onAddImage={() => {
                      setEditingImageBlock(null);
                      setIsImageUploadOpen(true);
                    }}
                  />
                </div>
              </div>
            </main>
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

      {/* Image Upload and Adjustment Modal */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => {
          setIsImageUploadOpen(false);
          setEditingImageBlock(null);
        }}
        formId={initialDraft.id}
        onInsertImage={handleInsertImage}
        editingBlock={editingImageBlock}
        onSaveExistingBlock={handleSaveExistingImageBlock}
      />

      {/* Cover Image Positioning and Cropping Editor Modal */}
      <CoverImageEditorModal
        isOpen={isCoverEditorOpen}
        onClose={handleCloseCoverEditor}
        formId={initialDraft.id}
        initialFile={coverEditorFile}
        initialPreviewUrl={coverEditorPreviewUrl}
        editingCoverImage={definition.coverImage}
        onSaveCoverImage={handleSaveCoverImage}
      />
    </div>
  );
}
