import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { getFormDraft } from "@/features/builder/server/get-form-draft";
import { BuilderShell } from "@/features/builder/components/builder-shell";

interface FormEditPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export async function generateMetadata({
  params,
}: FormEditPageProps): Promise<Metadata> {
  const { formId } = await params;
  return {
    title: `Edit Form | Formly`,
    description: "Design, configure questions, and publish your form with Formly.",
  };
}

export default async function FormEditPage({ params }: FormEditPageProps) {
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

  // Get user profile for display name
  const userProfile = await prisma.profile.findUnique({
    where: { userId: sessionData.user.id },
    select: { displayName: true },
  });

  const userDTO = {
    id: sessionData.user.id,
    username: sessionData.user.username || sessionData.user.name || "Creator",
    displayName:
      userProfile?.displayName ||
      sessionData.user.name ||
      sessionData.user.username ||
      "Creator",
  };

  return <BuilderShell initialDraft={draft} user={userDTO} />;
}
