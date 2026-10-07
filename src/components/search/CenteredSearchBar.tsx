"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface CenteredSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onOpenCommandPalette?: () => void;
}

export function CenteredSearchBar({
  value,
  onChange,
  onOpenCommandPalette,
}: CenteredSearchBarProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== "undefined" && navigator.userAgent.includes("Mac"));
  }, []);

  return (
    <div
      style={{
        maxWidth: "660px",
        margin: "64px auto 48px auto",
        padding: "0 24px",
        width: "100%",
      }}
    >
      <div
        onClick={onOpenCommandPalette}
        style={{
          width: "100%",
          height: "50px",
          backgroundColor: "#111218",
          border: "1px solid #1E202B",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          cursor: "text",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#2B2E40";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#1E202B";
        }}
      >
        <Search size={18} color="#6B7280" style={{ marginRight: "14px", flexShrink: 0 }} />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search forms"
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "#F4F4F6",
          }}
        />

        <kbd
          style={{
            fontSize: "12px",
            padding: "3px 9px",
            borderRadius: "6px",
            backgroundColor: "#181A24",
            border: "1px solid #242738",
            color: "#71717A",
            fontWeight: 500,
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          {isMac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </div>
    </div>
  );
}
