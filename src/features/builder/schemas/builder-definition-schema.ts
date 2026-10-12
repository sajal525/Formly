import { z } from "zod";
import { themeOverridesSchema } from "@/features/forms/themes/schema";

export const builderQuestionTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROPDOWN",
  "RATING",
  "EMAIL",
  "NUMBER",
  "PHONE",
  "DATE",
]);

export type BuilderQuestionType = z.infer<typeof builderQuestionTypeSchema>;

export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionSettingsSchema = z.object({
  placeholder: z.string().optional(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  pattern: z.string().optional(),
  customErrorMessage: z.string().optional(),
  minRating: z.number().int().min(1).default(1).optional(),
  maxRating: z.number().int().max(10).default(5).optional(),
});

export type QuestionSettings = z.infer<typeof questionSettingsSchema>;

export const builderQuestionSchema = z.object({
  id: z.string(),
  type: builderQuestionTypeSchema,
  label: z.string().default("Untitled question"),
  description: z.string().nullable().optional(),
  required: z.boolean().default(false),
  options: z.array(questionOptionSchema).optional(),
  settings: questionSettingsSchema.optional(),
  responseListColumn: z.boolean().optional(),
});

export type BuilderQuestion = z.infer<typeof builderQuestionSchema>;

export const formCategorySchema = z.enum([
  "Education",
  "Feedback",
  "Registration",
  "Business",
  "Event",
  "Survey",
  "Other",
]);
export type FormCategory = z.infer<typeof formCategorySchema>;

export const formLanguageSchema = z.enum([
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Japanese",
  "Other",
]);
export type FormLanguage = z.infer<typeof formLanguageSchema>;

export const formAccessTypeSchema = z.enum([
  "public",
  "organization",
  "password",
]);
export type FormAccessType = z.infer<typeof formAccessTypeSchema>;

export const confirmationMessageTypeSchema = z.enum([
  "text",
  "custom_page",
  "redirect",
]);
export type ConfirmationMessageType = z.infer<typeof confirmationMessageTypeSchema>;

export const formSettingsSchema = z.object({
  // General Preferences
  category: formCategorySchema.default("Education"),
  defaultLanguage: formLanguageSchema.default("English"),

  // Form Access
  accessType: formAccessTypeSchema.default("public"),
  passwordRequired: z.boolean().default(false),
  accessPassword: z.string().max(100).optional(),
  organizationDomain: z.string().max(100).optional(),

  // Response Settings
  acceptingResponses: z.boolean().default(true),
  closedMessage: z.string().default("This form is no longer accepting responses."),
  collectEmailAddresses: z.boolean().default(false),
  limitOneResponse: z.boolean().default(false),
  allowMultipleSubmissions: z.boolean().default(true),
  setResponseLimit: z.boolean().default(false),
  responseLimit: z.number().int().min(1).default(100).optional(),

  // Form Behavior
  showProgressIndicator: z.boolean().default(true),
  shuffleQuestionOrder: z.boolean().default(false),
  showQuestionNumbers: z.boolean().default(true),
  oneQuestionPerPage: z.boolean().default(false),

  // Confirmation Message
  confirmationType: confirmationMessageTypeSchema.default("text"),
  confirmationTitle: z.string().default("Thank you!"),
  confirmationMessage: z.string().default("Your response has been submitted successfully."),
  customPageTitle: z.string().optional(),
  customPageDescription: z.string().optional(),
  redirectUrl: z.string().optional(),

  // Notifications
  emailNewResponses: z.boolean().default(true),
  notifyResponseLimit: z.boolean().default(true),
  notifySuspiciousActivity: z.boolean().default(true),

  // Advanced Settings
  allowEditAfterSubmission: z.boolean().default(false),
  saveAndContinueLater: z.boolean().default(false),
});

export type FormSettings = z.infer<typeof formSettingsSchema>;

export const imageDisplaySizeSchema = z.enum(["small", "medium", "large", "full"]);
export type ImageDisplaySize = z.infer<typeof imageDisplaySizeSchema>;

export const imageAlignmentSchema = z.enum(["left", "center", "right"]);
export type ImageAlignment = z.infer<typeof imageAlignmentSchema>;

export const imageCropSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(100),
  height: z.number().default(100),
  aspectRatio: z.number().optional(),
});
export type ImageCrop = z.infer<typeof imageCropSchema>;

export const imageTransformSchema = z.object({
  rotation: z.number().default(0),
  fineAngle: z.number().optional(),
  zoom: z.number().optional(),
  panX: z.number().optional(),
  panY: z.number().optional(),
  aspectPreset: z.string().optional(),
  crop: imageCropSchema.optional(),
});
export type ImageTransform = z.infer<typeof imageTransformSchema>;

export const builderImageBlockSchema = z.object({
  id: z.string(),
  kind: z.literal("image").default("image"),
  assetId: z.string(),
  altText: z.string().default(""),
  displaySize: imageDisplaySizeSchema.default("medium"),
  alignment: imageAlignmentSchema.default("center"),
  transform: imageTransformSchema.default({ rotation: 0 }),
  naturalWidth: z.number().optional(),
  naturalHeight: z.number().optional(),
  fileName: z.string().optional(),
});
export type BuilderImageBlock = z.infer<typeof builderImageBlockSchema>;

export const builderQuestionBlockSchema = z.object({
  id: z.string(),
  kind: z.literal("question").default("question"),
  question: builderQuestionSchema,
});
export type BuilderQuestionBlock = z.infer<typeof builderQuestionBlockSchema>;

export const builderContentBlockSchema = z.discriminatedUnion("kind", [
  builderQuestionBlockSchema,
  builderImageBlockSchema,
]);
export type BuilderContentBlock = z.infer<typeof builderContentBlockSchema>;

export const builderCoverImageSchema = z.object({
  assetId: z.string(),
  originalAssetId: z.string().optional(),
  altText: z.string().default(""),
  transform: imageTransformSchema.default({ rotation: 0 }),
});
export type BuilderCoverImage = z.infer<typeof builderCoverImageSchema>;

export const builderFormDefinitionSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  title: z.string().default("Untitled form"),
  description: z.string().nullable().optional(),
  coverImage: builderCoverImageSchema.nullable().optional(),
  themeKey: z.string().default("soft-lavender"),
  themeOverrides: themeOverridesSchema.optional(),
  settings: formSettingsSchema.default({}),
  blocks: z.array(builderContentBlockSchema).optional(),
  questions: z.array(builderQuestionSchema).default([]),
});

export type BuilderFormDefinition = z.infer<typeof builderFormDefinitionSchema>;

/**
 * Normalizes a form definition so that it always has a canonical ordered sequence of content blocks.
 * If definition.blocks is present, it is used. Otherwise, existing questions are adapted seamlessly.
 */
export function ensureDefinitionBlocks(
  definition?: Partial<BuilderFormDefinition> | null
): BuilderContentBlock[] {
  if (!definition) return [];
  if (Array.isArray(definition.blocks) && definition.blocks.length > 0) {
    return definition.blocks;
  }
  const questions = definition.questions || [];
  return questions.map((q) => ({
    id: q.id,
    kind: "question" as const,
    question: q,
  }));
}

/**
 * Given an ordered sequence of blocks, produces the synchronized { blocks, questions } tuple
 * for 100% backward compatibility with components that read definition.questions.
 */
export function syncBlocksAndQuestions(blocks: BuilderContentBlock[]): {
  blocks: BuilderContentBlock[];
  questions: BuilderQuestion[];
} {
  const questions = blocks
    .filter((b): b is BuilderQuestionBlock => b.kind === "question")
    .map((b) => b.question);
  return { blocks, questions };
}

// Autosave payload schema
export const saveDraftRequestSchema = z.object({
  expectedRevision: z.number().int().min(0).optional(),
  definition: builderFormDefinitionSchema,
});

export type SaveDraftRequest = z.infer<typeof saveDraftRequestSchema>;

export interface SaveDraftResponse {
  success: boolean;
  newRevision?: number;
  conflict?: boolean;
  currentRevision?: number;
  updatedAt?: string;
  error?: string;
}

export interface PublishFormResponse {
  success: boolean;
  formId?: string;
  publicUrl?: string;
  error?: string;
  validationErrors?: string[];
}
