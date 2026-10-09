import { z } from "zod";
import { themeOverridesSchema, ThemeOverrides } from "@/features/forms/themes/schema";

export const questionTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROPDOWN",
  "DATE",
  "RATING",
]);

export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionDefinitionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  label: z.string().min(1),
  description: z.string().nullable().optional(),
  required: z.boolean().default(false),
  options: z.array(questionOptionSchema).optional(),
  settings: z.record(z.any()).optional(),
  responseListColumn: z.boolean().optional(),
});

export type QuestionDefinition = z.infer<typeof questionDefinitionSchema>;

export const formDefinitionV1Schema = z.object({
  schemaVersion: z.literal(1).default(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  themeKey: z.string().default("default"),
  themeOverrides: themeOverridesSchema.optional(),
  questions: z.array(questionDefinitionSchema).default([]),
});

export type FormDefinitionV1 = z.infer<typeof formDefinitionV1Schema>;
