import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const variantStyles = {
      default: "bg-violet-600 text-white hover:bg-violet-700 shadow-xs",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs",
      outline: "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      link: "text-violet-600 underline-offset-4 hover:underline",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9",
    }[size];

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
