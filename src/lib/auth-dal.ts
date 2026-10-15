import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";
import { prisma } from "./db";

export interface AuthenticatedUserDTO {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export const getCurrentSession = cache(async () => {
  try {
    const reqHeaders = await headers();
    return await auth.api.getSession({
      headers: reqHeaders,
    });
  } catch {
    return null;
  }
});

export async function getCurrentUser() {
  const sessionData = await getCurrentSession();
  return sessionData?.user ?? null;
}

export const getAuthenticatedUser = cache(async (): Promise<AuthenticatedUserDTO | null> => {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) return null;

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { displayName: true, avatarObjectKey: true, updatedAt: true },
  });

  const displayName =
    profile?.displayName ||
    sessionData.user.name ||
    sessionData.user.username ||
    "Creator";

  const avatarUrl = profile?.avatarObjectKey
    ? `/api/v1/profile/avatar?v=${profile.updatedAt.getTime()}`
    : (sessionData.user.image || null);

  // Self-heal: ensure user.image matches profile.avatarObjectKey state if out of sync
  if (profile?.avatarObjectKey && sessionData.user.image !== avatarUrl) {
    prisma.user
      .update({
        where: { id: userId },
        data: { image: avatarUrl },
      })
      .catch(() => {});
  } else if (!profile?.avatarObjectKey && sessionData.user.image) {
    prisma.user
      .update({
        where: { id: userId },
        data: { image: null },
      })
      .catch(() => {});
  }

  return {
    id: userId,
    username,
    displayName,
    avatarUrl,
  };
});

