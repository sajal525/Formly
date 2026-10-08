import React from "react";
import { cn } from "@/lib/utils";

interface FormlyLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

export function FormlyLogo({
  size = "md",
  showWordmark = true,
  className,
}: FormlyLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7 rounded-lg text-sm",
    md: "w-9 h-9 rounded-xl text-base",
    lg: "w-11 h-11 rounded-2xl text-lg",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Icon: Rounded purple square with 4-point sparkle */}
      <div
        className={cn(
          "bg-[#563BFA] text-white flex items-center justify-center shadow-md shadow-[#563BFA]/25 transition-transform hover:scale-105",
          iconSizes
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-white"
        >
          {/* 4-point star sparkle */}
          <path d="M12 2C12.5 7 17 11.5 22 12C17 12.5 12.5 17 12 22C11.5 17 7 12.5 2 12C7 11.5 11.5 7 12 2Z" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight text-[var(--ink)] transition-colors",
            textSizes
          )}
        >
          Formly
        </span>
      )}
    </div>
  );
}
