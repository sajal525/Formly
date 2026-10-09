"use client";

import React from "react";
import { Bell, Clock, Target, ShieldAlert } from "lucide-react";
import { FormSettings } from "../../schemas/builder-definition-schema";
import { Switch } from "@/components/ui/switch";

interface NotificationsSettingsCardProps {
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function NotificationsSettingsCard({
  settings,
  onSettingsChange,
}: NotificationsSettingsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Notifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Get notified about form activities.
          </p>
        </div>
      </div>

      {/* Toggles list */}
      <div className="space-y-3.5 pt-1">
        {/* Email me new responses */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-notify-responses"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Email me new responses
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Receive notification as soon as a response arrives.
            </p>
          </div>
          <Switch
            id="toggle-notify-responses"
            checked={settings.emailNewResponses}
            onCheckedChange={(checked) =>
              onSettingsChange({ emailNewResponses: checked })
            }
          />
        </div>

        {/* Notify for response limit reached */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-notify-limit"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Notify for response limit reached
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Alert when your configured target quota is reached.
            </p>
          </div>
          <Switch
            id="toggle-notify-limit"
            checked={settings.notifyResponseLimit}
            onCheckedChange={(checked) =>
              onSettingsChange({ notifyResponseLimit: checked })
            }
          />
        </div>

        {/* Notify for suspicious activity */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-notify-suspicious"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Notify for suspicious activity
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Security alerts for bot patterns or rapid flood submissions.
            </p>
          </div>
          <Switch
            id="toggle-notify-suspicious"
            checked={settings.notifySuspiciousActivity}
            onCheckedChange={(checked) =>
              onSettingsChange({ notifySuspiciousActivity: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
