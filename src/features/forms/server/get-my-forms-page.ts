import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { MyFormsQueryParams } from "../schemas/my-forms-query-schema";

export interface MyFormItemDTO {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  themeKey: string | null;
  createdAt: string;
  updatedAt: string;
  responsesCount: null;
  viewsCount: null;
}

export interface StatusCountsDTO {
  all: number;
  draft: number;
  published: number;
  closed: number;
  archived: number;
}

export interface MyFormsPageDTO {
  items: MyFormItemDTO[];
  totalMatching: number;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  statusCounts: StatusCountsDTO;
}

const STATUS_MAP: Record<string, FormStatus> = {
  draft: FormStatus.DRAFT,
  published: FormStatus.PUBLISHED,
  closed: FormStatus.CLOSED,
  archived: FormStatus.ARCHIVED,
};

export async function getMyFormsPage(
  userId: string,
  params: MyFormsQueryParams
): Promise<MyFormsPageDTO> {
  const { status, q, sort, direction, page, pageSize } = params;

  // Build Prisma where filter
  const where: any = {
    ownerId: userId,
  };

  // Status filter
  if (status === "all") {
    where.status = { not: FormStatus.TRASHED };
  } else if (STATUS_MAP[status]) {
    where.status = STATUS_MAP[status];
  } else {
    where.status = { not: FormStatus.TRASHED };
  }

  // Search filter
  if (q && q.trim().length > 0) {
    const trimmedQ = q.trim().slice(0, 100);
    where.OR = [
      { title: { contains: trimmedQ, mode: "insensitive" } },
      { description: { contains: trimmedQ, mode: "insensitive" } },
    ];
  }

  // Build order allow-list with tie-breaker
  const sortField = ["updatedAt", "createdAt", "title"].includes(sort)
    ? sort
    : "updatedAt";
  const sortDir = direction === "asc" ? "asc" : "desc";

  const orderBy = [
    { [sortField]: sortDir },
    { id: "asc" as const },
  ];

  const requestedSkip = Math.max(0, (page - 1) * pageSize);

  // Run status counts, total matching count, and form list in parallel
  const [statusGroupCounts, totalMatching, initialRawForms] = await Promise.all([
    prisma.form.groupBy({
      by: ["status"],
      where: {
        ownerId: userId,
        status: { not: FormStatus.TRASHED },
      },
      _count: {
        id: true,
      },
    }),
    prisma.form.count({ where }),
    prisma.form.findMany({
      where,
      orderBy,
      skip: requestedSkip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        themeKey: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  // Compute status badge counts
  const statusCounts: StatusCountsDTO = {
    all: 0,
    draft: 0,
    published: 0,
    closed: 0,
    archived: 0,
  };

  for (const group of statusGroupCounts) {
    const count = group._count.id;
    statusCounts.all += count;
    if (group.status === FormStatus.DRAFT) statusCounts.draft = count;
    if (group.status === FormStatus.PUBLISHED) statusCounts.published = count;
    if (group.status === FormStatus.CLOSED) statusCounts.closed = count;
    if (group.status === FormStatus.ARCHIVED) statusCounts.archived = count;
  }

  const pageCount = Math.max(1, Math.ceil(totalMatching / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  // In the rare event an out-of-bounds page was requested that returned empty, fallback to the safePage
  let rawForms = initialRawForms;
  if (safePage !== page && totalMatching > 0 && initialRawForms.length === 0) {
    rawForms = await prisma.form.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        themeKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  const items: MyFormItemDTO[] = rawForms.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    status: f.status,
    themeKey: f.themeKey,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    responsesCount: null,
    viewsCount: null,
  }));

  return {
    items,
    totalMatching,
    currentPage: safePage,
    pageSize,
    pageCount,
    statusCounts,
  };
}
