import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import { ProfileDTO } from "../schemas/profile-schema";

export async function getCurrentProfile(): Promise<ProfileDTO | null> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return null;
  }

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  return {
    userId,
    username,
    displayName: profile?.displayName ?? null,
    contactEmail: profile?.contactEmail ?? null,
    contactEmailVerified: Boolean(profile?.contactEmailVerifiedAt),
    phone: profile?.phone ?? null,
    institution: profile?.institution ?? null,
    department: profile?.department ?? null,
    rollNumber: profile?.rollNumber ?? null,
    studyYear: profile?.studyYear ?? null,
    division: profile?.division ?? null,
    bio: profile?.bio ?? null,
    avatarUrl: null, // R2 storage is not configured yet; neutral default visual fallback
    coverUrl: null,
  };
}
