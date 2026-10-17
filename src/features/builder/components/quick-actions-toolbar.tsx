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
  onAddImage?: () => void;
}

export function QuickActionsToolbar({
  onAddQuestion,
  onFocusHeader,
  onAddImage,
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
      label: "Add Image",
      icon: ImageIcon,
      onClick: onAddImage || (() => {}),
      enabled: Boolean(onAddImage),
      tooltip: "Add Image content block",
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
      className="w-10 bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-lg p-1 flex flex-col items-center gap-1 select-none shrink-0"
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
              className="w-8 h-8 rounded-md bg-[#563BFA] hover:bg-[#4830d9] text-white flex items-center justify-center mb-0.5 cursor-pointer shadow-none"
              title={act.label}
              aria-label={act.label}
            >
              <Icon className="w-4 h-4" />
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
              "w-8 h-8 rounded-md flex items-center justify-center transition-colors relative",
              act.enabled
                ? "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#181B20] hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                : "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
            )}
            title={act.tooltip || act.label}
            aria-label={act.label}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </aside>
  );
}
