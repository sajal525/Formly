"use client";

import React, { useState } from "react";
import { BuilderCoverImage } from "../../schemas/builder-definition-schema";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

export interface FormCoverBannerProps {
  coverImage: BuilderCoverImage;
  imageUrl: string;
  className?: string;
  isNothingTheme?: boolean;
  children?: React.ReactNode;
}

/**
 * Canonical FormCoverBanner component.
 * Renders the form cover banner with deterministic aspect-ratio fitting,
 * responsive scaling across desktop/tablet/mobile, and zero distortion or gaps.
 */
export function FormCoverBanner({
  coverImage,
  imageUrl,
  className,
  isNothingTheme = false,
  children,
}: FormCoverBannerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imageUrl]);

  const aspectPreset = coverImage.transform?.aspectPreset;
  const crop = coverImage.transform?.crop;
  const cropAspectRatio = crop?.aspectRatio;

  // Compute CSS aspect-ratio style if custom or free
  const aspectStyle: React.CSSProperties | undefined =
    aspectPreset === "free" && cropAspectRatio
      ? { aspectRatio: `${cropAspectRatio}` }
      : undefined;

  // Aspect-ratio Tailwind class matching editor presets
  const aspectClass =
    aspectPreset === "16:9"
      ? "aspect-[16/9] max-h-[380px]"
      : aspectPreset === "free"
      ? "max-h-[340px]"
      : "aspect-[4/1] max-h-[260px]";

  // Intentional border boundary separating cover banner from content
  const borderClass = isNothingTheme
    ? "border-b border-neutral-200 dark:border-neutral-800"
    : "border-b border-slate-100 dark:border-white/10";

  // Anchor focal point from crop if available
  const objectPosition = crop
    ? `${Math.max(0, Math.min(100, crop.x + crop.width / 2))}% ${Math.max(0, Math.min(100, crop.y + crop.height / 2))}%`
    : "center";

  return (
    <div
      style={aspectStyle}
      className={cn(
        "w-full relative overflow-hidden shrink-0 select-none bg-slate-100 dark:bg-slate-800/40",
        borderClass,
        aspectClass,
        className
      )}
    >
      {/* Subtle loading placeholder to avoid layout jumps */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Failure fallback */}
      {hasError ? (
        <div className="w-full h-full min-h-[90px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 gap-1.5 p-4 text-center">
          <ImageIcon className="w-6 h-6 opacity-40" />
          <span className="text-xs font-medium">Unable to load cover image</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={coverImage.altText || "Cover banner"}
          style={{ objectPosition }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover block select-none pointer-events-none transition-opacity duration-300",
            !isLoaded ? "opacity-0" : "opacity-100"
          )}
          loading="eager"
        />
      )}

      {/* Optional action overlays (e.g. builder edit buttons) */}
      {children}
    </div>
  );
}
