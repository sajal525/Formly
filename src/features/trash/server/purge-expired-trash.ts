import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export async function purgeExpiredTrash(batchSize: number = 50): Promise<{
  purgedCount: number;
  purgedIds: string[];
}> {
  const now = new Date();

  const expired = await prisma.form.findMany({
    where: {
      status: FormStatus.TRASHED,
      purgeAt: {
        lte: now,
      },
    },
    take: Math.min(Math.max(1, batchSize), 100),
    select: {
      id: true,
    },
  });

  if (expired.length === 0) {
    return {
      purgedCount: 0,
      purgedIds: [],
    };
  }

  const expiredIds = expired.map((f) => f.id);

  const result = await prisma.form.deleteMany({
    where: {
      id: { in: expiredIds },
    },
  });

  return {
    purgedCount: result.count,
    purgedIds: expiredIds,
  };
}
