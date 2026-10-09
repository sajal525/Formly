import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { TRASH_RETENTION_DAYS } from "@/features/trash/server/trash-constants";

export interface FormActionResponseDTO {
  id: string;
  title: string;
  status: FormStatus;
  updatedAt: string;
}

export async function renameForm(
  userId: string,
  formId: string,
  newTitle: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      title: newTitle.trim(),
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

export async function archiveForm(
  userId: string,
  formId: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { notIn: [FormStatus.ARCHIVED, FormStatus.TRASHED] },
    },
    select: { id: true, status: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: FormStatus.ARCHIVED,
      statusBeforeArchive: existing.status,
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

export async function restoreForm(
  userId: string,
  formId: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: FormStatus.ARCHIVED,
    },
    select: { id: true, statusBeforeArchive: true },
  });

  if (!existing) {
    return null;
  }

  const targetStatus = existing.statusBeforeArchive ?? FormStatus.DRAFT;

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: targetStatus,
      statusBeforeArchive: null,
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

export async function publishForm(
  userId: string,
  formId: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: FormStatus.PUBLISHED,
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

export async function closeForm(
  userId: string,
  formId: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: FormStatus.CLOSED,
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

export async function bulkArchiveForms(
  userId: string,
  formIds: string[]
): Promise<number> {
  const uniqueIds = Array.from(new Set(formIds)).slice(0, 50);

  const formsToArchive = await prisma.form.findMany({
    where: {
      id: { in: uniqueIds },
      ownerId: userId,
      status: { notIn: [FormStatus.ARCHIVED, FormStatus.TRASHED] },
    },
    select: { id: true, status: true },
  });

  if (formsToArchive.length === 0) {
    return 0;
  }

  await prisma.$transaction(
    formsToArchive.map((f) =>
      prisma.form.update({
        where: { id: f.id },
        data: {
          status: FormStatus.ARCHIVED,
          statusBeforeArchive: f.status,
        },
      })
    )
  );

  return formsToArchive.length;
}

export async function trashForm(
  userId: string,
  formId: string
): Promise<FormActionResponseDTO | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: { id: true, status: true },
  });

  if (!existing) {
    return null;
  }

  const now = new Date();
  const purgeAt = new Date(
    now.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      status: FormStatus.TRASHED,
      statusBeforeTrash: existing.status,
      deletedAt: now,
      purgeAt,
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

export async function bulkTrashForms(
  userId: string,
  formIds: string[]
): Promise<number> {
  const uniqueIds = Array.from(new Set(formIds)).slice(0, 50);

  const formsToTrash = await prisma.form.findMany({
    where: {
      id: { in: uniqueIds },
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: { id: true, status: true },
  });

  if (formsToTrash.length === 0) {
    return 0;
  }

  const now = new Date();
  const purgeAt = new Date(
    now.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.$transaction(
    formsToTrash.map((f) =>
      prisma.form.update({
        where: { id: f.id },
        data: {
          status: FormStatus.TRASHED,
          statusBeforeTrash: f.status,
          deletedAt: now,
          purgeAt,
        },
      })
    )
  );

  return formsToTrash.length;
}
