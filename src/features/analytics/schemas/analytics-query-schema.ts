import { z } from "zod";

export const analyticsDateRangePresetSchema = z.enum([
  "7d",
  "30d",
  "90d",
  "all",
  "custom",
]);
export type AnalyticsDateRangePreset = z.infer<
  typeof analyticsDateRangePresetSchema
>;

export const analyticsCompareSchema = z.enum(["previous", "none"]);
export type AnalyticsCompare = z.infer<typeof analyticsCompareSchema>;

export const analyticsQuerySchema = z.object({
  formId: z.string().optional(),
  range: analyticsDateRangePresetSchema.default("30d"),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timezone: z.string().default("UTC"),
  compare: analyticsCompareSchema.default("previous"),
});

export const analyticsQueryParamsSchema = analyticsQuerySchema;
export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;
