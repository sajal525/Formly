import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface FormlyLogoProps {
  /** Size variant for the mark and typography */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether to render the horizontal "Formly" wordmark alongside the mark */
  showWordmark?: boolean;
  /** Explicit theme variant or auto (adapts to current light/dark mode) */
  variant?: "auto" | "light" | "dark";
  /** Whether to render the mark inside a rounded app icon tile */
  asTile?: boolean;
  /** Whether the wordmark is compact at rest on desktop and expands on hover/focus */
  expandOnHover?: boolean;
  /** Accessible name for screen readers when used without adjacent text */
  accessibleName?: string;
  /** Custom className for the root container */
  className?: string;
}

/**
 * Reusable Formly brand mark and horizontal logo component.
 * Integrates the folded geometric F brand icon in light and dark modes.
 * Uses React useId() to guarantee uniquely scoped SVG gradient definitions across instances.
 */
export function FormlyLogo({
  size = "md",
  showWordmark = true,
  variant = "auto",
  asTile = false,
  expandOnHover = false,
  accessibleName,
  className,
}: FormlyLogoProps) {
  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const markDimensions = {
    xs: "w-6 h-6",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const textSizes = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  // Helper to render the F mark paths with uniquely scoped gradient IDs
  const renderMarkContent = (isDark: boolean) => {
    const modeKey = isDark ? "dark" : "light";
    const topArmId = `fl-top-${idPrefix}-${modeKey}`;
    const midArmId = `fl-mid-${idPrefix}-${modeKey}`;
    const upperRibbonId = `fl-ribbon-${idPrefix}-${modeKey}`;
    const lowerStemId = `fl-stem-${idPrefix}-${modeKey}`;
    const creaseShadowId = `fl-shadow-${idPrefix}-${modeKey}`;

    return (
      <svg
        viewBox="0 0 512 512"
        fill="none"
        className="w-full h-full select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={topArmId}
            x1="220"
            y1="74"
            x2="390"
            y2="180"
            gradientUnits="userSpaceOnUse"
          >
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F2F4FD" />
                <stop offset="100%" stopColor="#D7DEFC" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#1A1C24" />
                <stop offset="100%" stopColor="#0E1015" />
              </>
            )}
          </linearGradient>

          <linearGradient
            id={midArmId}
            x1="220"
            y1="234"
            x2="320"
            y2="340"
            gradientUnits="userSpaceOnUse"
          >
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#E83BF9" />
                <stop offset="50%" stopColor="#C823EE" />
                <stop offset="100%" stopColor="#9C17EC" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#E233F8" />
                <stop offset="60%" stopColor="#C11EEE" />
                <stop offset="100%" stopColor="#9A0FE6" />
              </>
            )}
          </linearGradient>

          <linearGradient
            id={upperRibbonId}
            x1="160"
            y1="74"
            x2="160"
            y2="350"
            gradientUnits="userSpaceOnUse"
          >
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#8561FE" />
                <stop offset="50%" stopColor="#6542FB" />
                <stop offset="100%" stopColor="#512CF8" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#6948FF" />
                <stop offset="50%" stopColor="#5534FB" />
                <stop offset="100%" stopColor="#4621F7" />
              </>
            )}
          </linearGradient>

          <linearGradient
            id={lowerStemId}
            x1="120"
            y1="280"
            x2="220"
            y2="430"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1A3FE8" />
            <stop offset="50%" stopColor="#2457F7" />
            <stop offset="100%" stopColor="#3470FE" />
          </linearGradient>

          <linearGradient
            id={creaseShadowId}
            x1="120"
            y1="280"
            x2="220"
            y2="350"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor="#061258"
              stopOpacity={isDark ? "0.55" : "0.45"}
            />
            <stop
              offset="100%"
              stopColor="#061258"
              stopOpacity={isDark ? "0.15" : "0.1"}
            />
          </linearGradient>
        </defs>

        {/* Lower Stem */}
        <path
          d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z"
          fill={`url(#${lowerStemId})`}
        />

        {/* Crease shadow */}
        <path
          d="M112 284 L224 352 L224 364 L112 296 Z"
          fill={`url(#${creaseShadowId})`}
        />

        {/* Upper Ribbon (Folded Facet) */}
        <path
          d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z"
          fill={`url(#${upperRibbonId})`}
        />

        {/* Middle Arm */}
        <path
          d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z"
          fill={`url(#${midArmId})`}
        />

        {/* Upper Arm */}
        <path
          d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z"
          fill={`url(#${topArmId})`}
        />
      </svg>
    );
  };

  const tileClasses = asTile
    ? "p-1.5 rounded-2xl bg-white dark:bg-[#0B0F19] shadow-sm dark:shadow-[0_0_20px_rgba(110,60,250,0.25)] border border-slate-200/60 dark:border-white/10"
    : "";

  return (
    <div
      className={cn(
        "inline-flex items-center select-none shrink-0",
        !expandOnHover && "gap-2.5 transition-opacity",
        expandOnHover && "gap-0 formly-logo-trigger",
        className
      )}
      role={accessibleName || (!showWordmark && !expandOnHover) ? "img" : undefined}
      aria-label={accessibleName || (!showWordmark && !expandOnHover ? "Formly" : undefined)}
    >
      {/* 1. Mark Container */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 transition-transform duration-200",
          !expandOnHover && "hover:scale-105",
          markDimensions,
          tileClasses
        )}
      >
        {variant === "auto" ? (
          <>
            <div className="w-full h-full block dark:hidden">
              {renderMarkContent(false)}
            </div>
            <div className="w-full h-full hidden dark:block">
              {renderMarkContent(true)}
            </div>
          </>
        ) : variant === "light" ? (
          <div className="w-full h-full">{renderMarkContent(false)}</div>
        ) : (
          <div className="w-full h-full">{renderMarkContent(true)}</div>
        )}
      </div>

      {/* 2. Formly Wordmark */}
      {showWordmark && (
        <span
          aria-hidden={expandOnHover ? "true" : undefined}
          className={cn(
            "font-extrabold tracking-[-0.035em] leading-none transition-colors",
            variant === "auto"
              ? "text-[#060B1E] dark:text-white"
              : variant === "light"
              ? "text-[#060B1E]"
              : "text-white",
            textSizes,
            expandOnHover && "formly-logo-wordmark-expandable"
          )}
        >
          Formly
        </span>
      )}
    </div>
  );
}
