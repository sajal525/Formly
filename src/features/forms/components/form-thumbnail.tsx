import React from "react";
import { FileText } from "lucide-react";

interface FormThumbnailProps {
  themeKey?: string | null;
  className?: string;
}

export function FormThumbnail({ themeKey, className = "" }: FormThumbnailProps) {
  // Neutral Formly document icon with restrained accent until themes exist
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-[#EEF0FF] dark:bg-indigo-950/60 border border-indigo-100/70 dark:border-indigo-900/40 flex items-center justify-center text-[#563BFA] dark:text-indigo-400 shrink-0 shadow-2xs ${className}`}
      aria-hidden="true"
    >
      <FileText className="w-4 h-4" />
    </div>
  );
}
