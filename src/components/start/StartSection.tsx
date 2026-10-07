"use client";

import React from "react";
import { TemplateCard } from "./TemplateCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface TemplateItem {
  id: string;
  name: string;
  headerColor: string;
}

interface StartSectionProps {
  templates: TemplateItem[];
  onCreateForm: (templateId?: string) => void;
}

export function StartSection({ templates, onCreateForm }: StartSectionProps) {
  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "24px 24px 8px 24px",
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#F4F4F6",
            fontFamily: "var(--font-display)",
          }}
        >
          Template gallery
        </h2>

        {/* 'View all >' link */}
        <Link
          href="/templates"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#818CF8",
            textDecoration: "none",
            transition: "opacity 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span>View all</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* 5 Template Cards Grid Row filling width */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
          width: "100%",
        }}
      >
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            id={tpl.id}
            name={tpl.name}
            headerColor={tpl.headerColor}
            onSelect={(id) => onCreateForm(id)}
          />
        ))}
      </div>
    </section>
  );
}
