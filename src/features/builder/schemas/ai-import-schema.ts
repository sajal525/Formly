import { z } from "zod";
import {
  builderQuestionTypeSchema,
  BuilderQuestionType,
  questionOptionSchema,
  questionSettingsSchema,
  BuilderQuestion,
} from "./builder-definition-schema";

export const aiDraftOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export type AiDraftOption = z.infer<typeof aiDraftOptionSchema>;

export const aiDraftQuestionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Question title is required"),
  type: builderQuestionTypeSchema,
  description: z.string().nullable().optional(),
  required: z.boolean().default(false),
  options: z.array(aiDraftOptionSchema).optional(),
  settings: questionSettingsSchema.optional(),
  needsAttention: z.boolean().optional(),
  attentionReason: z.string().optional(),
});

export type AiDraftQuestion = z.infer<typeof aiDraftQuestionSchema>;

export const aiImportRequestSchema = z.object({
  text: z
    .string()
    .min(5, "Please provide at least 5 characters of source text.")
    .max(50000, "Source text exceeds the 50,000 character limit."),
  documentName: z.string().optional(),
});

export type AiImportRequest = z.infer<typeof aiImportRequestSchema>;

export const aiImportResponseSchema = z.object({
  success: z.boolean(),
  questions: z.array(aiDraftQuestionSchema),
  detectedCount: z.number(),
  suggestedTitle: z.string().optional(),
  suggestedDescription: z.string().optional(),
  error: z.string().optional(),
});

export type AiImportResponse = z.infer<typeof aiImportResponseSchema>;

/**
 * Normalizes an AiDraftQuestion into a complete, valid BuilderQuestion ready for the canvas.
 */
export function normalizeDraftToBuilderQuestion(
  draft: AiDraftQuestion,
  index = 0
): BuilderQuestion {
  const qId = draft.id.startsWith("q-")
    ? draft.id
    : `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;

  // Normalize options if applicable
  const isChoiceType = ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(
    draft.type
  );

  let options = draft.options;
  if (isChoiceType) {
    if (!options || options.length === 0) {
      options = [
        {
          id: `opt-${Date.now()}-1`,
          label: "Option 1",
          value: "option_1",
        },
        {
          id: `opt-${Date.now()}-2`,
          label: "Option 2",
          value: "option_2",
        },
      ];
    } else {
      options = options.map((opt, optIdx) => ({
        id: opt.id || `opt-${Date.now()}-${optIdx}`,
        label: opt.label?.trim() || `Option ${optIdx + 1}`,
        value:
          opt.value?.trim() ||
          opt.label?.toLowerCase().replace(/\s+/g, "_") ||
          `option_${optIdx + 1}`,
      }));
    }
  } else {
    options = undefined;
  }

  // Normalize settings
  let settings = draft.settings || {};
  if (draft.type === "RATING") {
    settings = {
      ...settings,
      minRating: settings.minRating ?? 1,
      maxRating: settings.maxRating ?? 5,
    };
  } else if (draft.type === "SHORT_TEXT" && !settings.placeholder) {
    settings = {
      ...settings,
      placeholder: "Short answer text",
    };
  } else if (draft.type === "LONG_TEXT" && !settings.placeholder) {
    settings = {
      ...settings,
      placeholder: "Long answer text",
    };
  }

  return {
    id: qId,
    type: draft.type,
    label: draft.label.trim() || "Untitled question",
    description: draft.description?.trim() || null,
    required: Boolean(draft.required),
    options,
    settings,
  };
}
