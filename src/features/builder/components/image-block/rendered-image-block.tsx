"use client";

import React from "react";
import {
  BuilderImageBlock,
  ImageAlignment,
  ImageDisplaySize,
} from "../../schemas/builder-definition-schema";
import { cn } from "@/lib/utils";

interface RenderedImageBlockProps {
  block: BuilderImageBlock;
  imageUrl: string;
  className?: string;
  priority?: boolean;
}

const displaySizeClasses: Record<ImageDisplaySize, string> = {
  small: "max-w-xs",
  medium: "max-w-md",
  large: "max-w-xl",
  full: "w-full max-w-full",
};

const alignmentContainerClasses: Record<ImageAlignment, string> = {
  left: "flex justify-start text-left",
  center: "flex justify-center text-center",
  right: "flex justify-end text-right",
};

export function RenderedImageBlock({
  block,
  imageUrl,
  className,
  priority = false,
}: RenderedImageBlockProps) {
  const displaySize = block.displaySize || "medium";
  const alignment = block.alignment || "center";
  const altText = block.altText?.trim() || "";
  const isDecorative = !altText;
  const transform = block.transform || { rotation: 0 };
  const crop = transform.crop;

  // If crop coordinates are specified (percentage based 0-100)
  const hasCustomCrop =
    crop &&
    (crop.x > 0 ||
      crop.y > 0 ||
      crop.width < 99 ||
      crop.height < 99 ||
      Boolean(crop.aspectRatio));

  return (
    <div
      className={cn(
        "w-full my-4 select-none",
        alignmentContainerClasses[alignment],
        className
      )}
    >
      <div className={cn("w-full transition-all duration-200", displaySizeClasses[displaySize])}>
        <figure className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs bg-slate-50 dark:bg-slate-900/60">
          {hasCustomCrop && crop ? (
            <div
              className="relative w-full overflow-hidden"
              style={{
                paddingBottom: crop.aspectRatio
                  ? `${(1 / crop.aspectRatio) * 100}%`
                  : `${(crop.height / crop.width) * 100}%`,
              }}
            >
              {/* Scaled and shifted image */}
              <img
                src={imageUrl}
                alt={altText}
                aria-hidden={isDecorative ? "true" : undefined}
                role={isDecorative ? "presentation" : undefined}
                loading={priority ? "eager" : "lazy"}
                className="absolute object-cover pointer-events-none transition-transform"
                style={{
                  width: `${(100 / crop.width) * 100}%`,
                  height: `${(100 / crop.height) * 100}%`,
                  left: `-${(crop.x / crop.width) * 100}%`,
                  top: `-${(crop.y / crop.height) * 100}%`,
                  transform: `rotate(${transform.rotation || 0}deg)`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt={altText}
                aria-hidden={isDecorative ? "true" : undefined}
                role={isDecorative ? "presentation" : undefined}
                loading={priority ? "eager" : "lazy"}
                className="w-full h-auto object-contain rounded-2xl pointer-events-none transition-transform"
                style={{
                  transform: transform.rotation
                    ? `rotate(${transform.rotation}deg)`
                    : undefined,
                }}
              />
            </div>
          )}

          {altText && (
            <figcaption className="sr-only">
              {altText}
            </figcaption>
          )}
        </figure>
      </div>
    </div>
  );
}
