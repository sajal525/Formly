import React from "react";
import { RegistrationHeader } from "./registration-header";
import { RegistrationHero } from "./registration-hero";
import { RegistrationForm } from "./registration-form";

export function RegistrationPage() {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden lg:overflow-hidden bg-[#FAFAFA] dark:bg-[#090A0B] text-zinc-900 dark:text-zinc-100 transition-colors">
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
