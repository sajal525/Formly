"use client";

import React, { useState } from "react";
import { TemplatePreview } from "./TemplatePreview";
import { Loader2 } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  headerColor: string;
  onSelect: (templateId: string) => void;
}

export function TemplateCard({ id, name, headerColor, onSelect }: TemplateCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      await onSelect(id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", minWidth: "170px" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={`Create form from ${name} template`}
        style={{
          width: "100%",
          height: "126px",
          backgroundColor: "#111219",
          border: "1px solid #1E202B",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
          position: "relative",
          outline: "none",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.borderColor = "#2E3246";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.borderColor = "#1E202B";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} color="var(--primary)" />
        ) : (
          <TemplatePreview headerColor={headerColor} />
        )}
      </button>

      <span
        style={{
          marginTop: "10px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#F4F4F6",
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </span>
    </div>
  );
}
