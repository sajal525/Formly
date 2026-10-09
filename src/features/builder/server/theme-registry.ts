export interface FormlyTheme {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  gradientClass: string;
  cardClass: string;
  badgeClass: string;
  previewColors: string[];
}

export const FORMLY_THEMES: FormlyTheme[] = [
  {
    id: "soft-lavender",
    name: "Modern Lavender",
    description: "Elegant pastel lavender with deep indigo accents.",
    accentColor: "#6366F1",
    gradientClass: "from-slate-50 via-indigo-50/30 to-violet-50/50 dark:from-slate-950 dark:via-indigo-950/40 dark:to-violet-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-white/10",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
    previewColors: ["#6366F1", "#A5B4FC", "#EEF2FF"],
  },
  {
    id: "education-soft",
    name: "Ocean Breeze",
    description: "Crisp cyan and deep sky blue tones for education and tech.",
    accentColor: "#3B82F6",
    gradientClass: "from-blue-50/60 via-sky-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/40 dark:to-sky-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-blue-200/80 dark:border-blue-900/30",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
    previewColors: ["#3B82F6", "#93C5FD", "#EFF6FF"],
  },
  {
    id: "event-vibrant",
    name: "Vibrant Berry",
    description: "Energetic pink and magenta accents for creative events.",
    accentColor: "#EC4899",
    gradientClass: "from-pink-50/60 via-rose-50/40 to-purple-50/40 dark:from-slate-950 dark:via-pink-950/40 dark:to-rose-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-pink-200/80 dark:border-pink-900/30",
    badgeClass: "bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300",
    previewColors: ["#EC4899", "#F472B6", "#FDF2F8"],
  },
  {
    id: "feedback-mint",
    name: "Fresh Mint",
    description: "Clean emerald and mint hues ideal for customer feedback.",
    accentColor: "#10B981",
    gradientClass: "from-emerald-50/60 via-teal-50/40 to-cyan-50/40 dark:from-slate-950 dark:via-emerald-950/40 dark:to-teal-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-900/30",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    previewColors: ["#10B981", "#6EE7B7", "#ECFDF5"],
  },
  {
    id: "survey-purple",
    name: "Royal Purple",
    description: "Deep regal violet tailored for research and professional surveys.",
    accentColor: "#8B5CF6",
    gradientClass: "from-purple-50/60 via-violet-50/40 to-indigo-50/40 dark:from-slate-950 dark:via-purple-950/40 dark:to-violet-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-purple-200/80 dark:border-purple-900/30",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
    previewColors: ["#8B5CF6", "#C4B5FD", "#F5F3FF"],
  },
  {
    id: "business-amber",
    name: "Warm Amber",
    description: "Warm golden tones for hospitality, sales, and retail inquiries.",
    accentColor: "#F59E0B",
    gradientClass: "from-amber-50/60 via-orange-50/40 to-yellow-50/40 dark:from-slate-950 dark:via-amber-950/40 dark:to-orange-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-amber-200/80 dark:border-amber-900/30",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    previewColors: ["#F59E0B", "#FCD34D", "#FFFBEB"],
  },
  {
    id: "healthcare-rose",
    name: "Crimson Rose",
    description: "Thoughtful and caring crimson tones for health and wellness.",
    accentColor: "#F43F5E",
    gradientClass: "from-rose-50/60 via-red-50/40 to-pink-50/40 dark:from-slate-950 dark:via-rose-950/40 dark:to-red-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-rose-200/80 dark:border-rose-900/30",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300",
    previewColors: ["#F43F5E", "#FDA4AF", "#FFF1F2"],
  },
  {
    id: "business-emerald",
    name: "Executive Emerald",
    description: "Deep forest emerald for formal enterprise registrations.",
    accentColor: "#059669",
    gradientClass: "from-green-50/60 via-emerald-50/40 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/50 dark:to-teal-950/50",
    cardClass: "bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-900/30",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    previewColors: ["#059669", "#34D399", "#ECFDF5"],
  },
];

export function getTheme(themeKey?: string | null): FormlyTheme {
  const found = FORMLY_THEMES.find((t) => t.id === themeKey);
  return found || FORMLY_THEMES[0];
}

export function getAllThemes(): FormlyTheme[] {
  return FORMLY_THEMES;
}
