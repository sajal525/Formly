"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Crop,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  BuilderImageBlock,
  ImageAlignment,
  ImageDisplaySize,
} from "../../schemas/builder-definition-schema";
import { RenderedImageBlock } from "./rendered-image-block";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  block: BuilderImageBlock;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<BuilderImageBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditImage: () => void;
  formId: string;
}

const displaySizeOptions: { value: ImageDisplaySize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "full", label: "Full" },
];

const alignmentOptions: { value: ImageAlignment; label: string; icon: React.ElementType }[] = [
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "center", label: "Center", icon: AlignCenter },
  { value: "right", label: "Right", icon: AlignRight },
];

export function ImageCard({
  block,
  index,
  totalBlocks,
  isSelected,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEditImage,
  formId,
}: ImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assetUrl = `/api/v1/forms/${formId}/assets/${block.assetId}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative rounded-3xl border bg-white dark:bg-slate-900 transition-all duration-200 overflow-hidden",
        isSelected
          ? "border-violet-600 shadow-lg shadow-violet-500/5 ring-2 ring-violet-500/20"
          : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs",
        isDragging ? "opacity-50 z-50 shadow-2xl" : ""
      )}
    >
      {/* Drag & Action Header Strip */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          {/* Grip handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            aria-label="Drag block to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Block Type Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100/70 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-bold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </div>

          {block.fileName && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px] sm:max-w-xs font-medium">
              {block.fileName}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditImage();
            }}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Adjust crop, rotation, or sizing"
          >
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adjust</span>
          </button>

          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move block up"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={index === totalBlocks - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Move block down"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicate image block"
            aria-label="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete image block"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Canvas Body */}
      <div className="p-5 sm:p-7 space-y-5">
        <RenderedImageBlock
          block={block}
          imageUrl={assetUrl}
          priority={index < 2}
        />

        {/* Context Controls (Alignment, Sizing, and Alt Text) */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Display Size Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Size:
              </span>
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10">
                {displaySizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ displaySize: opt.value });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      block.displaySize === opt.value
                        ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Align:
              </span>
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10">
                {alignmentOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({ alignment: opt.value });
                      }}
                      className={cn(
                        "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        block.alignment === opt.value
                          ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                      title={`Align ${opt.label}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alt Text Input Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alt Text <span className="text-slate-400 font-normal">(optional description for accessibility)</span>
            </label>
            <input
              type="text"
              value={block.altText || ""}
              onChange={(e) => {
                e.stopPropagation();
                onChange({ altText: e.target.value });
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="e.g. Students collaborating around a table in library..."
              className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
