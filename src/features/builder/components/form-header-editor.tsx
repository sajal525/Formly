"use client";

import React, { useRef, useEffect } from "react";
import { Image as ImageIcon, Sparkles, Trash2 } from "lucide-react";
import { BuilderCoverImage } from "../schemas/builder-definition-schema";
import { getDefaultTextSelectProps } from "../utils/default-text-select";
import { cn } from "@/lib/utils";

interface FormHeaderEditorProps {
  title: string;
  description?: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  coverImage?: BuilderCoverImage | null;
  onOpenCoverUpload?: () => void;
  onSelectCoverFile?: (file: File) => void;
  onOpenCoverEditor?: () => void;
  onRemoveCoverImage?: () => void;
  formId?: string;
}

export function FormHeaderEditor({
  title,
  description = "",
  onTitleChange,
  onDescriptionChange,
  isSelected,
  onSelect,
  coverImage,
  onOpenCoverUpload,
  onSelectCoverFile,
  onOpenCoverEditor,
  onRemoveCoverImage,
  formId,
}: FormHeaderEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [description]);

  const validateAndHandleFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Image exceeds the 15MB file size limit.");
      return;
    }
    onSelectCoverFile?.(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndHandleFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndHandleFile(file);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "w-full bg-white dark:bg-[#121417] rounded-xl border transition-all duration-150 overflow-hidden",
        isSelected
          ? "border-[#563BFA] ring-1 ring-[#563BFA]/30"
          : "border-[#E5E7EB] dark:border-[#27272A] hover:border-neutral-300 dark:hover:border-neutral-700"
      )}
    >
      {/* Hidden file input for desktop image picking */}
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Cover Banner Region */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={
          coverImage?.transform?.aspectPreset === "free" && coverImage.transform.crop?.aspectRatio
            ? { aspectRatio: `${coverImage.transform.crop.aspectRatio}` }
            : undefined
        }
        className={cn(
          "w-full relative overflow-hidden flex flex-col items-center justify-center border-b border-[#E5E7EB] dark:border-[#27272A] group transition-colors",
          isDraggingOver && "ring-2 ring-inset ring-[#563BFA] bg-[#563BFA]/10",
          coverImage
            ? coverImage.transform?.aspectPreset === "16:9"
              ? "aspect-[16/9] max-h-[380px]"
              : coverImage.transform?.aspectPreset === "free"
              ? "max-h-[340px]"
              : "aspect-[4/1] max-h-[260px]"
            : "h-28 sm:h-32 bg-neutral-100 dark:bg-[#181B20]"
        )}
      >
        {coverImage ? (
          <>
            <img
              src={`/api/v1/forms/${formId}/assets/${coverImage.assetId}`}
              alt={coverImage.altText || "Cover"}
              style={{
                objectPosition: coverImage.transform?.crop
                  ? `${Math.max(0, Math.min(100, coverImage.transform.crop.x + coverImage.transform.crop.width / 2))}% ${Math.max(0, Math.min(100, coverImage.transform.crop.y + coverImage.transform.crop.height / 2))}%`
                  : "center",
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Drag drop highlight overlay when dragging over existing cover */}
            {isDraggingOver && (
              <div className="absolute inset-0 bg-[#563BFA]/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                <span className="px-3.5 py-1.5 rounded-xl bg-black/80 text-white text-xs font-semibold">
                  Drop to replace cover
                </span>
              </div>
            )}
            {/* Hover actions overlay */}
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenCoverEditor) {
                    onOpenCoverEditor();
                  } else {
                    onOpenCoverUpload?.();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white hover:bg-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
                <span>Change cover</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCoverImage?.();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Subtle decorative curved pattern */}
            <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-xs flex items-center justify-center text-violet-600 dark:text-violet-400 mb-1.5 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-violet-700 dark:text-violet-300 hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  coverFileInputRef.current?.click();
                }}
              >
                Add cover image
              </button>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Drop image here or click to browse (JPG, PNG, WebP)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Title & Description Fields */}
      <div className="p-6 sm:p-7 space-y-4">
        {/* Large Editable Title Input */}
        <div
          className="relative cursor-text"
          onClick={() => titleInputRef.current?.focus()}
        >
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                e.stopPropagation();
                e.currentTarget.select();
              }
            }}
            placeholder="Untitled form"
            maxLength={120}
            className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent border-0 border-b-2 border-transparent focus:border-violet-500 focus:outline-none py-1 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
            aria-label="Form title"
            {...getDefaultTextSelectProps("Untitled form", {
              onBlur: () => {
                if (!title || !title.trim()) {
                  onTitleChange("Untitled form");
                }
              },
            })}
          />
        </div>

        {/* Optional Description Textarea */}
        <div>
          <textarea
            ref={textareaRef}
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                e.stopPropagation();
                e.currentTarget.select();
              }
            }}
            placeholder="Add a description (optional)"
            rows={2}
            maxLength={1000}
            className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:outline-none py-1 resize-none leading-relaxed transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
            aria-label="Form description"
          />
        </div>
      </div>
    </div>
  );
}
