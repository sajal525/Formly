import React from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "../../../../lib/auth";
import { getFormEditorData } from "../../../../server/forms.queries";
import { FormPreviewClient } from "../../../../components/preview/FormPreviewClient";

export const dynamic = "force-dynamic";

interface FormPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormPreviewPage({ params }: FormPreviewPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const formData = await getFormEditorData(id, user.id);

  if (!formData) {
    notFound();
  }

  return <FormPreviewClient formData={formData} />;
}
