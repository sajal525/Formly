import { z } from "zod";

export const responseTabSchema = z.enum([
  "responses",
  "summary",
  "individual",
  "analytics",
]);
export type ResponseTab = z.infer<typeof responseTabSchema>;

export const responseSortSchema = z.enum(["newest", "oldest"]);
export type ResponseSort = z.infer<typeof responseSortSchema>;

export const responsePageSizeSchema = z
  .union([z.literal(10), z.literal(20), z.literal(50)])
  .default(10);
export type ResponsePageSize = z.infer<typeof responsePageSizeSchema>;

export const responseDateRangeSchema = z.enum(["all", "7d", "30d", "90d"]).default("all");
export type ResponseDateRange = z.infer<typeof responseDateRangeSchema>;

export const responseWorkspaceQuerySchema = z.object({
  formId: z.string().optional(),
  tab: responseTabSchema.default("responses"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().pipe(responsePageSizeSchema).default(10),
  sort: responseSortSchema.default("newest"),
  search: z.string().trim().max(100).optional(),
  responseId: z.string().optional(),
  dateRange: responseDateRangeSchema,
});

export type ResponseWorkspaceQueryParams = z.infer<
  typeof responseWorkspaceQuerySchema
>;
