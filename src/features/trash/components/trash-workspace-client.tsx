"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrashPageDTO,
  TrashItemDTO,
} from "../server/get-trash-page";
import {
  TrashTypeFilter,
  TrashSort,
  TrashQueryParams,
} from "../schemas/trash-query-schema";
import { TrashHeader } from "./trash-header";
import { TrashToolbar } from "./trash-toolbar";
import { TrashTable } from "./trash-table";
import { TrashDetailsPanel } from "./trash-details-panel";
import { RestoreFormDialog } from "./restore-form-dialog";
import { PermanentDeleteDialog } from "./permanent-delete-dialog";
import { BulkTrashBar } from "./bulk-trash-bar";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrashWorkspaceClientProps {
  initialData: TrashPageDTO;
  queryParams: TrashQueryParams;
}

export function TrashWorkspaceClient({
  initialData,
  queryParams,
}: TrashWorkspaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<TrashItemDTO[]>(initialData.items);
  const [activeItem, setActiveItem] = useState<TrashItemDTO | null>(
    initialData.items[0] || null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog targets
  const [restoreTarget, setRestoreTarget] = useState<TrashItemDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrashItemDTO | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    setItems(initialData.items);
    if (initialData.items.length > 0) {
      // Keep existing active item if still present, or pick first
      setActiveItem((curr) => {
        if (!curr) return initialData.items[0];
        const match = initialData.items.find((i) => i.id === curr.id);
        return match || initialData.items[0];
      });
    } else {
      setActiveItem(null);
    }
    // Clear selections that are no longer on this page
    setSelectedIds((prev) => {
      const valid = new Set<string>();
      const currentIds = new Set(initialData.items.map((i) => i.id));
      prev.forEach((id) => {
        if (currentIds.has(id)) valid.add(id);
      });
      return valid;
    });
  }, [initialData]);

  // URL state sync
  const updateQueryParams = (updates: Partial<TrashQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.type !== undefined) {
      if (updates.type === "all") params.delete("type");
      else params.set("type", updates.type);
    }
    if (updates.q !== undefined) {
      if (!updates.q) params.delete("q");
      else params.set("q", updates.q);
    }
    if (updates.sort !== undefined) {
      if (updates.sort === "deleted_desc") params.delete("sort");
      else params.set("sort", updates.sort);
    }
    if (updates.page !== undefined) {
      if (updates.page <= 1) params.delete("page");
      else params.set("page", updates.page.toString());
    }

    startTransition(() => {
      router.push(`/trash?${params.toString()}`);
    });
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (items.every((i) => selectedIds.has(i.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  // Single Restore
  const handleConfirmRestore = async (
    item: TrashItemDTO,
    restoreAs: "previous_status" | "draft"
  ) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/trash/forms/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", restoreAs }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to restore form");
      }

      // Optimistic removal from trash list
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setRestoreTarget(null);
      showToast(`Restored "${item.title}" successfully`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to restore form", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Permanent Delete
  const handleConfirmPermanentDelete = async (confirmText: string) => {
    if (!deleteTarget) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/trash/forms/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to permanently delete form");
      }

      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      showToast(`Permanently deleted "${deleteTarget.title}"`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete form", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Restore
  const handleBulkRestore = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/trash/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", formIds: ids }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to restore selected forms");
      }

      const idSet = new Set(ids);
      setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
      setSelectedIds(new Set());
      showToast(`Successfully restored ${ids.length} forms`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to restore selected forms", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Permanent Delete
  const handleConfirmBulkDelete = async (confirmText: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/trash/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_permanently",
          formIds: ids,
          confirmText,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete selected forms");
      }

      const idSet = new Set(ids);
      setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      showToast(`Permanently deleted ${ids.length} forms`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete selected forms", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-150 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <TrashHeader />

      {/* Toolbar (Categories + Search + Sort) */}
      <TrashToolbar
        counts={initialData.counts}
        currentType={queryParams.type}
        searchQuery={queryParams.q}
        currentSort={queryParams.sort}
        onTypeChange={(type) => updateQueryParams({ type, page: 1 })}
        onSearchChange={(q) => updateQueryParams({ q, page: 1 })}
        onSortChange={(sort) => updateQueryParams({ sort, page: 1 })}
      />

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Table Area */}
        <div className="lg:col-span-8 space-y-4">
          <TrashTable
            items={items}
            selectedIds={selectedIds}
            activeItem={activeItem}
            onSelectItem={(item) => setActiveItem(item)}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRestore={(item) => setRestoreTarget(item)}
            onPermanentDelete={(item) => setDeleteTarget(item)}
          />

          {/* Pagination */}
          {initialData.totalMatching > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 select-none">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {(initialData.currentPage - 1) * initialData.pageSize + 1}
                </span>
                –
                <span className="font-semibold text-slate-900 dark:text-white">
                  {Math.min(
                    initialData.currentPage * initialData.pageSize,
                    initialData.totalMatching
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {initialData.totalMatching}
                </span>{" "}
                items
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={initialData.currentPage <= 1 || isPending}
                  onClick={() =>
                    updateQueryParams({ page: initialData.currentPage - 1 })
                  }
                  className="h-8 w-8 p-0 rounded-xl"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: initialData.pageCount }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === initialData.pageCount ||
                      Math.abs(p - initialData.currentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-slate-300">…</span>}
                        <Button
                          type="button"
                          variant={
                            p === initialData.currentPage ? "default" : "outline"
                          }
                          size="sm"
                          disabled={isPending}
                          onClick={() => updateQueryParams({ page: p })}
                          className={cn(
                            "h-8 w-8 p-0 rounded-xl text-xs font-semibold",
                            p === initialData.currentPage
                              ? "bg-[#563BFA] text-white hover:bg-violet-700"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    );
                  })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    initialData.currentPage >= initialData.pageCount || isPending
                  }
                  onClick={() =>
                    updateQueryParams({ page: initialData.currentPage + 1 })
                  }
                  className="h-8 w-8 p-0 rounded-xl"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Details Panel Area */}
        <div className="lg:col-span-4 sticky top-4">
          <TrashDetailsPanel
            item={activeItem}
            onRestore={(item) => setRestoreTarget(item)}
            onPermanentDelete={(item) => setDeleteTarget(item)}
          />
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <BulkTrashBar
        selectedCount={selectedIds.size}
        onRestoreSelected={handleBulkRestore}
        onDeleteSelected={() => setIsBulkDeleteOpen(true)}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Single Restore Dialog */}
      <RestoreFormDialog
        item={restoreTarget}
        isOpen={!!restoreTarget}
        isSubmitting={isSubmitting}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleConfirmRestore}
      />

      {/* Single Permanent Delete Dialog */}
      <PermanentDeleteDialog
        item={deleteTarget}
        isOpen={!!deleteTarget}
        isSubmitting={isSubmitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmPermanentDelete}
      />

      {/* Bulk Permanent Delete Dialog */}
      <PermanentDeleteDialog
        item={null}
        bulkCount={selectedIds.size}
        isOpen={isBulkDeleteOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}
