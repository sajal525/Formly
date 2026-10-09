import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export async function permanentlyDeleteTrashedForm(
  userId: string,
  formId: string
): Promise<{ success: boolean; title: string } | null> {
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: FormStatus.TRASHED,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!existing) {
    return null;
  }

  // Neon PostgreSQL schema handles cascading delete of responses and sessions
  await prisma.form.delete({
    where: {
      id: formId,
    },
  });

  return {
    success: true,
    title: existing.title,
  };
}

export async function bulkPermanentlyDeleteTrashedForms(
  userId: string,
  formIds: string[]
): Promise<number> {
  const uniqueIds = Array.from(new Set(formIds)).slice(0, 50);

  const existing = await prisma.form.findMany({
    where: {
      id: { in: uniqueIds },
      ownerId: userId,
      status: FormStatus.TRASHED,
    },
    select: { id: true },
  });

  if (existing.length === 0) {
    return 0;
  }

  const validIds = existing.map((f) => f.id);

  const result = await prisma.form.deleteMany({
    where: {
      id: { in: validIds },
      ownerId: userId,
    },
  });

  return result.count;
}
