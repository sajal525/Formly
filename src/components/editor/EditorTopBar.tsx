"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Folder,
  Palette,
  Eye,
  Undo2,
  Redo2,
  Send,
  Users,
  MoreVertical,
  Check,
  Share2,
  Printer,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { FolderRecord } from "../../server/folders.queries";

interface EditorTopBarProps {
  formId: string;
  title: string;
  isStarred: boolean;
  folderId?: string | null;
  saveStatus: "saving" | "saved" | "idle";
  folders: FolderRecord[];
  onTitleChange: (newTitle: string) => void;
  onToggleStar: () => void;
  onMoveFolder: (folderId: string | null) => void;
  onOpenTheme: () => void;
  onOpenSend: () => void;
  onPreview: () => void;
}

export function EditorTopBar({
  formId,
  title,
  isStarred,
  folderId,
  saveStatus,
  folders,
  onTitleChange,
  onToggleStar,
  onMoveFolder,
  onOpenTheme,
  onOpenSend,
  onPreview,
}: EditorTopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Sync if title prop updates externally
  React.useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  const currentFolder = folders.find((f) => f.id === folderId);

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#0E1015",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left Section: Back, Formly Icon, Title, Folder, Star, Save Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {/* Back Arrow */}
        <Link
          href="/"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255, 255, 255, 0.7)",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
            e.currentTarget.style.color = "#FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
          }}
          title="Back to Forms"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Form Title Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => {
              setCurrentTitle(e.target.value);
              onTitleChange(e.target.value);
            }}
            placeholder="Untitled form"
            style={{
              background: isEditingTitle ? "rgba(255, 255, 255, 0.05)" : "transparent",
              border: isEditingTitle ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "17px",
              fontWeight: 600,
              color: "#F4F4F6",
              fontFamily: "var(--font-display)",
              outline: "none",
              width: `${Math.max(currentTitle.length * 9.5, 120)}px`,
              maxWidth: "280px",
              transition: "all 0.15s ease",
            }}
            onFocus={() => setIsEditingTitle(true)}
            onBlur={() => setIsEditingTitle(false)}
          />
        </div>

        {/* Move to Folder Button with Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowFolderMenu(!showFolderMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "6px 8px",
              color: currentFolder ? "#38BDF8" : "rgba(255, 255, 255, 0.5)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title={currentFolder ? `Folder: ${currentFolder.name}` : "Move to folder"}
          >
            <Folder size={16} />
            {currentFolder && <span>{currentFolder.name}</span>}
          </button>

          {showFolderMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "6px",
                width: "200px",
                backgroundColor: "#161820",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                padding: "6px",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.4)",
                  padding: "6px 8px",
                }}
              >
                Move to Folder
              </div>
              <button
                onClick={() => {
                  onMoveFolder(null);
                  setShowFolderMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: !folderId ? "rgba(124, 58, 237, 0.15)" : "transparent",
                  color: !folderId ? "#A78BFA" : "#E4E4E7",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Unfiled (Home)</span>
                {!folderId && <Check size={14} />}
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onMoveFolder(f.id);
                    setShowFolderMenu(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: folderId === f.id ? "rgba(124, 58, 237, 0.15)" : "transparent",
                    color: folderId === f.id ? "#A78BFA" : "#E4E4E7",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{f.name}</span>
                  {folderId === f.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Star Button */}
        <button
          onClick={onToggleStar}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isStarred ? "#F59E0B" : "rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title={isStarred ? "Starred" : "Star"}
        >
          <Star size={17} fill={isStarred ? "#F59E0B" : "none"} />
        </button>

        {/* Save Status */}
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.4)",
            marginLeft: "4px",
            userSelect: "none",
          }}
        >
          {saveStatus === "saving" ? (
            <span style={{ color: "#A78BFA" }}>Saving…</span>
          ) : (
            <span>All changes saved in Drive</span>
          )}
        </div>
      </div>

      {/* Right Section: Theme, Preview, Undo, Redo, Send, Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Customize Theme Button */}
        <button
          onClick={onOpenTheme}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.color = "#FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
          }}
          title="Customize Theme"
        >
          <Palette size={18} />
        </button>

        {/* Preview Button */}
        <button
          onClick={onPreview}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.color = "#FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
          }}
          title="Preview Form"
        >
          <Eye size={18} />
        </button>

        {/* Undo Button */}
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>

        {/* Redo Button */}
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>

        {/* Send Button (The primary Google Forms action button) */}
        <button
          onClick={onOpenSend}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#7C3AED",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            padding: "8px 18px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            marginLeft: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6D28D9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#7C3AED";
          }}
        >
          <Send size={15} />
          Send
        </button>

        {/* More Menu (⋮) */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="More"
          >
            <MoreVertical size={18} />
          </button>

          {showMoreMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "6px",
                width: "210px",
                backgroundColor: "#161820",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                padding: "6px",
                zIndex: 100,
              }}
            >
              <button
                onClick={() => {
                  window.print();
                  setShowMoreMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  color: "#E4E4E7",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/forms/${formId}/preview`);
                  alert("Pre-filled link copied to clipboard!");
                  setShowMoreMenu(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  color: "#E4E4E7",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ExternalLink size={15} />
                <span>Get pre-filled link</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
