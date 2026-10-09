import React from "react";
import { notFound } from "next/navigation";
import { getPublicFormData } from "@/features/responses/server/public-form-service";
import { PublicRespondentForm } from "@/features/responses/components/public-respondent-form";
import { Metadata } from "next";
import { Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PublicFormPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
  const { formId } = await params;
  const form = await getPublicFormData(formId);

  if (!form) {
    return {
      title: "Form Unavailable | Formly",
      description: "This form is unavailable or not accepting submissions.",
    };
  }

  return {
    title: `${form.title} | Formly`,
    description: form.description || "Submit your response on Formly.",
  };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { formId } = await params;
  if (!formId) {
    notFound();
  }

  const form = await getPublicFormData(formId);

  if (!form) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Form Unavailable
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            This form is either a draft, archived, closed, or does not exist.
          </p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Go to Formly
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <PublicRespondentForm form={form} />;
}
