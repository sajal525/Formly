"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  initial?: string | null;
  size?: UserAvatarSize;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<UserAvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl",
  xl: "w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl",
  custom: "",
};

export function UserAvatar({
  src,
  name,
  initial,
  size = "md",
  className,
  imageClassName,
  fallbackClassName,
  alt,
  ariaLabel,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedInitial =
    initial ||
    (name?.trim() ? name.trim()[0].toUpperCase() : "U");

  const resolvedAlt = alt || (name ? `${name}'s profile picture` : "User profile picture");
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const showImage = Boolean(src) && !hasError;

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden shrink-0 relative select-none",
        sizeClass,
        className
      )}
      aria-label={ariaLabel || resolvedAlt}
      role="img"
    >
      {showImage ? (
        <img
          src={src!}
          alt={resolvedAlt}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            imageClassName
          )}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full bg-gradient-to-tr from-[#329CF5] to-[#563BFA] flex items-center justify-center text-white font-bold leading-none shadow-xs",
            fallbackClassName
          )}
        >
          <span>{resolvedInitial}</span>
        </div>
      )}
    </div>
  );
}
