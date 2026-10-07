"use client";

import React, { useState } from "react";
import { FormHeaderCard } from "./FormHeaderCard";
import { SectionCard } from "./SectionCard";
import { QuestionCard } from "./QuestionCard";
import { FloatingToolbar } from "./FloatingToolbar";
import {
  SectionData,
  QuestionData,
  OptionData,
} from "../../server/forms.queries";

interface QuestionsTabProps {
  title: string;
  description: string;
  sections: SectionData[];
  questions: QuestionData[];
  isQuiz?: boolean;
  accentColor?: string;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateSection: (sectionId: string, data: Partial<SectionData>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddSection: () => void;
  onUpdateQuestion: (questionId: string, data: Partial<QuestionData>) => void;
  onUpdateOptions: (questionId: string, options: OptionData[]) => void;
  onAddQuestion: (sectionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export function QuestionsTab({
  title,
  description,
  sections,
  questions,
  isQuiz = false,
  accentColor = "#7C3AED",
  onUpdateTitle,
  onUpdateDescription,
  onUpdateSection,
  onDeleteSection,
  onAddSection,
  onUpdateQuestion,
  onUpdateOptions,
  onAddQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
}: QuestionsTabProps) {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );

  // Group questions by sectionId
  const questionsBySection = new Map<string, QuestionData[]>();
  for (const q of questions) {
    const sId = q.sectionId || sections[0]?.id || "default";
    const list = questionsBySection.get(sId) || [];
    list.push(q);
    questionsBySection.set(sId, list);
  }

  // Find active section
  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  const activeSectionId =
    activeQuestion?.sectionId || sections[0]?.id || "default";

  return (
    <div
      style={{
        maxWidth: "768px",
        margin: "24px auto 80px auto",
        padding: "0 16px",
        position: "relative",
      }}
    >
      {/* Floating Toolbar positioned to the right of the main column */}
      <div
        style={{
          position: "fixed",
          right: "calc(50% - 430px)",
          top: "160px",
          zIndex: 40,
        }}
      >
        <FloatingToolbar
          onAddQuestion={() => onAddQuestion(activeSectionId)}
          onAddSection={onAddSection}
        />
      </div>

      {/* Form Header Card */}
      <FormHeaderCard
        title={title}
        description={description}
        accentColor={accentColor}
        onTitleChange={onUpdateTitle}
        onDescriptionChange={onUpdateDescription}
      />

      {/* Sections and Questions */}
      {sections.map((section, sIdx) => {
        const sectionQuestions = questionsBySection.get(section.id) || [];

        return (
          <div key={section.id} style={{ marginBottom: "32px" }}>
            {/* If more than 1 section, render SectionCard header */}
            {sections.length > 1 && (
              <SectionCard
                section={section}
                index={sIdx}
                totalSections={sections.length}
                sections={sections}
                onUpdateSection={onUpdateSection}
                onDeleteSection={onDeleteSection}
              />
            )}

            {/* Questions in this section */}
            {sectionQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isActive={activeQuestionId === question.id}
                sections={sections}
                isQuiz={isQuiz}
                onSelect={() => setActiveQuestionId(question.id)}
                onUpdate={(data) => onUpdateQuestion(question.id, data)}
                onUpdateOptions={(options) =>
                  onUpdateOptions(question.id, options)
                }
                onDuplicate={() => onDuplicateQuestion(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
