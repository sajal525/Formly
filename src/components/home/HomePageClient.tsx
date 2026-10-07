"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "../nav/TopNav";
import { CommandPalette } from "../nav/CommandPalette";
import { StartSection } from "../start/StartSection";
import { CenteredSearchBar } from "../search/CenteredSearchBar";
import { FoldersSection } from "../folders/FoldersSection";
import { FolderCard, FolderItem } from "../folders/FolderCard";
import { FormItem } from "../recent/FormRow";
import { createFormAction } from "../../server/forms.actions";
import {
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
} from "../../server/folders.actions";

interface TemplateItem {
  id: string;
  name: string;
  headerColor: string;
}

interface HomePageClientProps {
  templates: TemplateItem[];
  initialForms: FormItem[];
  initialFolders: FolderItem[];
}

export function HomePageClient({
  templates,
  initialForms,
  initialFolders,
}: HomePageClientProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Sync if initialFolders changes
  React.useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  async function handleCreateForm(templateId?: string) {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await createFormAction(templateId);
      if (res.success && res.formId) {
        router.push(`/forms/${res.formId}/edit`);
      }
    } catch (err) {
      console.error("Failed to create form:", err);
      setIsCreating(false);
    }
  }

  function handleOpenFolder(folderId: string) {
    console.log("Opening folder:", folderId);
  }

  async function handleCreateFolder() {
    const folderName = prompt("Enter folder name:");
    if (!folderName || !folderName.trim()) return;
    const res = await createFolderAction(folderName.trim());
    if (res.success && res.folder) {
      setFolders((prev) => [
        ...prev,
        { id: (res.folder as any).id, name: (res.folder as any).name, formCount: 0 },
      ]);
    }
  }

  async function handleRenameFolder(folderId: string, currentName: string) {
    const newName = prompt("Rename folder:", currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: newName.trim() } : f))
      );
      await renameFolderAction(folderId, newName.trim());
    }
  }

  async function handleDeleteFolder(folderId: string) {
    if (confirm("Are you sure you want to delete this folder? Forms inside will become unfiled.")) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      await deleteFolderAction(folderId);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0A0B0E",
        color: "#F4F4F6",
      }}
    >
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content: Spaced between top elements and bottom folders */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "calc(100vh - 58px)",
        }}
      >
        {/* Upper Portion: Template Gallery & Bigger Centered Search Bar */}
        <div>
          <StartSection templates={templates} onCreateForm={handleCreateForm} />

          <CenteredSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />
        </div>

        {/* Bottom Portion: Folders Section */}
        <div style={{ marginTop: "auto", paddingTop: "40px" }}>
          <FoldersSection
            folders={folders}
            onOpenFolder={handleOpenFolder}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>
      </main>

      {/* Command Palette (Ctrl K / ⌘K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        templates={templates}
        onSelectAction={(action, templateId) => {
          if (action === "create-blank") {
            handleCreateForm();
          } else if (action === "create-from-template" && templateId) {
            handleCreateForm(templateId);
          }
        }}
      />
    </div>
  );
}
