import { z } from "zod";

export const createFormSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : "Untitled form")),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
