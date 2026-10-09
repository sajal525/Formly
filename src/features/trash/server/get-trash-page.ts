import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { TrashQueryParams } from "../schemas/trash-query-schema";
import { TRASH_RETENTION_DAYS } from "./trash-constants";

export interface TrashItemDTO {
  id: string;
  title: string;
  description: string | null;
  type: "form" | "template" | "other";
  statusBeforeTrash: FormStatus | null;
  themeKey: string | null;
  createdAt: string;
  deletedAt: string;
  purgeAt: string;
  daysLeft: number;
  isExpired: boolean;
  totalResponses: number;
}

export interface TrashCountsDTO {
  all: number;
  forms: number;
  templates: number;
  others: number;
}

export interface TrashPageDTO {
  items: TrashItemDTO[];
  totalMatching: number;
  currentPage: number;
  pageSize: number;
  pageCount: number;
  counts: TrashCountsDTO;
  retentionDays: number;
}

export async function getTrashPage(
  userId: string,
  params: TrashQueryParams
): Promise<TrashPageDTO> {
  const { type, q, sort, page, pageSize } = params;

  // If user filtered by templates or others (which have no user-owned trashed instances), return empty
  if (type === "templates" || type === "others") {
    const formsCount = await prisma.form.count({
      where: {
        ownerId: userId,
        status: FormStatus.TRASHED,
      },
    });
    return {
      items: [],
      totalMatching: 0,
      currentPage: 1,
      pageSize,
      pageCount: 1,
      counts: {
        all: formsCount,
        forms: formsCount,
        templates: 0,
        others: 0,
      },
      retentionDays: TRASH_RETENTION_DAYS,
    };
  }

  // Base where query
  const where: any = {
    ownerId: userId,
    status: FormStatus.TRASHED,
  };

  // Search filter
  const isFiltered = Boolean(q && q.trim().length > 0);
  if (isFiltered) {
    const trimmed = q!.trim().slice(0, 100);
    where.OR = [
      { title: { contains: trimmed, mode: "insensitive" } },
      { description: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  // Sorting
  let orderBy: any[];
  switch (sort) {
    case "deleted_asc":
      orderBy = [{ deletedAt: "asc" }, { id: "asc" }];
      break;
    case "name_asc":
      orderBy = [{ title: "asc" }, { id: "asc" }];
      break;
    case "expiring_asc":
      orderBy = [{ purgeAt: "asc" }, { id: "asc" }];
      break;
    case "deleted_desc":
    default:
      orderBy = [{ deletedAt: "desc" }, { id: "desc" }];
      break;
  }

  const requestedSkip = Math.max(0, (page - 1) * pageSize);

  // Run counts and items in a single concurrent Promise.all
  const [formsCount, totalMatchingResult, initialRawForms] = await Promise.all([
    prisma.form.count({
      where: {
        ownerId: userId,
        status: FormStatus.TRASHED,
      },
    }),
    isFiltered ? prisma.form.count({ where }) : Promise.resolve(null),
    prisma.form.findMany({
      where,
      orderBy,
      skip: requestedSkip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        statusBeforeTrash: true,
        themeKey: true,
        createdAt: true,
        deletedAt: true,
        purgeAt: true,
      },
    }),
  ]);

  const totalMatching = isFiltered ? (totalMatchingResult ?? 0) : formsCount;
  const pageCount = Math.max(1, Math.ceil(totalMatching / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

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
        statusBeforeTrash: true,
        themeKey: true,
        createdAt: true,
        deletedAt: true,
        purgeAt: true,
      },
    });
  }

  const counts: TrashCountsDTO = {
    all: formsCount,
    forms: formsCount,
    templates: 0,
    others: 0,
  };

  // Fetch response counts for these forms
  const formIds = rawForms.map((f) => f.id);
  const responseCounts =
    formIds.length > 0
      ? await prisma.formResponse.groupBy({
          by: ["formId"],
          where: { formId: { in: formIds } },
          _count: { id: true },
        })
      : [];

  const responseCountMap = new Map<string, number>();
  for (const rc of responseCounts) {
    responseCountMap.set(rc.formId, rc._count.id);
  }

  const now = new Date();

  const items: TrashItemDTO[] = rawForms.map((f) => {
    const deletedDate = f.deletedAt || f.createdAt;
    const purgeDate =
      f.purgeAt ||
      new Date(
        deletedDate.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
      );

    const msDiff = purgeDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    const isExpired = msDiff <= 0;

    return {
      id: f.id,
      title: f.title,
      description: f.description,
      type: "form",
      statusBeforeTrash: f.statusBeforeTrash,
      themeKey: f.themeKey,
      createdAt: f.createdAt.toISOString(),
      deletedAt: deletedDate.toISOString(),
      purgeAt: purgeDate.toISOString(),
      daysLeft,
      isExpired,
      totalResponses: responseCountMap.get(f.id) || 0,
    };
  });

  return {
    items,
    totalMatching,
    currentPage: safePage,
    pageSize,
    pageCount,
    counts,
    retentionDays: TRASH_RETENTION_DAYS,
  };
}
