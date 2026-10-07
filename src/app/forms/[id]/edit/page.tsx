import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "../../../../lib/auth";
import { getFormEditorData } from "../../../../server/forms.queries";
import { getFolders } from "../../../../server/folders.queries";
import { FormEditorClient } from "../../../../components/editor/FormEditorClient";

export const dynamic = "force-dynamic";

interface FormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormEditPage({ params }: FormEditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [formData, folders] = await Promise.all([
    getFormEditorData(id, user.id),
    getFolders(user.id),
  ]);

  if (!formData) {
    notFound();
  }

  return <FormEditorClient initialData={formData} folders={folders} />;
}

