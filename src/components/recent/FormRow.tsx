"use client";

import React from "react";
import { MoreVertical, Copy, Edit2, Trash2, ExternalLink } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface FormItem {
  id: string;
  title: string;
  ownerName: string;
  isOwner: boolean;
  status: "draft" | "published" | "closed";
  lastOpenedAt: string;
  updatedAt: string;
}

interface FormRowProps {
  form: FormItem;
  onOpen: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FormRow({ form, onOpen, onRename, onDuplicate, onDelete }: FormRowProps) {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        cursor: "pointer",
        transition: "background-color 150ms ease",
        borderBottom: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {/* Left: Icon + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
        {/* Form Icon */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              stroke="#6366F1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2V8H20" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 13H15" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 17H13" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {form.title}
        </span>
      </div>

      {/* Middle & Right: Owner, Date, Status, Kebab */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
        {/* Owner */}
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            minWidth: "70px",
            textAlign: "right",
          }}
        >
          {form.isOwner ? "Me" : form.ownerName}
        </span>

        {/* Last Opened / Modified */}
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            minWidth: "110px",
            textAlign: "right",
          }}
        >
          {form.lastOpenedAt}
        </span>

        {/* Status Chip (Pill shape) */}
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: "9999px",
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
            display: "inline-block",
            lineHeight: "1",
          }}
        >
          {statusConfig.label}
        </span>

        {/* Row Action Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Form actions"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--border)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
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
    </div>
  );
}
