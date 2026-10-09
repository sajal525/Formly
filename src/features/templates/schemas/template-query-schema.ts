import { z } from "zod";

export const templateCategoryKeys = [
  "all",
  "education",
  "events",
  "feedback",
  "registration",
  "surveys",
  "healthcare",
  "hr",
  "community",
  "business",
  "other",
] as const;

export type TemplateCategoryKey = (typeof templateCategoryKeys)[number];

export const categoryLabels: Record<TemplateCategoryKey, string> = {
  all: "All Templates",
  education: "Education",
  events: "Events",
  feedback: "Feedback",
  registration: "Registration",
  surveys: "Surveys",
  healthcare: "Healthcare",
  hr: "HR",
  community: "Community",
  business: "Business",
  other: "Other",
};

export const templateSortKeys = ["featured", "name", "newest"] as const;
export type TemplateSortKey = (typeof templateSortKeys)[number];

export const sortLabels: Record<TemplateSortKey, string> = {
  featured: "Featured",
  name: "Name",
  newest: "Newest",
};

export const templateQuerySchema = z.object({
  category: z.enum(templateCategoryKeys).default("all").catch("all"),
  q: z.string().max(100).default("").catch(""),
  sort: z.enum(templateSortKeys).default("featured").catch("featured"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(15).catch(15),
});

export type TemplateQueryParams = z.infer<typeof templateQuerySchema>;

export function parseTemplateQueryParams(
  params: Record<string, string | string[] | undefined>
): TemplateQueryParams {
  const normalized: Record<string, any> = {};

  if (params.category && typeof params.category === "string") {
    normalized.category = params.category.toLowerCase().trim();
  }

  if (params.q && typeof params.q === "string") {
    normalized.q = params.q.trim();
  }

  if (params.sort && typeof params.sort === "string") {
    normalized.sort = params.sort.toLowerCase().trim();
  }

  if (params.page) {
    normalized.page = params.page;
  }

  if (params.pageSize) {
    normalized.pageSize = params.pageSize;
  }

  return templateQuerySchema.parse(normalized);
}
