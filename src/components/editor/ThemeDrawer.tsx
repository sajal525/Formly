"use client";

import React from "react";
import { X, Check } from "lucide-react";

interface ThemeDrawerProps {
  open: boolean;
  theme: {
    color: string;
    bgColor?: string;
    font: string;
    mode: "light" | "dark" | "auto";
  };
  onClose: () => void;
  onUpdateTheme: (newTheme: any) => void;
}

const THEME_COLORS = [
  "#7C3AED", // Purple (Default)
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#0EA5E9", // Sky
  "#14B8A6", // Teal
  "#10B981", // Emerald
  "#EAB308", // Yellow
  "#F59E0B", // Amber
  "#F97316", // Orange
  "#EF4444", // Red
  "#F43F5E", // Rose
  "#EC4899", // Pink
];

const FONTS = [
  { key: "Basic", label: "Basic (DM Sans)" },
  { key: "Decorative", label: "Decorative (Display)" },
  { key: "Formal", label: "Formal (Serif)" },
  { key: "Playful", label: "Playful (Rounded)" },
];

export function ThemeDrawer({
  open,
  theme,
  onClose,
  onUpdateTheme,
}: ThemeDrawerProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "320px",
        backgroundColor: "#111218",
        borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF" }}>
          Theme options
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Theme Color */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "12px" }}>
          Theme color
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
          {THEME_COLORS.map((c) => {
            const isSelected = (theme.color || "#7C3AED").toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => onUpdateTheme({ ...theme, color: c })}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: c,
                  border: isSelected ? "2px solid #FFFFFF" : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isSelected ? "0 0 10px " + c : "none",
                }}
              >
                {isSelected && <Check size={14} color="#FFFFFF" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Style */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "12px" }}>
          Font style
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {FONTS.map((f) => {
            const isSelected = (theme.font || "Basic") === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onUpdateTheme({ ...theme, font: f.key })}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: isSelected ? "rgba(124, 58, 237, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: isSelected ? "1px solid #7C3AED" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{f.label}</span>
                {isSelected && <Check size={14} color="#A78BFA" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
