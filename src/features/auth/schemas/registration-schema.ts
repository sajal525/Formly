import { z } from "zod";

export const registrationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(128, "Password must not exceed 128 characters"),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
