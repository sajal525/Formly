import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth-dal";
import { getFormDraft } from "@/features/builder/server/get-form-draft";
import { StandalonePreviewShell } from "./standalone-preview-shell";

interface StandalonePreviewPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export async function generateMetadata({
  params,
}: StandalonePreviewPageProps): Promise<Metadata> {
  const { formId } = await params;
  return {
    title: `Preview Form | Formly`,
    description: "Preview respondent view in Formly.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function StandalonePreviewPage({
  params,
}: StandalonePreviewPageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    redirect("/login");
  }

  const { formId } = await params;
  if (!formId) {
    notFound();
  }

  const draft = await getFormDraft(sessionData.user.id, formId);

  if (!draft) {
    notFound();
  }

  return <StandalonePreviewShell draft={draft} />;
}
