"use client";

import React from "react";
import { FormItem } from "./FormRow";
import { MoreVertical, Copy, Edit2, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface FormGridCardProps {
  form: FormItem;
  onOpen: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FormGridCard({ form, onOpen, onRename, onDuplicate, onDelete }: FormGridCardProps) {
  const statusColors = {
    published: { bg: "rgba(16, 185, 129, 0.12)", color: "#10B981", label: "Published" },
    draft: { bg: "var(--bg-alt)", color: "var(--text-secondary)", label: "Draft" },
    closed: { bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444", label: "Closed" },
  };

  const statusConfig = statusColors[form.status] || statusColors.draft;

  return (
    <div
      onClick={() => onOpen(form.id)}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Mini Preview Box */}
      <div
        style={{
          height: "120px",
          backgroundColor: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          position: "relative",
        }}
      >
        <div style={{ height: "4px", width: "40%", backgroundColor: "var(--primary)", borderRadius: "2px" }} />
        <div style={{ height: "6px", width: "70%", backgroundColor: "var(--border)", borderRadius: "2px", marginTop: "4px" }} />
        <div style={{ height: "4px", width: "50%", backgroundColor: "var(--border)", borderRadius: "2px" }} />
        <div
          style={{
            marginTop: "6px",
            padding: "6px",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            backgroundColor: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ height: "3px", width: "60%", backgroundColor: "var(--text-secondary)", opacity: 0.3 }} />
          <div style={{ height: "10px", width: "100%", backgroundColor: "var(--bg-alt)", borderRadius: "2px" }} />
        </div>
      </div>

      {/* Info Bottom Area */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {form.title}
          </h4>

          {/* Action Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Actions"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "4px",
                  minWidth: "150px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  zIndex: 60,
                }}
              >
                <DropdownMenu.Item
                  onClick={() => onRename?.(form.id, form.title)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "var(--text)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Edit2 size={14} color="var(--text-secondary)" />
                  Rename
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => onDuplicate?.(form.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "var(--text)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Copy size={14} color="var(--text-secondary)" />
                  Make a copy
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => onDelete?.(form.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "var(--error)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Trash2 size={14} color="var(--error)" />
                  Remove
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{form.lastOpenedAt}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}
