import "server-only";
import { prisma } from "@/lib/db";
import { TemplateQueryParams } from "../schemas/template-query-schema";
import { Prisma } from "@prisma/client";

export interface TemplateCardDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryKey: string;
  themeKey: string | null;
  featuredRank: number | null;
  questionCount: number;
  versionId: string;
}

export interface TemplateCatalogResult {
  items: TemplateCardDTO[];
  categoryCounts: Record<string, number>;
  totalMatching: number;
  totalCatalogCount: number;
  currentPage: number;
  pageSize: number;
  pageCount: number;
}

let cachedPublished: {
  data: { id: string; slug: string; title: string; categoryKey: string }[];
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 60_000;

async function getAllPublishedTemplates() {
  const now = Date.now();
  if (cachedPublished && now - cachedPublished.timestamp < CACHE_TTL_MS) {
    return cachedPublished.data;
  }
  const allPublished = await prisma.template.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      categoryKey: true,
    },
  });
  cachedPublished = { data: allPublished, timestamp: now };
  return allPublished;
}

export async function getTemplateCatalog(
  params: TemplateQueryParams
): Promise<TemplateCatalogResult> {
  const { category, q, sort, page, pageSize } = params;

  // 1. Base condition: only published templates
  const baseWhere: Prisma.TemplateWhereInput = {
    isPublished: true,
  };

  const allPublished = await getAllPublishedTemplates();
  const totalCatalogCount = allPublished.length;

  const categoryCounts: Record<string, number> = {
    all: totalCatalogCount,
    education: 0,
    events: 0,
    feedback: 0,
    registration: 0,
    surveys: 0,
    healthcare: 0,
    hr: 0,
    community: 0,
    business: 0,
    other: 0,
  };

  for (const t of allPublished) {
    if (categoryCounts[t.categoryKey] !== undefined) {
      categoryCounts[t.categoryKey] += 1;
    }
    // Also count in registration if title/slug is registration
    if (
      t.slug.includes("registration") ||
      t.title.toLowerCase().includes("registration")
    ) {
      categoryCounts["registration"] = (categoryCounts["registration"] || 0) + 1;
    }
  }

  // 3. Filter condition
  const where: Prisma.TemplateWhereInput = {
    ...baseWhere,
  };

  if (category && category !== "all") {
    if (category === "registration") {
      where.OR = [
        { categoryKey: "registration" },
        { slug: { contains: "registration" } },
        { title: { contains: "registration", mode: "insensitive" } },
      ];
    } else {
      where.categoryKey = category;
    }
  }

  if (q && q.trim().length > 0) {
    const searchFilter: Prisma.TemplateWhereInput = {
      OR: [
        { title: { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
      ],
    };

    if (where.OR) {
      where.AND = [searchFilter];
    } else {
      where.OR = searchFilter.OR;
    }
  }

  // 4. Sorting
  let orderBy: Prisma.TemplateOrderByWithRelationInput[] = [];
  if (sort === "name") {
    orderBy = [{ title: "asc" }, { id: "asc" }];
  } else if (sort === "newest") {
    orderBy = [{ createdAt: "desc" }, { id: "asc" }];
  } else {
    // default: featured
    orderBy = [
      { featuredRank: { sort: "asc", nulls: "last" } },
      { title: "asc" },
      { id: "asc" },
    ];
  }

  // 5. Pagination & queries run in parallel
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [totalMatching, rawTemplates] = await Promise.all([
    prisma.template.count({ where }),
    prisma.template.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        categoryKey: true,
        themeKey: true,
        featuredRank: true,
        versions: {
          orderBy: { version: "desc" },
          take: 1,
          select: {
            id: true,
            definition: true,
          },
        },
      },
    }),
  ]);

  const items: TemplateCardDTO[] = rawTemplates.map((t) => {
    const latestVersion = t.versions[0];
    let questionCount = 0;
    if (
      latestVersion &&
      typeof latestVersion.definition === "object" &&
      latestVersion.definition !== null &&
      Array.isArray((latestVersion.definition as any).questions)
    ) {
      questionCount = (latestVersion.definition as any).questions.length;
    }

    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      categoryKey: t.categoryKey,
      themeKey: t.themeKey,
      featuredRank: t.featuredRank,
      questionCount,
      versionId: latestVersion?.id || "",
    };
  });

  const pageCount = Math.max(1, Math.ceil(totalMatching / pageSize));

  return {
    items,
    categoryCounts,
    totalMatching,
    totalCatalogCount,
    currentPage: page,
    pageSize,
    pageCount,
  };
}
