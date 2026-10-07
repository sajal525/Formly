"use client";

import React from "react";

export type EditorTabType = "questions" | "responses" | "settings";

interface EditorTabsProps {
  activeTab: EditorTabType;
  onChangeTab: (tab: EditorTabType) => void;
  responseCount: number;
}

export function EditorTabs({ activeTab, onChangeTab, responseCount }: EditorTabsProps) {
  const tabs: { key: EditorTabType; label: string; badge?: number }[] = [
    { key: "questions", label: "Questions" },
    { key: "responses", label: "Responses", badge: responseCount },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0E1015",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        gap: "24px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: isActive ? "3px solid #7C3AED" : "3px solid transparent",
              color: isActive ? "#F4F4F6" : "rgba(255, 255, 255, 0.6)",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
            }}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: "12px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#7C3AED" : "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
