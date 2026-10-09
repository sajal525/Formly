import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus, DeviceCategory, SubmissionSource } from "@prisma/client";
import { FormDefinitionV1, formDefinitionV1Schema } from "@/features/templates/data/definition-v1-schema";
import { PublicSubmitPayload } from "../schemas/public-submission-schema";

export function parseDeviceCategory(userAgent?: string | null): DeviceCategory {
  if (!userAgent) return DeviceCategory.UNKNOWN;
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return DeviceCategory.TABLET;
  }
  if (/mobile|iphone|ipod|android/i.test(ua)) {
    return DeviceCategory.MOBILE;
  }
  if (/macintosh|windows|linux|cros/i.test(ua)) {
    return DeviceCategory.DESKTOP;
  }
  return DeviceCategory.OTHER;
}

export function parseSubmissionSource(sourceKey?: string | null): SubmissionSource {
  if (!sourceKey) return SubmissionSource.DIRECT;
  const clean = sourceKey.toUpperCase().trim();
  if (clean === "QR" || clean === "QRCODE" || clean === "QR_CODE") return SubmissionSource.QR;
  if (clean === "EMBED" || clean === "EMBEDDED" || clean === "IFRAME") return SubmissionSource.EMBED;
  if (clean === "SHARED" || clean === "SHARE" || clean === "SOCIAL") return SubmissionSource.SHARED;
  if (clean === "DIRECT") return SubmissionSource.DIRECT;
  return SubmissionSource.OTHER;
}

export interface PublicFormDTO {
  id: string;
  title: string;
  description: string | null;
  themeKey: string;
  definition: FormDefinitionV1;
  status: FormStatus;
}

export async function getPublicFormData(formId: string): Promise<PublicFormDTO | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      title: true,
      description: true,
      themeKey: true,
      definition: true,
      status: true,
    },
  });

  if (!form || form.status !== FormStatus.PUBLISHED) {
    return null;
  }

  const parsedDef = formDefinitionV1Schema.safeParse(form.definition);
  const definition: FormDefinitionV1 = parsedDef.success
    ? parsedDef.data
    : {
        schemaVersion: 1,
        title: form.title,
        description: form.description,
        themeKey: form.themeKey || "default",
        questions: [],
      };

  return {
    id: form.id,
    title: form.title,
    description: form.description,
    themeKey: form.themeKey || "default",
    definition,
    status: form.status,
  };
}

export async function startResponseSession(
  formId: string,
  options?: {
    sessionHash?: string;
    userAgent?: string | null;
    sourceKey?: string | null;
  }
): Promise<{ sessionId: string; startedAt: string } | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, status: true },
  });

  if (!form || form.status !== FormStatus.PUBLISHED) {
    return null;
  }

  const sessionHash = options?.sessionHash;
  const deviceCategory = parseDeviceCategory(options?.userAgent);
  const sourceKey = parseSubmissionSource(options?.sourceKey);

  // If a sessionHash is given, check for an existing incomplete session in the last 2 hours
  if (sessionHash) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const existing = await prisma.responseSession.findFirst({
      where: {
        formId,
        sessionHash,
        completedAt: null,
        startedAt: { gte: twoHoursAgo },
      },
      select: { id: true, startedAt: true },
    });

    if (existing) {
      return {
        sessionId: existing.id,
        startedAt: existing.startedAt.toISOString(),
      };
    }
  }

  const session = await prisma.responseSession.create({
    data: {
      formId,
      sessionHash: sessionHash || null,
      deviceCategory,
      sourceKey,
    },
    select: {
      id: true,
      startedAt: true,
    },
  });

  return {
    sessionId: session.id,
    startedAt: session.startedAt.toISOString(),
  };
}

export async function recordSessionProgress(
  formId: string,
  sessionId: string,
  milestone: "FIRST_INTERACTION" | "REACHED_LAST_QUESTION"
): Promise<{ success: boolean }> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, status: true },
  });

  if (!form || form.status !== FormStatus.PUBLISHED) {
    return { success: false };
  }

  const session = await prisma.responseSession.findFirst({
    where: { id: sessionId, formId },
    select: {
      id: true,
      firstInteractionAt: true,
      reachedLastQuestionAt: true,
    },
  });

  if (!session) {
    return { success: false };
  }

  const now = new Date();
  const updateData: { firstInteractionAt?: Date; reachedLastQuestionAt?: Date } = {};

  if (milestone === "FIRST_INTERACTION" && !session.firstInteractionAt) {
    updateData.firstInteractionAt = now;
  } else if (milestone === "REACHED_LAST_QUESTION" && !session.reachedLastQuestionAt) {
    updateData.reachedLastQuestionAt = now;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.responseSession.update({
      where: { id: session.id },
      data: updateData,
    });
  }

  return { success: true };
}

export async function submitFormResponse(
  formId: string,
  payload: PublicSubmitPayload
): Promise<{ success: boolean; responseId?: string; error?: string }> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      status: true,
      definition: true,
    },
  });

  if (!form || form.status !== FormStatus.PUBLISHED) {
    return { success: false, error: "This form is no longer accepting responses." };
  }

  const parsedDef = formDefinitionV1Schema.safeParse(form.definition);
  if (!parsedDef.success) {
    return { success: false, error: "Invalid form definition snapshot." };
  }

  const definition = parsedDef.data;
  const questions = definition.questions;

  // Validate required questions
  for (const q of questions) {
    if (q.required) {
      const val = payload.answers[q.id];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return { success: false, error: `Please answer required question: "${q.label}"` };
      }
    }
  }

  // Sanitize answers: only keep keys matching questions in the definition
  const sanitizedAnswers: Record<string, any> = {};
  for (const q of questions) {
    const val = payload.answers[q.id];
    if (val !== undefined && val !== null) {
      if (typeof val === "string") {
        sanitizedAnswers[q.id] = val.slice(0, 5000).trim();
      } else if (Array.isArray(val)) {
        sanitizedAnswers[q.id] = val.slice(0, 50).map((item) => String(item).slice(0, 500));
      } else {
        sanitizedAnswers[q.id] = val;
      }
    }
  }

  const now = new Date();
  let durationSeconds: number | null = null;
  let validSessionId: string | null = null;

  if (payload.sessionId) {
    const session = await prisma.responseSession.findFirst({
      where: {
        id: payload.sessionId,
        formId,
        completedAt: null,
      },
      select: { id: true, startedAt: true },
    });

    if (session) {
      validSessionId = session.id;
      const diffMs = now.getTime() - session.startedAt.getTime();
      durationSeconds = Math.max(1, Math.round(diffMs / 1000));
    }
  }

  // Atomically create response and complete session if present
  const created = await prisma.$transaction(async (tx) => {
    if (validSessionId) {
      await tx.responseSession.update({
        where: { id: validSessionId },
        data: { completedAt: now },
      });
    }

    return tx.formResponse.create({
      data: {
        formId,
        responseSessionId: validSessionId,
        schemaVersion: 1,
        definitionSnapshot: definition,
        answers: sanitizedAnswers,
        durationSeconds,
        submittedAt: now,
      },
      select: { id: true },
    });
  });

  return { success: true, responseId: created.id };
}
