"use client";

import React, { useState, useEffect } from "react";
import { UserSettingsDTO } from "../schemas/settings-schema";
import {
  SettingsSectionNav,
  SettingsSection,
} from "./settings-section-nav";
import { GeneralSettingsCard } from "./general-settings-card";
import { AppearanceSettingsCard } from "./appearance-settings-card";
import { FormPreferencesCard } from "./form-preferences-card";
import { EditorPreferencesCard } from "./editor-preferences-card";
import { NotificationsCard } from "./notifications-card";
import { LanguageRegionCard } from "./language-region-card";
import { SettingsSaveBar } from "./settings-save-bar";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsWorkspaceClientProps {
  initialSettings: UserSettingsDTO;
}

export function SettingsWorkspaceClient({
  initialSettings,
}: SettingsWorkspaceClientProps) {
  const [savedSettings, setSavedSettings] =
    useState<UserSettingsDTO>(initialSettings);
  const [localSettings, setLocalSettings] =
    useState<UserSettingsDTO>(initialSettings);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const isDirty = JSON.stringify(savedSettings) !== JSON.stringify(localSettings);

  const showToast = (text: string, type: "success" | "error") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleFieldChange = <K extends keyof UserSettingsDTO>(
    key: K,
    value: UserSettingsDTO[K]
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus("idle");

    // Dynamic appearance preview if themeMode changed
    if (key === "themeMode") {
      const mode = value as string;
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (mode === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }
  };

  const handleDiscard = () => {
    setLocalSettings(savedSettings);
    setSaveStatus("idle");
    // Restore appearance from saved
    if (savedSettings.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedSettings.themeMode === "light") {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    try {
      setIsSaving(true);
      setSaveStatus("idle");

      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localSettings),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update settings");
      }

      const data = await res.json();
      setSavedSettings(data.settings);
      setLocalSettings(data.settings);
      setSaveStatus("saved");
      showToast("Settings saved successfully.", "success");

      // Set cookie for theme bootstrapping to avoid flash
      document.cookie = `formly_theme=${data.settings.themeMode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (err: any) {
      setSaveStatus("error");
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSection = (section: SettingsSection) => {
    setActiveSection(section);
    // Smooth scroll to card if on page
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your Formly experience and manage your preferences.
        </p>
      </div>

      {/* Main Responsive 3-Zone Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Zone 1: Section Navigator (Left Column) */}
        <div className="lg:col-span-3 sticky top-4">
          <SettingsSectionNav
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
          />
        </div>

        {/* Zone 2: General, Form & Editor Cards (Middle Column) */}
        <div className="lg:col-span-5 space-y-6">
          <GeneralSettingsCard
            settings={localSettings}
            onChange={handleFieldChange}
          />
          <FormPreferencesCard
            settings={localSettings}
            onChange={handleFieldChange}
          />
          <EditorPreferencesCard
            settings={localSettings}
            onChange={handleFieldChange}
          />
        </div>

        {/* Zone 3: Appearance, Notifications & Language (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <AppearanceSettingsCard
            settings={localSettings}
            onChange={handleFieldChange}
          />
          <NotificationsCard />
          <LanguageRegionCard
            settings={localSettings}
            onChange={handleFieldChange}
          />
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-4 z-40 max-w-xl ml-auto">
        <SettingsSaveBar
          isDirty={isDirty}
          isSaving={isSaving}
          saveStatus={saveStatus}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>
    </div>
  );
}
