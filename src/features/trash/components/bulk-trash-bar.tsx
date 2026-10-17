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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-[#181B20] text-white shadow-xl border border-neutral-700 dark:border-[#27272A] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2 pr-3 border-r border-neutral-700 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#563BFA]" />
        <span>
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onRestoreSelected}
          className="h-7 px-3 rounded-md bg-[#563BFA] hover:bg-[#4830d9] text-white text-xs font-mono font-medium gap-1.5 shadow-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Selected</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDeleteSelected}
          className="h-7 px-3 rounded-md bg-rose-950/40 text-rose-300 hover:bg-rose-950/70 border border-rose-800 text-xs font-mono font-medium gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Permanently</span>
        </Button>

        <button
          type="button"
          onClick={onClearSelection}
          className="w-7 h-7 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors ml-1"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
