import { z } from "zod";

export const formStatusFilterSchema = z.enum([
  "all",
  "draft",
  "published",
  "closed",
  "archived",
]);
export type FormStatusFilter = z.infer<typeof formStatusFilterSchema>;

export const formSortFieldSchema = z.enum(["updatedAt", "createdAt", "title"]);
export type FormSortField = z.infer<typeof formSortFieldSchema>;

export const formSortDirectionSchema = z.enum(["asc", "desc"]);
export type FormSortDirection = z.infer<typeof formSortDirectionSchema>;

export const formViewModeSchema = z.enum(["list", "grid"]);
export type FormViewMode = z.infer<typeof formViewModeSchema>;

export const formPageSizeSchema = z
  .union([z.literal(10), z.literal(20), z.literal(50)])
  .default(10);
export type FormPageSize = z.infer<typeof formPageSizeSchema>;

export const myFormsQuerySchema = z.object({
  status: formStatusFilterSchema.catch("all"),
  q: z
    .string()
    .trim()
    .max(100, "Search query too long")
    .catch("")
    .default(""),
  sort: formSortFieldSchema.catch("updatedAt"),
  direction: formSortDirectionSchema.catch("desc"),
  view: formViewModeSchema.catch("list"),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .catch(1)
    .default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((val): val is 10 | 20 | 50 => [10, 20, 50].includes(val), {
      message: "Page size must be 10, 20, or 50",
    })
    .catch(10)
    .default(10),
});

export type MyFormsQueryParams = z.infer<typeof myFormsQuerySchema>;

export function parseMyFormsQueryParams(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams
): MyFormsQueryParams {
  const params: Record<string, unknown> = {};

  if (rawParams instanceof URLSearchParams) {
    for (const [key, val] of rawParams.entries()) {
      params[key] = val;
    }
  } else if (rawParams) {
    for (const [key, val] of Object.entries(rawParams)) {
      if (Array.isArray(val)) {
        params[key] = val[0];
      } else if (typeof val === "string") {
        params[key] = val;
      }
    }
  }

  const result = myFormsQuerySchema.safeParse(params);
  if (result.success) {
    return result.data;
  }

  return {
    status: "all",
    q: "",
    sort: "updatedAt",
    direction: "desc",
    view: "list",
    page: 1,
    pageSize: 10,
  };
}
