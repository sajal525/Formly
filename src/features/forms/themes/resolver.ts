import { findThemePreset, FormlyThemePreset } from "./catalog";
import { ThemeOverrides } from "./schema";
import { PRIMARY_COLOR_SWATCHES, FONT_PAIR_OPTIONS, CARD_STYLE_OPTIONS } from "./tokens";

export interface ResolvedThemeTokens {
  preset: FormlyThemePreset;
  accentColor: string;
  backgroundMode: "solid" | "gradient" | "image";
  backgroundClass: string;
  backgroundStyle?: React.CSSProperties;
  cardClass: string;
  badgeClass: string;
  headingFontClass: string;
  bodyFontClass: string;
  headerAlignment: "left" | "center";
  headerPaddingClass: string;
  isDark: boolean;
}

export function resolveThemeTokens(
  themeKey?: string | null,
  overrides?: ThemeOverrides | null
): ResolvedThemeTokens {
  const preset = findThemePreset(themeKey);

  // 1. Accent color
  let accentColor = preset.accentColor;
  if (overrides?.primaryColorKey) {
    const swatch = PRIMARY_COLOR_SWATCHES.find((s) => s.key === overrides.primaryColorKey);
    if (swatch) {
      accentColor = swatch.hex;
    }
  }

  // 2. Background mode and style
  const backgroundMode = overrides?.background?.mode || "gradient";
  let backgroundClass = preset.gradientClass;
  let backgroundStyle: React.CSSProperties | undefined = undefined;

  if (backgroundMode === "solid") {
    backgroundClass = "";
    backgroundStyle = { backgroundColor: preset.solidBgColor };
  } else {
    // gradient mode
    backgroundClass = preset.gradientClass;
  }

  // 3. Card style
  let cardClass = preset.cardClass;
  if (overrides?.cardStyle) {
    const cardOpt = CARD_STYLE_OPTIONS.find((c) => c.key === overrides.cardStyle);
    if (cardOpt) {
      if (overrides.cardStyle === "glass") {
        cardClass = preset.isDark
          ? "backdrop-blur-md bg-slate-900/80 border border-white/15 text-white shadow-xl"
          : "backdrop-blur-md bg-white/80 border border-white/60 shadow-lg";
      } else if (overrides.cardStyle === "outlined") {
        cardClass = preset.isDark
          ? "bg-slate-950 border-2 border-slate-700 text-white shadow-none"
          : "bg-white border-2 border-slate-300 shadow-none";
      } else {
        // default
        cardClass = preset.cardClass;
      }
    }
  }

  // 4. Font pairing
  let headingFontClass = "font-sans";
  let bodyFontClass = "font-sans";
  if (overrides?.fontPairKey) {
    const fontOpt = FONT_PAIR_OPTIONS.find((f) => f.key === overrides.fontPairKey);
    if (fontOpt) {
      headingFontClass = fontOpt.headingFont;
      bodyFontClass = fontOpt.bodyFont;
    }
  } else if (preset.isDark) {
    headingFontClass = "font-sans font-semibold tracking-tight";
  }

  // 5. Header settings
  const headerAlignment = overrides?.header?.layout === "centered" ? "center" : "left";
  let headerPaddingClass = "p-6 sm:p-8";
  if (overrides?.header?.height === "compact") {
    headerPaddingClass = "p-4 sm:p-5";
  } else if (overrides?.header?.height === "spacious") {
    headerPaddingClass = "p-8 sm:p-12";
  }

  return {
    preset,
    accentColor,
    backgroundMode,
    backgroundClass,
    backgroundStyle,
    cardClass,
    badgeClass: preset.badgeClass,
    headingFontClass,
    bodyFontClass,
    headerAlignment,
    headerPaddingClass,
    isDark: Boolean(preset.isDark),
  };
}
