import { z } from "zod";

export interface ProfileDTO {
  userId: string;
  username: string;
  displayName: string | null;
  contactEmail: string | null;
  contactEmailVerified: boolean;
  phone: string | null;
  institution: string | null;
  department: string | null;
  rollNumber: string | null;
  studyYear: string | null;
  division: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
}

export interface AccountStatsDTO {
  totalForms: number;
  totalResponses: number;
  totalViews: number;
  templatesUsed: number;
}

// Zod schema for profile editing form and PATCH API
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(100, "Full name must be at most 100 characters")
    .nullable()
    .optional(),
  contactEmail: z
    .union([
      z.string().trim().email("Please enter a valid email address").max(254, "Email must be at most 254 characters"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined) return null;
      return val;
    }),
  phone: z
    .string()
    .trim()
    .max(32, "Phone number must be at most 32 characters")
    .nullable()
    .optional(),
  institution: z
    .string()
    .trim()
    .max(150, "College / Institute must be at most 150 characters")
    .nullable()
    .optional(),
  department: z
    .string()
    .trim()
    .max(120, "Department must be at most 120 characters")
    .nullable()
    .optional(),
  rollNumber: z
    .string()
    .trim()
    .max(64, "Roll number must be at most 64 characters")
    .nullable()
    .optional(),
  studyYear: z
    .string()
    .trim()
    .max(32, "Year must be at most 32 characters")
    .nullable()
    .optional(),
  division: z
    .string()
    .trim()
    .max(32, "Division must be at most 32 characters")
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(300, "Bio must be at most 300 characters")
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128, "Password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" }),
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
