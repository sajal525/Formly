import { z } from "zod";

export const trashTypeFilterSchema = z.enum(["all", "forms", "templates", "others"]);
export type TrashTypeFilter = z.infer<typeof trashTypeFilterSchema>;

export const trashSortSchema = z.enum([
  "deleted_desc",
  "deleted_asc",
  "name_asc",
  "expiring_asc",
]);
export type TrashSort = z.infer<typeof trashSortSchema>;

export const trashQueryParamsSchema = z.object({
  type: trashTypeFilterSchema.default("all"),
  q: z.string().default(""),
  sort: trashSortSchema.default("deleted_desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
});

export type TrashQueryParams = z.infer<typeof trashQueryParamsSchema>;

export const restoreTrashActionSchema = z.object({
  action: z.literal("restore"),
  restoreAs: z.enum(["previous_status", "draft"]).default("previous_status"),
});

export type RestoreTrashActionInput = z.infer<typeof restoreTrashActionSchema>;

export const permanentDeleteActionSchema = z.object({
  confirmText: z.string().min(1, "Confirmation text is required"),
});

export type PermanentDeleteActionInput = z.infer<typeof permanentDeleteActionSchema>;

export const bulkTrashActionSchema = z.object({
  action: z.enum(["restore", "delete_permanently"]),
  formIds: z
    .array(z.string().min(1))
    .min(1, "Please select at least one item")
    .max(50, "Cannot process more than 50 items at once"),
  confirmText: z.string().optional(),
});

export type BulkTrashActionInput = z.infer<typeof bulkTrashActionSchema>;
