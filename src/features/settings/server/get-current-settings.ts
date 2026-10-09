import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import {
  UserSettingsDTO,
  userSettingsSchema,
} from "../schemas/settings-schema";

export async function getCurrentSettings(): Promise<UserSettingsDTO | null> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return null;
  }

  const userId = sessionData.user.id;

  const existingSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!existingSettings) {
    // Lazily upsert server defaults
    const defaults = userSettingsSchema.parse({});
    try {
      const created = await prisma.userSettings.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          defaultLandingPage: defaults.defaultLandingPage,
          defaultFormView: defaults.defaultFormView,
          itemsPerPage: defaults.itemsPerPage,
          dateFormat: defaults.dateFormat,
          timeFormat: defaults.timeFormat,
          themeMode: defaults.themeMode,
          accentColor: defaults.accentColor,
          defaultThemeId: defaults.defaultThemeId,
          showProgressIndicator: defaults.showProgressIndicator,
          collectEmailByDefault: defaults.collectEmailByDefault,
          allowMultipleSubmissions: defaults.allowMultipleSubmissions,
          autoSaveForms: defaults.autoSaveForms,
          showKeyboardShortcuts: defaults.showKeyboardShortcuts,
          defaultQuestionType: defaults.defaultQuestionType,
          showQuestionNumbers: defaults.showQuestionNumbers,
          locale: defaults.locale,
          timeZone: defaults.timeZone,
          region: defaults.region,
        },
      });

      return userSettingsSchema.parse(created);
    } catch {
      const retry = await prisma.userSettings.findUnique({
        where: { userId },
      });
      if (retry) {
        return userSettingsSchema.parse(retry);
      }
      return defaults;
    }
  }

  return userSettingsSchema.parse(existingSettings);
}
