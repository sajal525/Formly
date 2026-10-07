"use client";

import React from "react";
import {
  PlusCircle,
  FileDown,
  Type,
  Image as ImageIcon,
  Video,
  SplitSquareVertical,
} from "lucide-react";

interface FloatingToolbarProps {
  onAddQuestion: () => void;
  onImportQuestions?: () => void;
  onAddText?: () => void;
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onAddSection: () => void;
}

export function FloatingToolbar({
  onAddQuestion,
  onImportQuestions,
  onAddText,
  onAddImage,
  onAddVideo,
  onAddSection,
}: FloatingToolbarProps) {
  const tools = [
    {
      label: "Add question",
      icon: PlusCircle,
      action: onAddQuestion,
    },
    {
      label: "Import questions",
      icon: FileDown,
      action: onImportQuestions || onAddQuestion,
    },
    {
      label: "Add title and description",
      icon: Type,
      action: onAddText || onAddQuestion,
    },
    {
      label: "Add image",
      icon: ImageIcon,
      action: onAddImage || onAddQuestion,
    },
    {
      label: "Add video",
      icon: Video,
      action: onAddVideo || onAddQuestion,
    },
    {
      label: "Add section",
      icon: SplitSquareVertical,
      action: onAddSection,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#161820",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "8px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
        padding: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {tools.map((tool, idx) => {
        const Icon = tool.icon;
        return (
          <button
            key={idx}
            onClick={tool.action}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "transparent",
              color: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
            title={tool.label}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
