"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { QuestionCard } from "./question-card";
import { ImageCard } from "./image-block/image-card";
import {
  BuilderContentBlock,
  BuilderQuestion,
  BuilderImageBlock,
} from "../schemas/builder-definition-schema";
import { Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionListProps {
  blocks: BuilderContentBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<BuilderQuestion>) => void;
  onUpdateImageBlock: (blockId: string, updates: Partial<BuilderImageBlock>) => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderBlocks: (reordered: BuilderContentBlock[]) => void;
  onAddQuestion: () => void;
  onAddImage: () => void;
  onEditImage: (block: BuilderImageBlock) => void;
  formId: string;
}

export function QuestionList({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateQuestion,
  onUpdateImageBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onAddQuestion,
  onAddImage,
  onEditImage,
  formId,
}: QuestionListProps) {
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(blocks, oldIndex, newIndex);
        onReorderBlocks(reordered);
        setLiveAnnouncement(
          `Block moved from position ${oldIndex + 1} to position ${newIndex + 1}.`
        );
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const reordered = arrayMove(blocks, index, index - 1);
      onReorderBlocks(reordered);
      setLiveAnnouncement(`Block moved to position ${index}.`);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < blocks.length - 1) {
      const reordered = arrayMove(blocks, index, index + 1);
      onReorderBlocks(reordered);
      setLiveAnnouncement(`Block moved to position ${index + 2}.`);
    }
  };

  const totalQuestions = blocks.filter((b) => b.kind === "question").length;
  let runningQuestionIndex = 0;

  return (
    <div className="w-full space-y-4">
      {/* Live region for screen reader accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.map((block, index) => {
              if (block.kind === "image") {
                return (
                  <ImageCard
                    key={block.id}
                    block={block}
                    index={index}
                    totalBlocks={blocks.length}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onChange={(updates) => onUpdateImageBlock(block.id, updates)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onEditImage={() => onEditImage(block)}
                    formId={formId}
                  />
                );
              }

              // Question Block
              const questionIdx = runningQuestionIndex++;
              return (
                <QuestionCard
                  key={block.id}
                  question={block.question}
                  index={questionIdx}
                  totalQuestions={totalQuestions}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onChange={(updates) => onUpdateQuestion(block.id, updates)}
                  onDuplicate={() => onDuplicateBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* If empty canvas */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No questions or content blocks in this form yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              onClick={onAddQuestion}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Add first question
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onAddImage}
              className="gap-2 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded-xl text-xs font-bold"
            >
              <ImageIcon className="w-4 h-4" />
              Add an image
            </Button>
          </div>
        </div>
      ) : (
        /* Action buttons below cards */
        <div className="flex items-center justify-center gap-3 pt-2 pb-6">
          <button
            type="button"
            onClick={onAddQuestion}
            className="h-10 px-5 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-800/60 bg-violet-50/60 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-950/60 hover:border-violet-400 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add question</span>
          </button>

          <button
            type="button"
            onClick={onAddImage}
            className="h-10 px-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Add image</span>
          </button>
        </div>
      )}
    </div>
  );
}
