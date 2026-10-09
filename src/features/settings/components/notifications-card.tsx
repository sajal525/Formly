"use client";

import React from "react";
import {
  FileText,
  Share2,
  Megaphone,
  Lightbulb,
  Mail,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationsCardProps {
  className?: string;
}

export function NotificationsCard({ className }: NotificationsCardProps) {
  const notificationItems = [
    {
      title: "Form Submissions",
      description: "Get notified when someone submits a form.",
      icon: FileText,
      defaultOn: true,
    },
    {
      title: "Form Shares",
      description: "Get notified when a form is shared with you.",
      icon: Share2,
      defaultOn: true,
    },
    {
      title: "Product Updates",
      description: "Receive updates about new features.",
      icon: Megaphone,
      defaultOn: true,
    },
    {
      title: "Tips and Guides",
      description: "Get helpful tips to use Formly better.",
      icon: Lightbulb,
      defaultOn: false,
    },
    {
      title: "Marketing Emails",
      description: "Receive product news and offers.",
      icon: Mail,
      defaultOn: false,
    },
  ];

  return (
    <div
      id="notifications-section"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Notifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your notification preferences.
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60">
          Coming Soon
        </span>
      </div>

      {/* Honest unavailable banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Notifications are not available yet. Formly does not deliver external
          emails or SMS alerts at this time. These controls are preview-only and
          will be enabled once real notification delivery is deployed.
        </p>
      </div>

      <div className="space-y-3.5 opacity-70">
        {notificationItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={cn(
                "flex items-center justify-between gap-3",
                idx < notificationItems.length - 1 &&
                  "pb-3 border-b border-slate-100 dark:border-slate-800/80"
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {item.description}
                  </span>
                </div>
              </div>
              <Switch
                disabled
                checked={item.defaultOn}
                aria-label={`Notification toggle for ${item.title} (Coming soon)`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
