export type ThemeCategory =
  | "All"
  | "Minimal"
  | "Education"
  | "Professional"
  | "Fun"
  | "Nature"
  | "Event"
  | "Dark";

export interface FormlyThemePreset {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  accentColor: string;
  gradientClass: string;
  solidBgColor: string;
  cardClass: string;
  badgeClass: string;
  previewColors: string[];
  isDark?: boolean;
  decorativeStyle?: "dots" | "floral" | "tech" | "playful" | "vintage" | "space" | "nature" | "royal" | "academic" | "festive";
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  "All",
  "Minimal",
  "Education",
  "Professional",
  "Fun",
  "Nature",
  "Event",
  "Dark",
];

export const FORMLY_THEME_CATALOG: FormlyThemePreset[] = [
  {
    id: "soft-lavender", // Also referred to as Minimal in B2
    name: "Minimal",
    description: "Clean and simple design",
    category: "Minimal",
    accentColor: "#7C3AED",
    gradientClass: "from-purple-50/70 via-indigo-50/40 to-violet-50/60 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/40",
    solidBgColor: "#F5F3FF",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-purple-200/60 dark:border-purple-900/30",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
    previewColors: ["#7C3AED", "#C4B5FD", "#F5F3FF"],
    decorativeStyle: "dots",
  },
  {
    id: "classic-royal",
    name: "Classic Royal",
    description: "Elegant and professional",
    category: "Professional",
    accentColor: "#D97706",
    gradientClass: "from-slate-900 via-indigo-950 to-blue-950 text-white",
    solidBgColor: "#0F172A",
    cardClass: "bg-slate-900/90 text-white border-amber-500/40 shadow-xl",
    badgeClass: "bg-amber-950/80 text-amber-300 border border-amber-600/50",
    previewColors: ["#D97706", "#F59E0B", "#1E1B4B"],
    isDark: true,
    decorativeStyle: "royal",
  },
  {
    id: "floral",
    name: "Floral",
    description: "Soft and beautiful",
    category: "Event",
    accentColor: "#EC4899",
    gradientClass: "from-pink-50/80 via-rose-50/50 to-red-50/40 dark:from-slate-950 dark:via-pink-950/30 dark:to-rose-950/40",
    solidBgColor: "#FDF2F8",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-pink-200/70 dark:border-pink-900/40",
    badgeClass: "bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300",
    previewColors: ["#EC4899", "#F472B6", "#FDF2F8"],
    decorativeStyle: "floral",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Modern and futuristic",
    category: "Dark",
    accentColor: "#06B6D4",
    gradientClass: "from-slate-950 via-cyan-950/50 to-blue-950 text-white",
    solidBgColor: "#030712",
    cardClass: "bg-slate-900/95 text-white border-cyan-500/40 shadow-xl shadow-cyan-950/30",
    badgeClass: "bg-cyan-950 text-cyan-300 border border-cyan-600/40",
    previewColors: ["#06B6D4", "#67E8F9", "#082F49"],
    isDark: true,
    decorativeStyle: "tech",
  },
  {
    id: "gen-z",
    name: "Gen-Z",
    description: "Trendy and playful",
    category: "Fun",
    accentColor: "#8B5CF6",
    gradientClass: "from-yellow-50/80 via-pink-50/60 to-purple-50/80 dark:from-slate-950 dark:via-purple-950/40 dark:to-pink-950/40",
    solidBgColor: "#FAF5FF",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-purple-200/80 dark:border-purple-800/40 shadow-md",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    previewColors: ["#8B5CF6", "#F43F5E", "#FDE047"],
    decorativeStyle: "playful",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Classic and aesthetic",
    category: "Minimal",
    accentColor: "#B45309",
    gradientClass: "from-amber-50/90 via-stone-50/70 to-orange-50/50 dark:from-stone-950 dark:via-amber-950/30 dark:to-stone-900/60",
    solidBgColor: "#FEF3C7",
    cardClass: "bg-white/95 dark:bg-stone-900/95 border-amber-300/60 dark:border-amber-900/40",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
    previewColors: ["#B45309", "#D97706", "#FFFBEB"],
    decorativeStyle: "vintage",
  },
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Fun and creative",
    category: "Fun",
    accentColor: "#0284C7",
    gradientClass: "from-sky-100/70 via-blue-50/50 to-indigo-50/60 dark:from-slate-950 dark:via-sky-950/40 dark:to-blue-950/40",
    solidBgColor: "#F0F9FF",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-sky-300/80 dark:border-sky-800/40 rounded-3xl",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    previewColors: ["#0284C7", "#38BDF8", "#E0F2FE"],
    decorativeStyle: "playful",
  },
  {
    id: "space",
    name: "Space",
    description: "Bold and immersive",
    category: "Dark",
    accentColor: "#6366F1",
    gradientClass: "from-slate-950 via-indigo-950 to-purple-950 text-white",
    solidBgColor: "#020617",
    cardClass: "bg-slate-900/90 text-white border-indigo-500/40 shadow-2xl",
    badgeClass: "bg-indigo-950 text-indigo-300 border border-indigo-600/40",
    previewColors: ["#6366F1", "#A5B4FC", "#0F172A"],
    isDark: true,
    decorativeStyle: "space",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Fresh and calm",
    category: "Nature",
    accentColor: "#059669",
    gradientClass: "from-emerald-50/80 via-teal-50/50 to-green-50/60 dark:from-slate-950 dark:via-emerald-950/30 dark:to-teal-950/40",
    solidBgColor: "#ECFDF5",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-900/30",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
    previewColors: ["#059669", "#34D399", "#D1FAE5"],
    decorativeStyle: "nature",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Ideal for workplaces",
    category: "Professional",
    accentColor: "#2563EB",
    gradientClass: "from-blue-50/70 via-slate-50/60 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-blue-950/40",
    solidBgColor: "#F8FAFC",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-sm",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    previewColors: ["#2563EB", "#60A5FA", "#EFF6FF"],
    decorativeStyle: "dots",
  },
  {
    id: "education",
    name: "Education",
    description: "Perfect for student forms",
    category: "Education",
    accentColor: "#3B82F6",
    gradientClass: "from-amber-50/60 via-blue-50/40 to-sky-50/60 dark:from-slate-950 dark:via-blue-950/30 dark:to-amber-950/20",
    solidBgColor: "#EFF6FF",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-blue-200/80 dark:border-blue-900/40",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    previewColors: ["#3B82F6", "#F59E0B", "#DBEAFE"],
    decorativeStyle: "academic",
  },
  {
    id: "party-event",
    name: "Party / Event",
    description: "Great for registrations",
    category: "Event",
    accentColor: "#F43F5E",
    gradientClass: "from-pink-50/80 via-orange-50/50 to-rose-50/60 dark:from-slate-950 dark:via-pink-950/40 dark:to-orange-950/30",
    solidBgColor: "#FFF1F2",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-rose-200/80 dark:border-rose-900/40",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    previewColors: ["#F43F5E", "#FB7185", "#FFE4E6"],
    decorativeStyle: "festive",
  },
];

export function findThemePreset(themeKey?: string | null): FormlyThemePreset {
  if (!themeKey) return FORMLY_THEME_CATALOG[0];

  // Match by id or normalize alias
  const clean = themeKey.toLowerCase().trim();
  const direct = FORMLY_THEME_CATALOG.find((t) => t.id === clean);
  if (direct) return direct;

  // Aliases for backward compatibility
  if (clean === "minimal") return FORMLY_THEME_CATALOG[0];
  if (clean === "survey-purple") return FORMLY_THEME_CATALOG.find((t) => t.id === "gen-z") || FORMLY_THEME_CATALOG[0];
  if (clean === "education-soft") return FORMLY_THEME_CATALOG.find((t) => t.id === "education") || FORMLY_THEME_CATALOG[0];
  if (clean === "business-amber") return FORMLY_THEME_CATALOG.find((t) => t.id === "classic-royal") || FORMLY_THEME_CATALOG[0];
  if (clean === "feedback-mint" || clean === "business-emerald") return FORMLY_THEME_CATALOG.find((t) => t.id === "nature") || FORMLY_THEME_CATALOG[0];
  if (clean === "healthcare-rose" || clean === "event-vibrant") return FORMLY_THEME_CATALOG.find((t) => t.id === "party-event") || FORMLY_THEME_CATALOG[0];

  return FORMLY_THEME_CATALOG[0];
}
