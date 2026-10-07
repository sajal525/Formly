"use client";

import React from "react";
import { FolderGraphic } from "./FolderGraphic";
import { MoreVertical, Edit2, Trash2, FolderOpen } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface FolderItem {
  id: string;
  name: string;
  formCount: number;
}

interface FolderCardProps {
  folder: FolderItem;
  onClick: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

export function FolderCard({ folder, onClick, onRename, onDelete }: FolderCardProps) {
  return (
    <div
      onClick={() => onClick(folder.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        cursor: "pointer",
        width: "100%",
        maxWidth: "240px",
        userSelect: "none",
        transition: "transform 150ms ease",
      }}
      onMouseEnter={(e) => {
        const svg = e.currentTarget.querySelector("svg");
        if (svg) svg.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        const svg = e.currentTarget.querySelector("svg");
        if (svg) svg.style.transform = "translateY(0px)";
      }}
    >
      {/* Blue macOS Folder Graphic */}
      <FolderGraphic />

      {/* Info Row: Title & Count on left, Three-dots on right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginTop: "12px",
          width: "100%",
          paddingRight: "6px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#F4F4F6",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {folder.name}
          </span>

          <span
            style={{
              fontSize: "13px",
              color: "#71717A",
              lineHeight: "1.3",
              marginTop: "2px",
            }}
          >
            {folder.formCount} {folder.formCount === 1 ? "form" : "forms"}
          </span>
        </div>

        {/* Vertical Kebab Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${folder.name}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "28px",
                height: "28px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                color: "#71717A",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                marginTop: "2px",
                transition: "color 150ms ease, background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#F4F4F6";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#71717A";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <MoreVertical size={17} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#161722",
                border: "1px solid #282B3E",
                borderRadius: "8px",
                padding: "4px",
                minWidth: "150px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                zIndex: 60,
              }}
            >
              <DropdownMenu.Item
                onClick={() => onClick(folder.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#F4F4F6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <FolderOpen size={14} color="#71717A" />
                Open
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => onRename?.(folder.id, folder.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#F4F4F6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Edit2 size={14} color="#71717A" />
                Rename
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => onDelete?.(folder.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#EF4444",
                  borderRadius: "4px",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Trash2 size={14} color="#EF4444" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
