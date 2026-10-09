import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { AccountStatsDTO } from "../schemas/profile-schema";

export async function getAccountStats(userId: string): Promise<AccountStatsDTO> {
  try {
    const [totalForms, totalResponses, totalViews, templatesUsed] = await Promise.all([
      // Total non-trashed forms owned by user
      prisma.form.count({
        where: {
          ownerId: userId,
          status: { not: FormStatus.TRASHED },
        },
      }),
      // Total submitted responses across user's non-trashed forms
      prisma.formResponse.count({
        where: {
          form: {
            ownerId: userId,
            status: { not: FormStatus.TRASHED },
          },
        },
      }),
      // Total qualified view sessions started across user's non-trashed forms
      prisma.responseSession.count({
        where: {
          form: {
            ownerId: userId,
            status: { not: FormStatus.TRASHED },
          },
        },
      }),
      // Forms created from template provenance
      prisma.form.count({
        where: {
          ownerId: userId,
          status: { not: FormStatus.TRASHED },
          sourceTemplateId: { not: null },
        },
      }),
    ]);

    return {
      totalForms,
      totalResponses,
      totalViews,
      templatesUsed,
    };
  } catch (err) {
    console.error("Failed to query account stats:", err);
    return {
      totalForms: 0,
      totalResponses: 0,
      totalViews: 0,
      templatesUsed: 0,
    };
  }
}
