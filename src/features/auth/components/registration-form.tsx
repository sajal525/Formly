"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { FormlyLogo } from "@/components/branding/formly-logo";
import { registrationSchema, type RegistrationFormData } from "../schemas/registration-schema";
import { cn } from "@/lib/utils";

export function RegistrationForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setSubmitError(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          password: data.password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409 || body?.error?.toLowerCase().includes("taken")) {
          setError("username", {
            type: "manual",
            message: "This username is already taken. Choose a different one.",
          });
          return;
        }

        setSubmitError(body?.error || "Failed to create account. Please try again.");
        return;
      }

      // Successful registration -> session cookie established -> navigate to protected dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setSubmitError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="w-full max-w-[410px] lg:max-w-[430px] xl:max-w-[460px] 2xl:max-w-[480px] mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[24px] 2xl:rounded-[28px] p-6 sm:p-7 xl:p-8 border border-slate-200/80 dark:border-white/10 shadow-[0_15px_50px_-15px_rgba(86,59,250,0.12)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] transition-all">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
        <FormlyLogo size="md" className="mb-2 sm:mb-3" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--ink)] tracking-tight">
          Create your account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Just a username and password to get started.
        </p>
      </div>

      {/* Generic Error Banner if submitted */}
      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5 sm:space-y-4">
        {/* Username Field */}
        <div className="space-y-1">
          <label
            htmlFor="reg-username-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Username
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              id="reg-username-input"
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
          {errors.username ? (
            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1">
              {errors.username.message}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
              Choose a unique username
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="reg-password-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="reg-password-input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          {errors.password ? (
            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium pl-1">
              {errors.password.message}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
              Use at least 12 characters
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full h-11 sm:h-11.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2",
            "bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-[#BD45E8]",
            "hover:opacity-95 hover:shadow-lg hover:shadow-[#563BFA]/25 active:scale-[0.99] transition-all",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#563BFA]/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Terms & Privacy Copy (matching 2.png) */}
      <div className="mt-5 text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed px-2">
        By creating an account, you agree to our{" "}
        <span
          className="text-[#563BFA] dark:text-indigo-400 hover:underline cursor-pointer font-medium"
          onClick={() =>
            alert("Terms of Use: Formly is dedicated to privacy and secure form creation.")
          }
        >
          Terms of Use
        </span>{" "}
        and{" "}
        <span
          className="text-[#563BFA] dark:text-indigo-400 hover:underline cursor-pointer font-medium"
          onClick={() =>
            alert("Privacy Policy: Your data is safely stored and never shared with third parties.")
          }
        >
          Privacy Policy
        </span>
        .
      </div>

      {/* Mobile-only Sign-in link */}
      <div className="mt-4 sm:hidden text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#563BFA] dark:text-indigo-400 hover:underline inline-block transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
