import "server-only";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export interface DashboardFormItemDTO {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  updatedAt: Date;
  createdAt: Date;
}

export interface DashboardDataDTO {
  user: {
    id: string;
    username: string;
    displayName: string;
  };
  stats: {
    totalForms: number;
    draftForms: number;
  };
  recentForms: DashboardFormItemDTO[];
}

export async function getDashboardData(): Promise<DashboardDataDTO | null> {
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    return null;
  }

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  // Check optional profile for displayName
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { displayName: true },
  });

  const displayName =
    userProfile?.displayName ||
    sessionData.user.name ||
    sessionData.user.username ||
    "Creator";

  // Run stats and recent forms queries scoped strictly to userId
  const [totalForms, draftForms, recentForms] = await Promise.all([
    prisma.form.count({
      where: {
        ownerId: userId,
        status: { not: "TRASHED" },
      },
    }),
    prisma.form.count({
      where: {
        ownerId: userId,
        status: "DRAFT",
      },
    }),
    prisma.form.findMany({
      where: {
        ownerId: userId,
        status: { not: "TRASHED" },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    user: {
      id: userId,
      username,
      displayName,
    },
    stats: {
      totalForms,
      draftForms,
    },
    recentForms,
  };
}
