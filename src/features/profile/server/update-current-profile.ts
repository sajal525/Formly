import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import {
  ProfileDTO,
  UpdateProfileInput,
  updateProfileSchema,
} from "../schemas/profile-schema";

export async function updateCurrentProfile(
  input: UpdateProfileInput
): Promise<{ success: boolean; profile?: ProfileDTO; error?: string }> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Invalid profile data";
    return { success: false, error: errorMsg };
  }

  const data = parsed.data;

  // Build safe update object where undefined fields are omitted, but explicit nulls are persisted
  const updatePayload: Record<string, string | null> = {};

  if (data.displayName !== undefined) {
    updatePayload.displayName = data.displayName?.trim() || null;
  }
  if (data.contactEmail !== undefined) {
    updatePayload.contactEmail = data.contactEmail?.trim() || null;
    // Clearing or changing contact email resets verification timestamp
    updatePayload.contactEmailVerifiedAt = null;
  }
  if (data.phone !== undefined) {
    updatePayload.phone = data.phone?.trim() || null;
  }
  if (data.institution !== undefined) {
    updatePayload.institution = data.institution?.trim() || null;
  }
  if (data.department !== undefined) {
    updatePayload.department = data.department?.trim() || null;
  }
  if (data.rollNumber !== undefined) {
    updatePayload.rollNumber = data.rollNumber?.trim() || null;
  }
  if (data.studyYear !== undefined) {
    updatePayload.studyYear = data.studyYear?.trim() || null;
  }
  if (data.division !== undefined) {
    updatePayload.division = data.division?.trim() || null;
  }
  if (data.bio !== undefined) {
    updatePayload.bio = data.bio?.trim() || null;
  }

  const updatedProfile = await prisma.profile.upsert({
    where: { userId },
    update: updatePayload,
    create: {
      userId,
      displayName: updatePayload.displayName ?? null,
      contactEmail: updatePayload.contactEmail ?? null,
      phone: updatePayload.phone ?? null,
      institution: updatePayload.institution ?? null,
      department: updatePayload.department ?? null,
      rollNumber: updatePayload.rollNumber ?? null,
      studyYear: updatePayload.studyYear ?? null,
      division: updatePayload.division ?? null,
      bio: updatePayload.bio ?? null,
    },
  });

  return {
    success: true,
    profile: {
      userId,
      username,
      displayName: updatedProfile.displayName ?? null,
      contactEmail: updatedProfile.contactEmail ?? null,
      contactEmailVerified: Boolean(updatedProfile.contactEmailVerifiedAt),
      phone: updatedProfile.phone ?? null,
      institution: updatedProfile.institution ?? null,
      department: updatedProfile.department ?? null,
      rollNumber: updatedProfile.rollNumber ?? null,
      studyYear: updatedProfile.studyYear ?? null,
      division: updatedProfile.division ?? null,
      bio: updatedProfile.bio ?? null,
      avatarUrl: null,
      coverUrl: null,
    },
  };
}
