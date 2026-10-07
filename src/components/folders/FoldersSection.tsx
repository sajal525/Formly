"use client";

import React from "react";
import { FolderCard, FolderItem } from "./FolderCard";

interface FoldersSectionProps {
  folders: FolderItem[];
  onOpenFolder: (id: string) => void;
  onCreateFolder?: () => void;
  onRenameFolder?: (id: string, name: string) => void;
  onDeleteFolder?: (id: string) => void;
}

export function FoldersSection({
  folders,
  onOpenFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FoldersSectionProps) {
  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px 64px 24px",
        width: "100%",
      }}
    >
      {/* "Folders" Heading with New Folder button */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#F4F4F6",
            fontFamily: "var(--font-display)",
          }}
        >
          Folders
        </h2>
        {onCreateFolder && (
          <button
            onClick={onCreateFolder}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "6px",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.color = "#FFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            + New folder
          </button>
        )}
      </div>

      {/* Row of Folders fitting across the content area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          width: "100%",
        }}
      >
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onClick={onOpenFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
          />
        ))}
      </div>
    </section>
  );
}
