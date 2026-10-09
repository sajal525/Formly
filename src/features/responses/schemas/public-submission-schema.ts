import { z } from "zod";

export const publicSessionStartSchema = z.object({
  sessionHash: z.string().max(128).optional(),
  sourceKey: z.string().max(32).optional(),
});

export const publicProgressPayloadSchema = z.object({
  sessionId: z.string(),
  milestone: z.enum(["FIRST_INTERACTION", "REACHED_LAST_QUESTION"]),
});

export type PublicProgressPayload = z.infer<typeof publicProgressPayloadSchema>;


export const publicSubmitAnswerValueSchema = z.union([
  z.string().max(5000),
  z.number(),
  z.array(z.string().max(500)).max(50),
  z.null(),
]);

export const publicSubmitPayloadSchema = z.object({
  sessionId: z.string().optional(),
  answers: z.record(z.string(), publicSubmitAnswerValueSchema),
  accessPassword: z.string().optional(),
});

export type PublicSubmitPayload = z.infer<typeof publicSubmitPayloadSchema>;
