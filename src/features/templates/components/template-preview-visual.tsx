import React from "react";
import {
  GraduationCap,
  Calendar,
  Smile,
  ClipboardList,
  Briefcase,
  HeartPulse,
  Star,
  Users,
  Laptop,
  MessageSquare,
  Sparkles,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplatePreviewVisualProps {
  themeKey?: string | null;
  categoryKey: string;
  slug: string;
  title: string;
  className?: string;
}

export function TemplatePreviewVisual({
  themeKey,
  categoryKey,
  slug,
  title,
  className,
}: TemplatePreviewVisualProps) {
  // Color presets matching the Formly mockup screenshot
  const getThemeConfig = () => {
    switch (themeKey) {
      case "education-soft":
        return {
          bg: "from-blue-100 via-sky-50 to-indigo-100/60 dark:from-blue-950/60 dark:to-indigo-950/40",
          accent: "#3B82F6",
          badgeBg: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
          icon: GraduationCap,
          type: "inputs",
        };
      case "event-vibrant":
        return {
          bg: "from-pink-100 via-rose-50 to-orange-100/60 dark:from-pink-950/60 dark:to-rose-950/40",
          accent: "#EC4899",
          badgeBg: "bg-pink-100/90 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300",
          icon: Calendar,
          type: "event",
        };
      case "feedback-mint":
        return {
          bg: "from-emerald-100 via-teal-50 to-green-100/60 dark:from-emerald-950/60 dark:to-teal-950/40",
          accent: "#10B981",
          badgeBg: "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
          icon: Smile,
          type: "emojis",
        };
      case "survey-purple":
        return {
          bg: "from-purple-100 via-indigo-50 to-violet-100/60 dark:from-purple-950/60 dark:to-violet-950/40",
          accent: "#8B5CF6",
          badgeBg: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
          icon: ClipboardList,
          type: "checklist",
        };
      case "business-amber":
        return {
          bg: "from-amber-100 via-yellow-50 to-orange-100/60 dark:from-amber-950/60 dark:to-orange-950/40",
          accent: "#F59E0B",
          badgeBg: "bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
          icon: Briefcase,
          type: "inputs",
        };
      case "healthcare-rose":
        return {
          bg: "from-rose-100 via-red-50 to-pink-100/60 dark:from-rose-950/60 dark:to-pink-950/40",
          accent: "#F43F5E",
          badgeBg: "bg-rose-100/90 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
          icon: HeartPulse,
          type: "medical",
        };
      case "education-forest":
        return {
          bg: "from-teal-100 via-emerald-50 to-green-100/60 dark:from-teal-950/60 dark:to-green-950/40",
          accent: "#0D9488",
          badgeBg: "bg-teal-100/90 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300",
          icon: Star,
          type: "stars",
        };
      case "community-indigo":
        return {
          bg: "from-indigo-100 via-violet-50 to-purple-100/60 dark:from-indigo-950/60 dark:to-purple-950/40",
          accent: "#6366F1",
          badgeBg: "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
          icon: Users,
          type: "community",
        };
      case "event-sunset":
        return {
          bg: "from-orange-100 via-amber-50 to-rose-100/60 dark:from-orange-950/60 dark:to-rose-950/40",
          accent: "#F97316",
          badgeBg: "bg-orange-100/90 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
          icon: Laptop,
          type: "inputs",
        };
      case "business-emerald":
        return {
          bg: "from-green-100 via-emerald-50 to-teal-100/60 dark:from-green-950/60 dark:to-teal-950/40",
          accent: "#059669",
          badgeBg: "bg-green-100/90 text-green-700 dark:bg-green-900/60 dark:text-green-300",
          icon: Star,
          type: "stars",
        };
      case "hr-lavender":
        return {
          bg: "from-fuchsia-100 via-purple-50 to-pink-100/60 dark:from-fuchsia-950/60 dark:to-purple-950/40",
          accent: "#D946EF",
          badgeBg: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
          icon: Users,
          type: "inputs",
        };
      case "other-sky":
      default:
        return {
          bg: "from-sky-100 via-blue-50 to-indigo-100/60 dark:from-sky-950/60 dark:to-blue-950/40",
          accent: "#0EA5E9",
          badgeBg: "bg-sky-100/90 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
          icon: MessageSquare,
          type: "inputs",
        };
    }
  };

  const config = getThemeConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "relative w-full h-[148px] rounded-t-2xl overflow-hidden bg-gradient-to-br flex items-center justify-center p-3 select-none",
        config.bg,
        className
      )}
    >
      {/* Background soft ambient circles */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/40 dark:bg-white/5 blur-xl pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-white/40 dark:bg-white/5 blur-lg pointer-events-none" />

      {/* Floating theme accent icon at top-right */}
      <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xs border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200">
        <IconComponent className="w-3.5 h-3.5" style={{ color: config.accent }} />
      </div>

      {/* Mini stylized form card */}
      <div className="w-[180px] bg-white dark:bg-slate-900/90 rounded-xl shadow-md border border-slate-200/80 dark:border-white/10 p-2.5 flex flex-col gap-1.5 transform hover:scale-[1.02] transition-transform duration-200">
        {/* Form header */}
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div
            className="w-2.5 h-2.5 rounded-xs"
            style={{ backgroundColor: config.accent }}
          />
          <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-none">
            {title}
          </span>
        </div>

        {/* Form body representation based on type */}
        {config.type === "emojis" ? (
          <div className="py-1 flex items-center justify-center gap-2">
            <span className="text-xs">😍</span>
            <span className="text-xs">😊</span>
            <span className="text-xs">😐</span>
            <span className="text-xs">🙁</span>
          </div>
        ) : config.type === "stars" ? (
          <div className="py-1 flex items-center justify-center gap-1.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-2.5 h-2.5 fill-current" />
            ))}
          </div>
        ) : config.type === "checklist" ? (
          <div className="space-y-1 py-0.5">
            <div className="flex items-center gap-1">
              <CheckSquare className="w-2.5 h-2.5 text-violet-500" />
              <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-sm" />
            </div>
            <div className="flex items-center gap-1">
              <CheckSquare className="w-2.5 h-2.5 text-violet-500" />
              <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-sm" />
            </div>
          </div>
        ) : (
          <div className="space-y-1 py-0.5">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center px-1">
              <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-xs" />
            </div>
            <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center px-1">
              <div className="h-1 w-8 bg-slate-200 dark:bg-slate-700 rounded-xs" />
            </div>
          </div>
        )}

        {/* Mini action button */}
        <div
          className="h-3 rounded-md w-full flex items-center justify-center mt-0.5"
          style={{ backgroundColor: config.accent }}
        >
          <div className="h-1 w-8 bg-white/90 rounded-xs" />
        </div>
      </div>
    </div>
  );
}
