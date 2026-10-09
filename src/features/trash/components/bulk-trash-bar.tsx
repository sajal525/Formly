"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2, X } from "lucide-react";

interface BulkTrashBarProps {
  selectedCount: number;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export function BulkTrashBar({
  selectedCount,
  onRestoreSelected,
  onDeleteSelected,
  onClearSelection,
}: BulkTrashBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        <span>
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onRestoreSelected}
          className="h-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Selected</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDeleteSelected}
          className="h-8 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900 border-rose-800 text-xs font-semibold gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Permanently</span>
        </Button>

        <button
          type="button"
          onClick={onClearSelection}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors ml-1"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
