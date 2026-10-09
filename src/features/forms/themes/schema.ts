import { z } from "zod";

export const primaryColorKeySchema = z.enum([
  "violet",
  "blue",
  "cyan",
  "pink",
  "red",
  "orange",
  "green",
  "emerald",
  "slate",
]);

export type PrimaryColorKey = z.infer<typeof primaryColorKeySchema>;

export const fontPairKeySchema = z.enum([
  "sans",
  "clean",
  "serif",
  "mono",
  "rounded",
]);

export type FontPairKey = z.infer<typeof fontPairKeySchema>;

export const cardStyleSchema = z.enum(["default", "glass", "outlined"]);
export type CardStyle = z.infer<typeof cardStyleSchema>;

export const backgroundModeSchema = z.enum(["solid", "gradient", "image"]);
export type BackgroundMode = z.infer<typeof backgroundModeSchema>;

export const themeBackgroundSchema = z.object({
  mode: backgroundModeSchema.default("gradient"),
  presetKey: z.string().max(50).optional(),
});

export type ThemeBackground = z.infer<typeof themeBackgroundSchema>;

export const themeHeaderSchema = z.object({
  layout: z.enum(["left", "centered"]).default("left"),
  height: z.enum(["compact", "medium", "spacious"]).default("medium"),
});

export type ThemeHeader = z.infer<typeof themeHeaderSchema>;

export const themeOverridesSchema = z.object({
  primaryColorKey: primaryColorKeySchema.optional(),
  fontPairKey: fontPairKeySchema.optional(),
  fontSize: z.enum(["compact", "normal", "large"]).default("normal").optional(),
  background: themeBackgroundSchema.optional(),
  cardStyle: cardStyleSchema.default("default").optional(),
  header: themeHeaderSchema.optional(),
});

export type ThemeOverrides = z.infer<typeof themeOverridesSchema>;
