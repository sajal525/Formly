"use client";

import React from "react";
import { FormRow, FormItem } from "./FormRow";

interface FormListProps {
  forms: FormItem[];
  onOpen: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FormList({ forms, onOpen, onRename, onDuplicate, onDelete }: FormListProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header bar row for columns */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--bg-alt)",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span>Title</span>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingRight: "52px" }}>
          <span style={{ minWidth: "70px", textAlign: "right" }}>Owner</span>
          <span style={{ minWidth: "110px", textAlign: "right" }}>Last opened</span>
          <span style={{ minWidth: "60px", textAlign: "center" }}>Status</span>
        </div>
      </div>

      {/* Rows */}
      {forms.map((form) => (
        <FormRow
          key={form.id}
          form={form}
          onOpen={onOpen}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
