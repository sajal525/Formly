import { z } from "zod";

export const landingPageSchema = z.enum([
  "dashboard",
  "my-forms",
  "templates",
  "responses",
  "analytics",
]);
export type LandingPage = z.infer<typeof landingPageSchema>;

export const formViewSchema = z.enum(["grid", "list"]);
export type FormView = z.infer<typeof formViewSchema>;

export const itemsPerPageSchema = z.union([
  z.literal(10),
  z.literal(25),
  z.literal(50),
]);
export type ItemsPerPage = z.infer<typeof itemsPerPageSchema>;

export const dateFormatSchema = z.enum([
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
  "DD MMM YYYY",
]);
export type DateFormat = z.infer<typeof dateFormatSchema>;

export const timeFormatSchema = z.enum(["12h", "24h"]);
export type TimeFormat = z.infer<typeof timeFormatSchema>;

export const themeModeSchema = z.enum(["light", "dark", "system"]);
export type ThemeMode = z.infer<typeof themeModeSchema>;

export const accentColorSchema = z.enum([
  "violet",
  "blue",
  "pink",
  "red",
  "orange",
  "green",
  "teal",
  "slate",
]);
export type AccentColor = z.infer<typeof accentColorSchema>;

export const defaultThemeIdSchema = z.enum([
  "soft-lavender",
  "default",
  "education-soft",
  "event-vibrant",
  "feedback-mint",
  "survey-purple",
  "business-amber",
  "healthcare-rose",
  "community-indigo",
]);
export type DefaultThemeId = z.infer<typeof defaultThemeIdSchema>;

export const defaultQuestionTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROPDOWN",
  "DATE",
  "RATING",
  "EMAIL",
  "PHONE",
  "NUMBER",
]);
export type DefaultQuestionType = z.infer<typeof defaultQuestionTypeSchema>;

export const localeSchema = z.enum(["en", "es", "fr", "de", "hi"]);
export type Locale = z.infer<typeof localeSchema>;

export const userSettingsSchema = z.object({
  // General Preferences
  defaultLandingPage: landingPageSchema.default("dashboard"),
  defaultFormView: formViewSchema.default("list"),
  itemsPerPage: itemsPerPageSchema.default(10),
  dateFormat: dateFormatSchema.default("DD/MM/YYYY"),
  timeFormat: timeFormatSchema.default("12h"),

  // Appearance
  themeMode: themeModeSchema.default("system"),
  accentColor: accentColorSchema.default("violet"),

  // Form Preferences
  defaultThemeId: defaultThemeIdSchema.default("soft-lavender"),
  showProgressIndicator: z.boolean().default(true),
  collectEmailByDefault: z.boolean().default(false),
  allowMultipleSubmissions: z.boolean().default(true),

  // Editor Preferences
  autoSaveForms: z.boolean().default(true),
  showKeyboardShortcuts: z.boolean().default(true),
  defaultQuestionType: defaultQuestionTypeSchema.default("SHORT_TEXT"),
  showQuestionNumbers: z.boolean().default(true),

  // Language & Region
  locale: localeSchema.default("en"),
  timeZone: z.string().min(1).default("UTC"),
  region: z.string().default("India"),
});

export type UserSettingsDTO = z.infer<typeof userSettingsSchema>;

export const updateUserSettingsSchema = userSettingsSchema.partial();
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
