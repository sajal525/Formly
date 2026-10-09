import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export interface RestoreFormResultDTO {
  id: string;
  title: string;
  status: FormStatus;
  updatedAt: string;
}

export async function restoreTrashedForm(
  userId: string,
  formId: string,
  restoreAs: "previous_status" | "draft" = "previous_status"
): Promise<RestoreFormResultDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: FormStatus.TRASHED,
    },
    select: {
      id: true,
      title: true,
      statusBeforeTrash: true,
    },
  });

  if (!existing) {
    return null;
  }

  const targetStatus =
    restoreAs === "draft"
      ? FormStatus.DRAFT
      : existing.statusBeforeTrash || FormStatus.DRAFT;

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: targetStatus,
      statusBeforeTrash: null,
      deletedAt: null,
      purgeAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    status: updated.status,
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function bulkRestoreTrashedForms(
  userId: string,
  formIds: string[]
): Promise<number> {
  const uniqueIds = Array.from(new Set(formIds)).slice(0, 50);

  const existingForms = await prisma.form.findMany({
    where: {
      id: { in: uniqueIds },
      ownerId: userId,
      status: FormStatus.TRASHED,
    },
    select: {
      id: true,
      statusBeforeTrash: true,
    },
  });

  if (existingForms.length === 0) {
    return 0;
  }

  await prisma.$transaction(
    existingForms.map((f) =>
      prisma.form.update({
        where: { id: f.id },
        data: {
          status: f.statusBeforeTrash || FormStatus.DRAFT,
          statusBeforeTrash: null,
          deletedAt: null,
          purgeAt: null,
        },
      })
    )
  );

  return existingForms.length;
}
