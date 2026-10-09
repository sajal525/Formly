"use client";

import React from "react";
import { BarChart3, Radio, Mail, UserCheck, Hash } from "lucide-react";
import { FormSettings } from "../../schemas/builder-definition-schema";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ResponseSettingsCardProps {
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function ResponseSettingsCard({
  settings,
  onSettingsChange,
}: ResponseSettingsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Response Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage how responses are collected.
          </p>
        </div>
      </div>

      {/* Toggles list */}
      <div className="space-y-3.5 pt-1">
        {/* Accepting Responses */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-accepting-responses"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Accepting responses
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Allow people to submit responses to this form.
            </p>
          </div>
          <Switch
            id="toggle-accepting-responses"
            checked={settings.acceptingResponses}
            onCheckedChange={(checked) =>
              onSettingsChange({ acceptingResponses: checked })
            }
          />
        </div>

        {/* Closed form message if not accepting */}
        {!settings.acceptingResponses && (
          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5 animate-in fade-in duration-200">
            <label className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 block">
              Message to respondents when closed
            </label>
            <Input
              value={settings.closedMessage || ""}
              onChange={(e) => onSettingsChange({ closedMessage: e.target.value })}
              placeholder="This form is no longer accepting responses."
              className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800"
            />
          </div>
        )}

        {/* Collect Email Addresses */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-collect-emails"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Collect email addresses
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automatically collect email addresses.
            </p>
          </div>
          <Switch
            id="toggle-collect-emails"
            checked={settings.collectEmailAddresses}
            onCheckedChange={(checked) =>
              onSettingsChange({ collectEmailAddresses: checked })
            }
          />
        </div>

        {/* Limit to 1 Response per Person */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-limit-one-response"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Limit to 1 response per person
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Restrict multiple submissions from the same user.
            </p>
          </div>
          <Switch
            id="toggle-limit-one-response"
            checked={settings.limitOneResponse}
            onCheckedChange={(checked) =>
              onSettingsChange({
                limitOneResponse: checked,
                allowMultipleSubmissions: !checked,
              })
            }
          />
        </div>

        {/* Set Response Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <label
                  htmlFor="toggle-response-limit"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Set response limit
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Stop accepting responses after a certain number.
              </p>
            </div>
            <Switch
              id="toggle-response-limit"
              checked={settings.setResponseLimit}
              onCheckedChange={(checked) =>
                onSettingsChange({ setResponseLimit: checked })
              }
            />
          </div>

          {settings.setResponseLimit && (
            <div className="pt-1 flex items-center gap-2 animate-in fade-in duration-200">
              <Input
                type="number"
                min={1}
                value={settings.responseLimit || 100}
                onChange={(e) =>
                  onSettingsChange({
                    responseLimit: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="h-8 w-28 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              <span className="text-xs text-slate-500">max submissions</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
