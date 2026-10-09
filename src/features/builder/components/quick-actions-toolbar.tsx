"use client";

import React from "react";
import {
  Plus,
  FileUp,
  Heading,
  Image as ImageIcon,
  Video as VideoIcon,
  Columns,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsToolbarProps {
  onAddQuestion: () => void;
  onFocusHeader: () => void;
}

export function QuickActionsToolbar({
  onAddQuestion,
  onFocusHeader,
}: QuickActionsToolbarProps) {
  const actions = [
    {
      id: "add_question",
      label: "Add Question",
      icon: Plus,
      onClick: onAddQuestion,
      isPrimary: true,
      enabled: true,
    },
    {
      id: "import",
      label: "Import",
      icon: FileUp,
      onClick: () => {
        alert("Import from .formly / .txt will be available in a future update.");
      },
      enabled: false,
      tooltip: "Import questions (.formly / .txt) - Coming soon",
    },
    {
      id: "title_desc",
      label: "Title & Description",
      icon: Heading,
      onClick: onFocusHeader,
      enabled: true,
      tooltip: "Jump to Form Header",
    },
    {
      id: "image",
      label: "Image",
      icon: ImageIcon,
      onClick: () => {
        alert("Media uploads require secure storage configuration.");
      },
      enabled: false,
      tooltip: "Image card - Coming soon",
    },
    {
      id: "video",
      label: "Video",
      icon: VideoIcon,
      onClick: () => {
        alert("Video embeds will be supported in an upcoming release.");
      },
      enabled: false,
      tooltip: "Video embed - Coming soon",
    },
    {
      id: "section",
      label: "Section",
      icon: Columns,
      onClick: () => {
        alert("Sections are deferred until multi-section rendering is finalized.");
      },
      enabled: false,
      tooltip: "Add section - Coming soon",
    },
  ];

  return (
    <aside
      className="w-14 sm:w-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-1.5 sm:p-2 shadow-md flex flex-col items-center gap-1.5 select-none shrink-0"
      aria-label="Quick actions"
    >
      {actions.map((act) => {
        const Icon = act.icon;

        if (act.isPrimary) {
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex flex-col items-center justify-center shadow-md shadow-violet-500/20 active:scale-95 transition-all group mb-1 cursor-pointer"
              title={act.label}
              aria-label={act.label}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          );
        }

        return (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            disabled={!act.enabled}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors relative group",
              act.enabled
                ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40"
            )}
            title={act.tooltip || act.label}
            aria-label={act.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </aside>
  );
}
