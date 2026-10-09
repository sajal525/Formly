import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus, DeviceCategory, SubmissionSource } from "@prisma/client";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  BuilderFormDefinition,
  builderFormDefinitionSchema,
} from "@/features/builder/schemas/builder-definition-schema";
import { PublicSubmitPayload } from "../schemas/public-submission-schema";

export function createFormPasswordHash(formId: string, password: string): string {
  return crypto.createHash("sha256").update(`${formId}:${password}`).digest("hex");
}

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
  definition: BuilderFormDefinition;
  status: FormStatus;
  isPasswordProtected?: boolean;
  isClosed?: boolean;
  closedMessage?: string;
  hasAlreadySubmitted?: boolean;
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

  const parsedDef = builderFormDefinitionSchema.safeParse(form.definition);
  const definition: BuilderFormDefinition = parsedDef.success
    ? parsedDef.data
    : {
        schemaVersion: 1,
        title: form.title,
        description: form.description,
        themeKey: form.themeKey || "soft-lavender",
        settings: {
          category: "Education",
          defaultLanguage: "English",
          accessType: "public",
          passwordRequired: false,
          acceptingResponses: true,
          closedMessage: "This form is no longer accepting responses.",
          collectEmailAddresses: false,
          limitOneResponse: false,
          allowMultipleSubmissions: true,
          setResponseLimit: false,
          showProgressIndicator: true,
          shuffleQuestionOrder: false,
          showQuestionNumbers: true,
          oneQuestionPerPage: false,
          confirmationType: "text",
          confirmationTitle: "Thank you!",
          confirmationMessage: "Your response has been submitted successfully.",
          emailNewResponses: true,
          notifyResponseLimit: true,
          notifySuspiciousActivity: true,
          allowEditAfterSubmission: false,
          saveAndContinueLater: false,
        },
        questions: [],
      };

  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // cookies() unavailable in non-request environments
  }

  // 1. Check if accepting responses is turned off
  if (definition.settings && definition.settings.acceptingResponses === false) {
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      themeKey: form.themeKey || definition.themeKey || "soft-lavender",
      definition,
      status: form.status,
      isClosed: true,
      closedMessage: definition.settings.closedMessage || "This form is no longer accepting responses.",
    };
  }

  // 2. Check response limit
  if (definition.settings?.setResponseLimit && definition.settings.responseLimit) {
    const totalCount = await prisma.formResponse.count({ where: { formId } });
    if (totalCount >= definition.settings.responseLimit) {
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        themeKey: form.themeKey || definition.themeKey || "soft-lavender",
        definition,
        status: form.status,
        isClosed: true,
        closedMessage: "This form has reached its response limit and is no longer accepting submissions.",
      };
    }
  }

  // 3. Check duplicate submission cookie if limitOneResponse is enabled
  if (definition.settings?.limitOneResponse && cookieStore) {
    const submittedCookie = cookieStore.get(`formly_submitted_${formId}`)?.value;
    if (submittedCookie) {
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        themeKey: form.themeKey || definition.themeKey || "soft-lavender",
        definition,
        status: form.status,
        hasAlreadySubmitted: true,
      };
    }
  }

  // 4. Check password protection
  const isPasswordRequired =
    (definition.settings?.passwordRequired || definition.settings?.accessType === "password") &&
    Boolean(definition.settings?.accessPassword?.trim());

  if (isPasswordRequired) {
    const expectedHash = createFormPasswordHash(formId, definition.settings!.accessPassword!.trim());
    const accessCookie = cookieStore?.get(`formly_access_${formId}`)?.value;
    if (!accessCookie || accessCookie !== expectedHash) {
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        themeKey: form.themeKey || definition.themeKey || "soft-lavender",
        definition: {
          ...definition,
          questions: [], // Protect questions from leaking
        },
        status: form.status,
        isPasswordProtected: true,
      };
    }
  }

  // 5. Shuffle questions if configured
  let finalQuestions = definition.questions;
  if (definition.settings?.shuffleQuestionOrder && finalQuestions.length > 1) {
    const shuffled = [...finalQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    finalQuestions = shuffled;
  }

  return {
    id: form.id,
    title: form.title,
    description: form.description,
    themeKey: form.themeKey || definition.themeKey || "soft-lavender",
    definition: {
      ...definition,
      questions: finalQuestions,
    },
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

export interface SubmitFormResponseResult {
  success: boolean;
  responseId?: string;
  error?: string;
  confirmationType?: "text" | "custom_page" | "redirect";
  confirmationTitle?: string;
  confirmationMessage?: string;
  customPageTitle?: string;
  customPageDescription?: string;
  redirectUrl?: string;
  allowMultipleSubmissions?: boolean;
}

export async function submitFormResponse(
  formId: string,
  payload: PublicSubmitPayload
): Promise<SubmitFormResponseResult> {
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

  const parsedDef = builderFormDefinitionSchema.safeParse(form.definition);
  if (!parsedDef.success) {
    return { success: false, error: "Invalid form definition snapshot." };
  }

  const definition = parsedDef.data;
  const settings = definition.settings;

  // 1. Enforce accepting responses
  if (settings && settings.acceptingResponses === false) {
    return {
      success: false,
      error: settings.closedMessage || "This form is no longer accepting responses.",
    };
  }

  // 2. Enforce response limit
  if (settings?.setResponseLimit && settings.responseLimit) {
    const totalCount = await prisma.formResponse.count({ where: { formId } });
    if (totalCount >= settings.responseLimit) {
      return {
        success: false,
        error: "This form has reached its response limit and is no longer accepting submissions.",
      };
    }
  }

  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {}

  // 3. Enforce single response restriction
  if (settings?.limitOneResponse) {
    if (cookieStore?.get(`formly_submitted_${formId}`)?.value) {
      return {
        success: false,
        error: "You have already submitted a response to this form.",
      };
    }

    if (payload.sessionId) {
      const existing = await prisma.formResponse.findFirst({
        where: {
          formId,
          responseSessionId: payload.sessionId,
        },
      });
      if (existing) {
        return {
          success: false,
          error: "You have already submitted a response to this form.",
        };
      }
    }
  }

  // 4. Enforce password protection if enabled
  const isPasswordRequired =
    (settings?.passwordRequired || settings?.accessType === "password") &&
    Boolean(settings?.accessPassword?.trim());

  if (isPasswordRequired) {
    const expectedHash = createFormPasswordHash(formId, settings!.accessPassword!.trim());
    const accessCookie = cookieStore?.get(`formly_access_${formId}`)?.value;
    const providedPassword = (payload as any).accessPassword?.trim();

    if ((!accessCookie || accessCookie !== expectedHash) && providedPassword !== settings!.accessPassword!.trim()) {
      return {
        success: false,
        error: "Password authentication required to submit this form.",
      };
    }
  }

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

  return {
    success: true,
    responseId: created.id,
    confirmationType: settings?.confirmationType || "text",
    confirmationTitle: settings?.confirmationTitle || "Thank you!",
    confirmationMessage: settings?.confirmationMessage || "Your response has been submitted successfully.",
    customPageTitle: settings?.customPageTitle,
    customPageDescription: settings?.customPageDescription,
    redirectUrl: settings?.redirectUrl,
    allowMultipleSubmissions: settings?.allowMultipleSubmissions ?? true,
  };
}
