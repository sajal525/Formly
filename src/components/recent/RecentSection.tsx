"use client";

import React, { useState } from "react";
import { RecentToolbar, OwnerFilterValue, SortValue, ViewMode } from "./RecentToolbar";
import { EmptyState } from "./EmptyState";
import { FormList } from "./FormList";
import { FormGrid } from "./FormGrid";
import { FormItem } from "./FormRow";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface RecentSectionProps {
  forms: FormItem[];
  onOpenForm: (id: string) => void;
  onRenameForm?: (id: string, newTitle: string) => void;
  onDuplicateForm?: (id: string) => void;
  onDeleteForm?: (id: string) => void;
}

export function RecentSection({
  forms,
  onOpenForm,
  onRenameForm,
  onDuplicateForm,
  onDeleteForm,
}: RecentSectionProps) {
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilterValue>("any");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortValue, setSortValue] = useState<SortValue>("opened");

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter & sort logic
  let displayedForms = [...forms];

  if (ownerFilter === "me") {
    displayedForms = displayedForms.filter((f) => f.isOwner);
  } else if (ownerFilter === "others") {
    displayedForms = displayedForms.filter((f) => !f.isOwner);
  }

  displayedForms.sort((a, b) => {
    if (sortValue === "title_asc") return a.title.localeCompare(b.title);
    if (sortValue === "title_desc") return b.title.localeCompare(a.title);
    if (sortValue === "modified") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
  });

  function handleStartRename(id: string, currentTitle: string) {
    setRenameTarget({ id, title: currentTitle });
    setNewTitle(currentTitle);
  }

  function handleConfirmRename() {
    if (renameTarget && newTitle.trim()) {
      onRenameForm?.(renameTarget.id, newTitle.trim());
      setRenameTarget(null);
    }
  }

  function handleConfirmDelete() {
    if (deleteTargetId) {
      onDeleteForm?.(deleteTargetId);
      setDeleteTargetId(null);
    }
  }

  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px 64px 24px",
      }}
    >
      <RecentToolbar
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {displayedForms.length === 0 ? (
        <EmptyState />
      ) : viewMode === "list" ? (
        <FormList
          forms={displayedForms}
          onOpen={onOpenForm}
          onRename={handleStartRename}
          onDuplicate={onDuplicateForm}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      ) : (
        <FormGrid
          forms={displayedForms}
          onOpen={onOpenForm}
          onRename={handleStartRename}
          onDuplicate={onDuplicateForm}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      )}

      {/* Rename Dialog */}
      <Dialog.Root open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />
          <Dialog.Content
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              zIndex: 101,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <Dialog.Title style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                Rename form
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmRename();
              }}
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                placeholder="Enter new form title"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "20px",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--text)",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  style={{
                    height: "36px",
                    padding: "0 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  OK
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />
          <Dialog.Content
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              zIndex: 101,
            }}
          >
            <Dialog.Title style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
              Move to trash?
            </Dialog.Title>
            <Dialog.Description style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              This form will be moved to the trash. You can restore it anytime within 30 days.
            </Dialog.Description>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Dialog.Close asChild>
                <button
                  type="button"
                  style={{
                    height: "36px",
                    padding: "0 16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  height: "36px",
                  padding: "0 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--error)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Move to trash
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
