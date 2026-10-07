"use client";

import React, { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { SectionData } from "../../server/forms.queries";

interface SectionCardProps {
  section: SectionData;
  index: number;
  totalSections: number;
  sections: SectionData[];
  onUpdateSection: (sectionId: string, data: Partial<SectionData>) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function SectionCard({
  section,
  index,
  totalSections,
  sections,
  onUpdateSection,
  onDeleteSection,
}: SectionCardProps) {
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || "");

  React.useEffect(() => {
    setTitle(section.title);
  }, [section.title]);

  React.useEffect(() => {
    setDescription(section.description || "");
  }, [section.description]);

  return (
    <div
      style={{
        backgroundColor: "#111218",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderLeft: "6px solid #38BDF8",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        padding: "20px 24px",
        marginBottom: "16px",
      }}
    >
      {/* Section Header Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#38BDF8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Section {index + 1} of {totalSections}
        </span>

        {totalSections > 1 && onDeleteSection && (
          <button
            onClick={() => onDeleteSection(section.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
            title="Delete Section"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Section Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          onUpdateSection(section.id, { title: e.target.value });
        }}
        placeholder="Untitled Section"
        style={{
          width: "100%",
          fontSize: "20px",
          fontWeight: 600,
          color: "#FFFFFF",
          fontFamily: "var(--font-display)",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          padding: "4px 0",
          outline: "none",
          marginBottom: "8px",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottom = "2px solid #38BDF8";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottom = "1px solid transparent";
        }}
      />

      {/* Section Description */}
      <input
        type="text"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          onUpdateSection(section.id, { description: e.target.value });
        }}
        placeholder="Description (optional)"
        style={{
          width: "100%",
          fontSize: "13px",
          color: "rgba(255, 255, 255, 0.65)",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          padding: "4px 0",
          outline: "none",
          marginBottom: "16px",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottom = "2px solid #38BDF8";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottom = "1px solid transparent";
        }}
      />

      {/* Navigation Logic: "After section X" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "13px",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <span>After section {index + 1}:</span>
        <select
          value={section.afterSectionAction}
          onChange={(e) => {
            onUpdateSection(section.id, { afterSectionAction: e.target.value });
          }}
          style={{
            background: "#161820",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "6px",
            color: "#FFFFFF",
            padding: "4px 8px",
            fontSize: "13px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="continue">Continue to next section</option>
          <option value="submit">Submit form</option>
          {sections
            .filter((s) => s.id !== section.id)
            .map((s, sIdx) => (
              <option key={s.id} value={`goto_${s.id}`}>
                Go to section {sIdx + 1} ({s.title || "Untitled"})
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
