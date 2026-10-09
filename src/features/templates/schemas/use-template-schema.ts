import { z } from "zod";

export const useTemplateSchema = z.object({
  templateId: z.string().min(1, "Template identifier is required"),
});

export type UseTemplateInput = z.infer<typeof useTemplateSchema>;
