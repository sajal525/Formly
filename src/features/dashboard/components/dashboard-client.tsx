"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardDataDTO } from "../server/get-dashboard-data";
import { WelcomeHeader } from "./welcome-header";
import { QuickStartCards } from "./quick-start-cards";
import { PopularTemplatesSection } from "./popular-templates";
import { RecentFormsSection } from "./recent-forms";
import { CreateFormModal } from "@/features/forms/components/create-form-modal";
import { CheckCircle2, X } from "lucide-react";

interface DashboardClientProps {
  initialData: DashboardDataDTO;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdToast, setCreatedToast] = useState<string | null>(null);
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);

  async function handleBlankFormDirect() {
    if (isCreatingBlank) return;
    setIsCreatingBlank(true);
    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled form",
        }),
      });
      const data = await res.json();
      if (res.ok && data.form?.id) {
        router.push(`/forms/${data.form.id}/edit`);
        return;
      }
      setIsModalOpen(true);
    } catch {
      setIsModalOpen(true);
    } finally {
      setIsCreatingBlank(false);
    }
  }

  function handleFormCreated(form: { id: string; title: string }) {
    setCreatedToast(`Draft created: "${form.title}" is now in your Recent Forms.`);
    setTimeout(() => {
      setCreatedToast(null);
    }, 6000);
  }

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 sm:gap-4 lg:gap-5 min-h-0">
      {/* Success Notification Toast */}
      {createdToast && (
        <div className="shrink-0 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{createdToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCreatedToast(null)}
            className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace (Full width, no right rail) */}
      <div className="w-full flex-1 flex flex-col justify-between gap-3 sm:gap-4 lg:gap-5 min-h-0">
        <div className="shrink-0">
          <WelcomeHeader
            displayName={initialData.user.displayName}
            onCreateClick={() => setIsModalOpen(true)}
          />
        </div>

        <div className="shrink-0">
          <QuickStartCards
            onBlankFormClick={handleBlankFormDirect}
          />
        </div>

        <div className="shrink-0">
          <PopularTemplatesSection />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <RecentFormsSection
            forms={initialData.recentForms}
            onCreateClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Create Blank Form Modal */}
      <CreateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleFormCreated}
      />
    </div>
  );
}
