import { z } from "zod";

export const renameFormActionSchema = z.object({
  action: z.literal("rename"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters"),
});

export const archiveFormActionSchema = z.object({
  action: z.literal("archive"),
});

export const restoreFormActionSchema = z.object({
  action: z.literal("restore"),
});

export const publishFormActionSchema = z.object({
  action: z.literal("publish"),
});

export const closeFormActionSchema = z.object({
  action: z.literal("close"),
});

export const trashFormActionSchema = z.object({
  action: z.literal("trash"),
});

export const manageFormActionSchema = z.discriminatedUnion("action", [
  renameFormActionSchema,
  archiveFormActionSchema,
  restoreFormActionSchema,
  publishFormActionSchema,
  closeFormActionSchema,
  trashFormActionSchema,
]);

export type ManageFormActionInput = z.infer<typeof manageFormActionSchema>;

export const bulkFormActionSchema = z.object({
  action: z.enum(["archive", "trash"]),
  formIds: z
    .array(z.string().min(1))
    .min(1, "Please select at least one form")
    .max(50, "Cannot operate on more than 50 forms at once"),
});

export type BulkFormActionInput = z.infer<typeof bulkFormActionSchema>;
