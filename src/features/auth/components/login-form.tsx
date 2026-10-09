"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { FormlyLogo } from "@/components/branding/formly-logo";
import { loginSchema, type LoginFormData } from "../schemas/login-schema";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      const response = await authClient.signIn.username({
        username: data.username.trim(),
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (response.error) {
        setSubmitError("Username or password is incorrect");
        return;
      }

      // Successful sign in -> navigate to protected dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Sign in error:", err);
      setSubmitError("Username or password is incorrect");
    }
  };

  return (
    <div className="w-full max-w-[410px] lg:max-w-[430px] xl:max-w-[460px] 2xl:max-w-[480px] mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[24px] 2xl:rounded-[28px] p-6 sm:p-7 xl:p-8 border border-slate-200/80 dark:border-white/10 shadow-[0_15px_50px_-15px_rgba(86,59,250,0.12)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] transition-all">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
        <FormlyLogo size="md" className="mb-2 sm:mb-3" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sign in to your account
        </p>
      </div>

      {/* Generic Error Banner if submitted */}
      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} method="POST" noValidate className="space-y-3 sm:space-y-3.5">
        {/* Username Field */}
        <div className="space-y-1">
          <label
            htmlFor="username-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Username
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              id="username-input"
              type="text"
              autoComplete="username"
              placeholder="Username"
              disabled={isSubmitting}
              {...register("username")}
              className={cn(
                "w-full h-11 sm:h-11.5 pl-10 pr-3.5 rounded-xl text-sm bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100",
                "border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "focus:outline-none focus:border-[#563BFA] focus:ring-4 focus:ring-[#563BFA]/15 transition-all shadow-sm",
                errors.username && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
              )}
            />
          </div>
          {errors.username && (
            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="password-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              disabled={isSubmitting}
              {...register("password")}
              className={cn(
                "w-full h-11 sm:h-11.5 pl-10 pr-10 rounded-xl text-sm bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100",
                "border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "focus:outline-none focus:border-[#563BFA] focus:ring-4 focus:ring-[#563BFA]/15 transition-all shadow-sm",
                errors.password && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#563BFA]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-0.5 pb-0.5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-3.5 h-3.5 rounded text-[#563BFA] focus:ring-[#563BFA] border-slate-300 dark:border-slate-600 dark:bg-slate-800 accent-[#563BFA]"
            />
            <span className="text-[11px] sm:text-xs">Remember me</span>
          </label>

          {/* Forgot password placeholder per Section 2: defer active link until recovery exists */}
          <span
            className="text-[11px] sm:text-xs text-[#563BFA] dark:text-indigo-400 font-medium hover:underline cursor-pointer"
            onClick={() =>
              alert("Password recovery will be enabled once verified account recovery is configured.")
            }
          >
            Forgot password?
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full h-11 sm:h-11.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2",
            "bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-[#BD45E8]",
            "hover:opacity-95 hover:shadow-lg hover:shadow-[#563BFA]/25 active:scale-[0.99] transition-all",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#563BFA]/30 disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Social Providers Divider */}
      <div className="relative my-4 sm:my-4.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/80 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white/90 dark:bg-slate-900/90 px-3 text-[11px] text-slate-400 dark:text-slate-500">
            or continue with
          </span>
        </div>
      </div>

      {/* Social Buttons (Visual row per 1.png; deferred action per Section 2) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Google */}
        <button
          type="button"
          onClick={() => alert("Google sign-in will be enabled in a future auth step.")}
          aria-label="Sign in with Google (available soon)"
          className="h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => alert("GitHub sign-in will be enabled in a future auth step.")}
          aria-label="Sign in with GitHub (available soon)"
          className="h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-white shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </button>

        {/* Microsoft */}
        <button
          type="button"
          onClick={() => alert("Microsoft sign-in will be enabled in a future auth step.")}
          aria-label="Sign in with Microsoft (available soon)"
          className="h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#F25022" d="M1 1h10v10H1z" />
            <path fill="#7FBA00" d="M13 1h10v10H13z" />
            <path fill="#00A4EF" d="M1 13h10v10H1z" />
            <path fill="#FFB900" d="M13 13h10v10H13z" />
          </svg>
        </button>
      </div>

      {/* Account Creation Prompt */}
      <div className="mt-4 sm:mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#563BFA] dark:text-indigo-400 hover:underline inline-block transition-colors"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}
