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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
            Preferences // Alerts
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Notifications
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your notification preferences.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#181B20] text-neutral-600 dark:text-neutral-400">
          Soon
        </span>
      </div>

      {/* Honest unavailable banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs text-neutral-600 dark:text-neutral-400">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed font-mono">
          Notifications are not available yet. Formly does not deliver external
          emails or SMS alerts at this time. These controls are preview-only and
          will be enabled once real notification delivery is deployed.
        </p>
      </div>

      <div className="space-y-3 opacity-60">
        {notificationItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={cn(
                "flex items-center justify-between gap-3",
                idx < notificationItems.length - 1 &&
                  "pb-3 border-b border-[#E5E7EB] dark:border-[#27272A]"
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate font-mono">
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
