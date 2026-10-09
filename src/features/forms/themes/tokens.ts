import { PrimaryColorKey, FontPairKey, CardStyle } from "./schema";

export interface ColorSwatch {
  key: PrimaryColorKey;
  label: string;
  hex: string;
  contrastText: string;
}

export const PRIMARY_COLOR_SWATCHES: ColorSwatch[] = [
  { key: "violet", label: "Violet Accent", hex: "#7C3AED", contrastText: "#FFFFFF" },
  { key: "blue", label: "Blue Accent", hex: "#2563EB", contrastText: "#FFFFFF" },
  { key: "cyan", label: "Cyan Accent", hex: "#0891B2", contrastText: "#FFFFFF" },
  { key: "pink", label: "Pink Accent", hex: "#DB2777", contrastText: "#FFFFFF" },
  { key: "red", label: "Red Accent", hex: "#DC2626", contrastText: "#FFFFFF" },
  { key: "orange", label: "Amber Accent", hex: "#EA580C", contrastText: "#FFFFFF" },
  { key: "green", label: "Green Accent", hex: "#16A34A", contrastText: "#FFFFFF" },
  { key: "emerald", label: "Emerald Accent", hex: "#059669", contrastText: "#FFFFFF" },
  { key: "slate", label: "Slate Accent", hex: "#475569", contrastText: "#FFFFFF" },
];

export interface FontPairOption {
  key: FontPairKey;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  sampleText: string;
}

export const FONT_PAIR_OPTIONS: FontPairOption[] = [
  {
    key: "sans",
    name: "Modern Sans",
    description: "Neutral, high-legibility geometric sans",
    headingFont: "font-sans",
    bodyFont: "font-sans",
    sampleText: "Aa Modern",
  },
  {
    key: "clean",
    name: "Clean Grotesk",
    description: "Crisp and structured contemporary feel",
    headingFont: "font-sans font-semibold tracking-tight",
    bodyFont: "font-sans",
    sampleText: "Aa Clean",
  },
  {
    key: "serif",
    name: "Classic Serif",
    description: "Refined, literary editorial aesthetic",
    headingFont: "font-serif tracking-normal",
    bodyFont: "font-sans",
    sampleText: "Aa Serif",
  },
  {
    key: "mono",
    name: "Tech Mono",
    description: "Developer and technical precision",
    headingFont: "font-mono font-bold tracking-tight",
    bodyFont: "font-mono text-xs",
    sampleText: "Aa Mono",
  },
  {
    key: "rounded",
    name: "Playful Rounded",
    description: "Friendly, casual and approachable",
    headingFont: "font-sans font-bold tracking-normal",
    bodyFont: "font-sans",
    sampleText: "Aa Rounded",
  },
];

export interface CardStyleOption {
  key: CardStyle;
  label: string;
  description: string;
  classes: string;
}

export const CARD_STYLE_OPTIONS: CardStyleOption[] = [
  {
    key: "default",
    label: "Default",
    description: "Clean solid background with soft border",
    classes: "bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-white/10 shadow-sm",
  },
  {
    key: "glass",
    label: "Glass",
    description: "Frosted glassmorphism with subtle blur",
    classes: "backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-white/60 dark:border-white/15 shadow-lg",
  },
  {
    key: "outlined",
    label: "Outlined",
    description: "High-contrast defined outline with flat fill",
    classes: "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-none",
  },
];
