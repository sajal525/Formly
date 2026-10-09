"use client";

import React, { useState } from "react";
import { Link2, Copy, Check, Lock } from "lucide-react";
import { FormSettings, FormAccessType } from "../../schemas/builder-definition-schema";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormAccessCardProps {
  formId: string;
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function FormAccessCard({
  formId,
  settings,
  onSettingsChange,
}: FormAccessCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const publicUrl = `${origin}/f/${formId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAccessTypeChange = (type: FormAccessType) => {
    onSettingsChange({
      accessType: type,
      passwordRequired: type === "password" ? true : settings.passwordRequired,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Form Access
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control who can fill and access your form.
          </p>
        </div>
      </div>

      {/* Access Type Radio Options */}
      <div className="space-y-2 pt-1" role="radiogroup" aria-label="Form access level">
        <label
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all",
            settings.accessType === "public"
              ? "border-violet-600/60 bg-violet-50/40 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200"
              : "border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          )}
        >
          <input
            type="radio"
            name="accessType"
            value="public"
            checked={settings.accessType === "public"}
            onChange={() => handleAccessTypeChange("public")}
            className="w-3.5 h-3.5 accent-violet-600 cursor-pointer"
          />
          <span className="font-medium">Anyone with the link can respond</span>
        </label>

        <label
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all",
            settings.accessType === "organization"
              ? "border-violet-600/60 bg-violet-50/40 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200"
              : "border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          )}
        >
          <input
            type="radio"
            name="accessType"
            value="organization"
            checked={settings.accessType === "organization"}
            onChange={() => handleAccessTypeChange("organization")}
            className="w-3.5 h-3.5 accent-violet-600 cursor-pointer"
          />
          <span className="font-medium">
            Only people from my organization (e.g. college email)
          </span>
        </label>

        <label
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all",
            settings.accessType === "password"
              ? "border-violet-600/60 bg-violet-50/40 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200"
              : "border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          )}
        >
          <input
            type="radio"
            name="accessType"
            value="password"
            checked={settings.accessType === "password"}
            onChange={() => handleAccessTypeChange("password")}
            className="w-3.5 h-3.5 accent-violet-600 cursor-pointer"
          />
          <span className="font-medium">Restricted access (password required)</span>
        </label>
      </div>

      {/* Form Link Copy Box */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Form Link
        </label>
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-violet-50/60 dark:bg-slate-800/60 border border-violet-200/80 dark:border-slate-700">
          <span className="font-mono text-xs text-violet-700 dark:text-violet-300 truncate flex-1 select-all">
            {publicUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-xs hover:bg-violet-700 active:scale-95 transition-all shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Password Toggle & Input */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <label
                htmlFor="toggle-password-access"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Set a password
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Require a password to access this form.
            </p>
          </div>
          <Switch
            id="toggle-password-access"
            checked={settings.passwordRequired || settings.accessType === "password"}
            onCheckedChange={(checked) =>
              onSettingsChange({
                passwordRequired: checked,
                accessType: checked ? "password" : "public",
              })
            }
          />
        </div>

        {(settings.passwordRequired || settings.accessType === "password") && (
          <div className="pt-1.5 animate-in fade-in duration-200">
            <Input
              type={showPassword ? "text" : "password"}
              value={settings.accessPassword || ""}
              onChange={(e) => onSettingsChange({ accessPassword: e.target.value })}
              placeholder="Enter access password..."
              className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
