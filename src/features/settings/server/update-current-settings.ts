import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import {
  UpdateUserSettingsInput,
  updateUserSettingsSchema,
  userSettingsSchema,
  UserSettingsDTO,
} from "../schemas/settings-schema";

export async function updateCurrentSettings(
  input: UpdateUserSettingsInput
): Promise<{ success: boolean; settings?: UserSettingsDTO; error?: string }> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = sessionData.user.id;

  const parsed = updateUserSettingsSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Invalid settings input";
    return { success: false, error: errorMsg };
  }

  const dataToUpdate = parsed.data;
  const defaults = userSettingsSchema.parse({});

  const updated = await prisma.userSettings.upsert({
    where: { userId },
    update: dataToUpdate,
    create: {
      userId,
      defaultLandingPage: dataToUpdate.defaultLandingPage ?? defaults.defaultLandingPage,
      defaultFormView: dataToUpdate.defaultFormView ?? defaults.defaultFormView,
      itemsPerPage: dataToUpdate.itemsPerPage ?? defaults.itemsPerPage,
      dateFormat: dataToUpdate.dateFormat ?? defaults.dateFormat,
      timeFormat: dataToUpdate.timeFormat ?? defaults.timeFormat,
      themeMode: dataToUpdate.themeMode ?? defaults.themeMode,
      accentColor: dataToUpdate.accentColor ?? defaults.accentColor,
      defaultThemeId: dataToUpdate.defaultThemeId ?? defaults.defaultThemeId,
      showProgressIndicator: dataToUpdate.showProgressIndicator ?? defaults.showProgressIndicator,
      collectEmailByDefault: dataToUpdate.collectEmailByDefault ?? defaults.collectEmailByDefault,
      allowMultipleSubmissions: dataToUpdate.allowMultipleSubmissions ?? defaults.allowMultipleSubmissions,
      autoSaveForms: dataToUpdate.autoSaveForms ?? defaults.autoSaveForms,
      showKeyboardShortcuts: dataToUpdate.showKeyboardShortcuts ?? defaults.showKeyboardShortcuts,
      defaultQuestionType: dataToUpdate.defaultQuestionType ?? defaults.defaultQuestionType,
      showQuestionNumbers: dataToUpdate.showQuestionNumbers ?? defaults.showQuestionNumbers,
      locale: dataToUpdate.locale ?? defaults.locale,
      timeZone: dataToUpdate.timeZone ?? defaults.timeZone,
      region: dataToUpdate.region ?? defaults.region,
    },
  });

  return {
    success: true,
    settings: userSettingsSchema.parse(updated),
  };
}
