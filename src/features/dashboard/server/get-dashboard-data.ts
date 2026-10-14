import "server-only";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export interface DashboardFormItemDTO {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  themeKey?: string | null;
  coverAssetId?: string | null;
  responsesCount?: number;
  viewsCount?: number;
  updatedAt: Date | string;
  createdAt: Date | string;
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

  // Run profile, stats, and recent forms queries concurrently scoped strictly to userId
  const [userProfile, totalForms, draftForms, recentForms] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { displayName: true },
    }),
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
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        themeKey: true,
        definition: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            responses: true,
            sessions: true,
          },
        },
      },
    }),
  ]);

  const displayName =
    userProfile?.displayName ||
    sessionData.user.name ||
    sessionData.user.username ||
    "Creator";

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
    recentForms: recentForms.map((f) => {
      const def = (f.definition as any) || {};
      return {
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        themeKey: f.themeKey || def.themeKey || "soft-lavender",
        coverAssetId: def.coverImage?.assetId || null,
        responsesCount: f._count?.responses ?? 0,
        viewsCount: f._count?.sessions ?? 0,
        updatedAt: f.updatedAt,
        createdAt: f.createdAt,
      };
    }),
  };
}
