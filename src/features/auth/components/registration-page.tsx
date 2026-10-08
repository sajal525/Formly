import React from "react";
import { RegistrationHeader } from "./registration-header";
import { RegistrationHero } from "./registration-hero";
import { RegistrationForm } from "./registration-form";

export function RegistrationPage() {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-[var(--page-bg)] text-[var(--body-text)] transition-colors duration-300">
      {/* Soft Pastel Ambient Mesh Gradient (matching 2.png) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-200/50 via-blue-200/35 to-transparent dark:from-cyan-900/20 dark:via-blue-900/10 dark:to-transparent rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-pink-200/45 via-purple-200/40 to-indigo-200/25 dark:from-pink-950/20 dark:via-purple-900/15 dark:to-transparent rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute -bottom-10 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-pink-200/40 via-lavender/35 to-blue-100/30 dark:from-indigo-950/15 dark:via-purple-950/10 dark:to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-purple-200/35 to-pink-200/30 dark:from-purple-950/15 dark:to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <RegistrationHeader />

      {/* Main Content Area: Split 2-Column Desktop / 1-Column Mobile */}
      <main className="flex-1 w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 py-2 sm:py-3 lg:py-4 flex items-center justify-center min-h-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 2xl:gap-16 items-center">
          {/* Left Column: Hero Content & Benefits (~7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 min-h-0">
            <RegistrationHero />
          </div>

          {/* Right Column: Registration Glass Card (~5 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end items-center min-h-0">
            <RegistrationForm />
          </div>
        </div>
      </main>

      {/* Subtle Footer Spacing */}
      <div className="h-2 sm:h-3 shrink-0" />
    </div>
  );
}
