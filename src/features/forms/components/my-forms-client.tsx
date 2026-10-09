"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormStatus } from "@prisma/client";
import { MyFormsPageDTO, MyFormItemDTO } from "../server/get-my-forms-page";
import {
  MyFormsQueryParams,
  FormStatusFilter,
  FormSortField,
  FormSortDirection,
  FormViewMode,
  FormPageSize,
} from "../schemas/my-forms-query-schema";
import { MyFormsHeader } from "./my-forms-header";
import { MyFormsToolbar } from "./my-forms-toolbar";
import { BulkSelectionBar } from "./bulk-selection-bar";
import { FormsListTable } from "./forms-list-table";
import { FormsGrid } from "./forms-grid";
import { FormsPagination } from "./forms-pagination";
import { FormsEmptyState } from "./forms-empty-state";
import { RenameFormDialog } from "./rename-form-dialog";
import { ViewFormDetailsDialog } from "./view-form-details-dialog";
import { BulkArchiveDialog } from "./bulk-archive-dialog";
import { CreateFormModal } from "./create-form-modal";
import { MyFormsSkeleton } from "./my-forms-skeleton";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface MyFormsClientProps {
  initialData: MyFormsPageDTO;
  queryParams: MyFormsQueryParams;
}

export function MyFormsClient({
  initialData,
  queryParams,
}: MyFormsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local items state synced from server props for responsive updates
  const [items, setItems] = useState<MyFormItemDTO[]>(initialData.items);
  const [viewMode, setViewMode] = useState<FormViewMode>(queryParams.view);

  useEffect(() => {
    setItems(initialData.items);
  }, [initialData.items]);

  useEffect(() => {
    setViewMode(queryParams.view);
  }, [queryParams.view]);

  // Selection state (current page only)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog targets & states
  const [renameTarget, setRenameTarget] = useState<MyFormItemDTO | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<MyFormItemDTO | null>(null);
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 5000);
  }

  // URL State Synchronizer
  function updateURL(
    updates: Partial<MyFormsQueryParams>,
    action: "push" | "replace" = "push"
  ) {
    const params = new URLSearchParams(searchParams.toString());

    // Merge updates
    const nextStatus = updates.status !== undefined ? updates.status : queryParams.status;
    const nextQ = updates.q !== undefined ? updates.q : queryParams.q;
    const nextSort = updates.sort !== undefined ? updates.sort : queryParams.sort;
    const nextDirection = updates.direction !== undefined ? updates.direction : queryParams.direction;
    const nextView = updates.view !== undefined ? updates.view : queryParams.view;
    const nextPageSize = updates.pageSize !== undefined ? updates.pageSize : queryParams.pageSize;

    // Determine page: if filter/sort/search/pagesize changed, reset to 1
    const filterChanged =
      updates.status !== undefined ||
      updates.q !== undefined ||
      updates.sort !== undefined ||
      updates.direction !== undefined ||
      updates.pageSize !== undefined;

    const nextPage = filterChanged
      ? 1
      : updates.page !== undefined
      ? updates.page
      : queryParams.page;

    // Apply to URLSearchParams
    if (nextStatus && nextStatus !== "all") {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }

    if (nextQ && nextQ.trim().length > 0) {
      params.set("q", nextQ.trim());
    } else {
      params.delete("q");
    }

    if (nextSort && nextSort !== "updatedAt") {
      params.set("sort", nextSort);
    } else {
      params.delete("sort");
    }

    if (nextDirection && nextDirection !== "desc") {
      params.set("direction", nextDirection);
    } else {
      params.delete("direction");
    }

    if (nextView && nextView !== "list") {
      params.set("view", nextView);
    } else {
      params.delete("view");
    }

    if (nextPage && nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }

    if (nextPageSize && nextPageSize !== 10) {
      params.set("pageSize", String(nextPageSize));
    } else {
      params.delete("pageSize");
    }

    const queryStr = params.toString();
    const url = queryStr ? `${pathname}?${queryStr}` : pathname;

    startTransition(() => {
      if (action === "replace") {
        router.replace(url);
      } else {
        router.push(url);
      }
    });

    // Reset row selection when page or filter changes
    setSelectedIds(new Set());
  }

  // Row selection handlers
  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleToggleSelectAll() {
    if (
      items.length > 0 &&
      items.every((f) => selectedIds.has(f.id))
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((f) => f.id)));
    }
  }

  // Single Form Mutations
  async function handleArchiveForm(form: MyFormItemDTO) {
    try {
      // Optimistic update
      setItems((prev) =>
        queryParams.status !== "all" && queryParams.status !== "archived"
          ? prev.filter((f) => f.id !== form.id)
          : prev.map((f) =>
              f.id === form.id ? { ...f, status: FormStatus.ARCHIVED } : f
            )
      );

      const res = await fetch(`/api/v1/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to archive form");
      }
      showToast(`Archived "${form.title}"`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive form";
      showToast(msg, "error");
      router.refresh();
    }
  }

  async function handleRestoreForm(form: MyFormItemDTO) {
    try {
      // Optimistic update
      setItems((prev) =>
        queryParams.status === "archived"
          ? prev.filter((f) => f.id !== form.id)
          : prev.map((f) =>
              f.id === form.id ? { ...f, status: FormStatus.DRAFT } : f
            )
      );

      const res = await fetch(`/api/v1/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to restore form");
      }
      showToast(`Restored "${form.title}"`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to restore form";
      showToast(msg, "error");
      router.refresh();
    }
  }

  async function handleTrashForm(form: MyFormItemDTO) {
    try {
      // Optimistic update
      setItems((prev) => prev.filter((f) => f.id !== form.id));

      const res = await fetch(`/api/v1/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to move form to Trash");
      }
      showToast(`Moved "${form.title}" to Trash`);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to move form to Trash";
      showToast(msg, "error");
      router.refresh();
    }
  }

  // Bulk Archive Action
  async function handleConfirmBulkArchive() {
    setIsBulkSubmitting(true);
    try {
      const idsToArchive = new Set(selectedIds);
      // Optimistic update
      setItems((prev) =>
        queryParams.status !== "all" && queryParams.status !== "archived"
          ? prev.filter((f) => !idsToArchive.has(f.id))
          : prev.map((f) =>
              idsToArchive.has(f.id)
                ? { ...f, status: FormStatus.ARCHIVED }
                : f
            )
      );

      const res = await fetch("/api/v1/forms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive",
          formIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to bulk archive forms");
      }
      showToast(data.message || `Archived ${selectedIds.size} forms`);
      setSelectedIds(new Set());
      setIsBulkArchiveOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to perform bulk archive";
      showToast(msg, "error");
      router.refresh();
    } finally {
      setIsBulkSubmitting(false);
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col gap-4 min-h-0">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`shrink-0 p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <MyFormsHeader onCreateBlankClick={() => setIsCreateModalOpen(true)} />

      {/* 2. Filter & View Toolbar */}
      <MyFormsToolbar
        statusFilter={queryParams.status}
        statusCounts={initialData.statusCounts}
        searchQuery={queryParams.q}
        sortField={queryParams.sort}
        sortDirection={queryParams.direction}
        viewMode={viewMode}
        onStatusChange={(status) => updateURL({ status }, "push")}
        onSearchChange={(q) => updateURL({ q }, "replace")}
        onSortChange={(sort, direction) => updateURL({ sort, direction }, "push")}
        onViewModeChange={(v) => {
          setViewMode(v);
          updateURL({ view: v }, "replace");
        }}
      />

      {/* 3. Bulk Selection Floating Bar */}
      <BulkSelectionBar
        selectedCount={selectedIds.size}
        onArchiveSelected={() => setIsBulkArchiveOpen(true)}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* 4. Form Records or Empty State */}
      <div
        className={`flex-1 min-h-0 flex flex-col justify-between gap-4 transition-opacity duration-150 ${
          isPending ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {items.length === 0 ? (
          <FormsEmptyState
            totalFormsCount={initialData.statusCounts.all}
            statusFilter={queryParams.status}
            searchQuery={queryParams.q}
            onCreateClick={() => setIsCreateModalOpen(true)}
            onResetFilters={() =>
              updateURL({ status: "all", q: "", page: 1 }, "push")
            }
          />
        ) : viewMode === "list" ? (
          <>
            {/* Desktop and tablet table (≥768px) */}
            <div className="hidden md:block">
              <FormsListTable
                forms={items}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetails={setDetailsTarget}
                onRename={setRenameTarget}
                onArchive={handleArchiveForm}
                onRestore={handleRestoreForm}
                onTrash={handleTrashForm}
              />
            </div>

            {/* Mobile stacked card view (<768px) to prevent squeezed tables */}
            <div className="md:hidden">
              <FormsGrid
                forms={items}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onViewDetails={setDetailsTarget}
                onRename={setRenameTarget}
                onArchive={handleArchiveForm}
                onRestore={handleRestoreForm}
                onTrash={handleTrashForm}
              />
            </div>
          </>
        ) : (
          <FormsGrid
            forms={items}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onViewDetails={setDetailsTarget}
            onRename={setRenameTarget}
            onArchive={handleArchiveForm}
            onRestore={handleRestoreForm}
            onTrash={handleTrashForm}
          />
        )}

        {/* 5. Pagination */}
        <FormsPagination
          totalMatching={initialData.totalMatching}
          currentPage={initialData.currentPage}
          pageSize={initialData.pageSize as FormPageSize}
          pageCount={initialData.pageCount}
          onPageChange={(page) => updateURL({ page }, "push")}
          onPageSizeChange={(pageSize) => updateURL({ pageSize, page: 1 }, "push")}
        />
      </div>

      {/* Dialogs */}
      <RenameFormDialog
        isOpen={Boolean(renameTarget)}
        form={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSuccess={(newTitle) => {
          if (renameTarget) {
            setItems((prev) =>
              prev.map((f) =>
                f.id === renameTarget.id ? { ...f, title: newTitle } : f
              )
            );
          }
          showToast(`Renamed to "${newTitle}"`);
          router.refresh();
        }}
      />

      <ViewFormDetailsDialog
        isOpen={Boolean(detailsTarget)}
        form={detailsTarget}
        onClose={() => setDetailsTarget(null)}
      />

      <BulkArchiveDialog
        isOpen={isBulkArchiveOpen}
        count={selectedIds.size}
        onClose={() => setIsBulkArchiveOpen(false)}
        onConfirm={handleConfirmBulkArchive}
        isSubmitting={isBulkSubmitting}
      />

      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(form) => {
          setItems((prev) => [
            {
              id: form.id,
              title: form.title,
              description: null,
              status: FormStatus.DRAFT,
              themeKey: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              responsesCount: null,
              viewsCount: null,
            },
            ...prev,
          ]);
          showToast(`Draft created: "${form.title}"`);
          router.refresh();
        }}
      />
    </div>
  );
}
