"use client";

import React, { useRef, useEffect } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormHeaderEditorProps {
  title: string;
  description?: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function FormHeaderEditor({
  title,
  description = "",
  onTitleChange,
  onDescriptionChange,
  isSelected,
  onSelect,
}: FormHeaderEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [description]);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "w-full bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs",
        isSelected
          ? "border-violet-500/80 ring-2 ring-violet-500/20 shadow-md"
          : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
      )}
    >
      {/* Cover Banner Region */}
      <div className="w-full h-32 sm:h-36 relative bg-gradient-to-r from-violet-100/70 via-indigo-50/50 to-purple-100/70 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 flex flex-col items-center justify-center p-4 border-b border-slate-100 dark:border-white/5 group">
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
              alert("Cover image uploads will be enabled in a future release with secure storage.");
            }}
          >
            Add cover image
          </button>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Recommended size: 1200 × 300 px
          </span>
        </div>
      </div>

      {/* Title & Description Fields */}
      <div className="p-6 sm:p-7 space-y-4">
        {/* Large Editable Title Input */}
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled form"
            maxLength={120}
            className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent border-0 border-b-2 border-transparent focus:border-violet-500 focus:outline-none py-1 transition-all"
            aria-label="Form title"
          />
        </div>

        {/* Optional Description Textarea */}
        <div>
          <textarea
            ref={textareaRef}
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description (optional)"
            rows={2}
            maxLength={1000}
            className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:outline-none py-1 resize-none leading-relaxed transition-all"
            aria-label="Form description"
          />
        </div>
      </div>
    </div>
  );
}
