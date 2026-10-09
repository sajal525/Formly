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
import { BuilderQuestion } from "../schemas/builder-definition-schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionListProps {
  questions: BuilderQuestion[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<BuilderQuestion>) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (reordered: BuilderQuestion[]) => void;
  onAddQuestion: () => void;
}

export function QuestionList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onAddQuestion,
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
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(questions, oldIndex, newIndex);
        onReorderQuestions(reordered);
        setLiveAnnouncement(
          `Question ${oldIndex + 1} moved to position ${newIndex + 1}.`
        );
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const reordered = arrayMove(questions, index, index - 1);
      onReorderQuestions(reordered);
      setLiveAnnouncement(`Question ${index + 1} moved to position ${index}.`);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < questions.length - 1) {
      const reordered = arrayMove(questions, index, index + 1);
      onReorderQuestions(reordered);
      setLiveAnnouncement(`Question ${index + 1} moved to position ${index + 2}.`);
    }
  };

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
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                totalQuestions={questions.length}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => onSelectQuestion(question.id)}
                onChange={(updates) => onUpdateQuestion(question.id, updates)}
                onDuplicate={() => onDuplicateQuestion(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* If empty canvas */}
      {questions.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            No questions in this form yet.
          </p>
          <Button
            type="button"
            onClick={onAddQuestion}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Add first question
          </Button>
        </div>
      ) : (
        /* Center "+ Add question" button below question cards as shown in B1.png */
        <div className="flex justify-center pt-2 pb-6">
          <button
            type="button"
            onClick={onAddQuestion}
            className="h-10 px-5 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-800/60 bg-violet-50/60 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-950/60 hover:border-violet-400 transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add question</span>
          </button>
        </div>
      )}
    </div>
  );
}
