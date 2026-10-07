"use server";

import { revalidatePath } from "next/cache";
import { sql } from "../db";
import { getCurrentUser } from "../lib/auth";

export async function createFormAction(templateId?: string) {
  const user = await getCurrentUser();

  let title = "Untitled form";
  let formSchema = JSON.stringify({ questions: [] });

  if (templateId) {
    const tplRows = await sql.query(
      `SELECT name, schema FROM templates WHERE id = $1 AND is_active = true`,
      [templateId]
    );
    if (tplRows.length > 0) {
      title = (tplRows[0] as any).name;
      formSchema = JSON.stringify((tplRows[0] as any).schema);
    }
  }

  const result = await sql.query(
    `INSERT INTO forms (owner_id, title, schema, template_id, status)
     VALUES ($1, $2, $3::jsonb, $4, 'draft')
     RETURNING id`,
    [user.id, title, formSchema, templateId || null]
  );

  const formId = (result[0] as any).id;

  // Insert into form_opens
  await sql.query(
    `INSERT INTO form_opens (form_id, user_id, last_opened_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (form_id, user_id) DO UPDATE SET last_opened_at = NOW()`,
    [formId, user.id]
  );

  revalidatePath("/");
  return { success: true, formId };
}

export async function renameFormAction(formId: string, newTitle: string) {
  const user = await getCurrentUser();
  const trimmed = newTitle.trim().slice(0, 120);

  if (!trimmed) {
    return { success: false, error: "Title cannot be empty" };
  }

  await sql.query(
    `UPDATE forms
     SET title = $1, updated_at = NOW()
     WHERE id = $2 AND owner_id = $3 AND deleted_at IS NULL`,
    [trimmed, formId, user.id]
  );

  revalidatePath("/");
  return { success: true };
}

export async function duplicateFormAction(formId: string) {
  const user = await getCurrentUser();

  const original = await sql.query(
    `SELECT title, description, schema, template_id
     FROM forms
     WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [formId, user.id]
  );

  if (original.length === 0) {
    return { success: false, error: "Form not found" };
  }

  const row = original[0] as any;
  const newTitle = `Copy of ${row.title}`;

  const result = await sql.query(
    `INSERT INTO forms (owner_id, title, description, schema, template_id, status)
     VALUES ($1, $2, $3, $4::jsonb, $5, 'draft')
     RETURNING id`,
    [user.id, newTitle, row.description, JSON.stringify(row.schema), row.template_id]
  );

  const newId = (result[0] as any).id;

  await sql.query(
    `INSERT INTO form_opens (form_id, user_id, last_opened_at)
     VALUES ($1, $2, NOW())`,
    [newId, user.id]
  );

  revalidatePath("/");
  return { success: true, formId: newId };
}

export async function deleteFormAction(formId: string) {
  const user = await getCurrentUser();

  await sql.query(
    `UPDATE forms
     SET deleted_at = NOW()
     WHERE id = $1 AND owner_id = $2`,
    [formId, user.id]
  );

  revalidatePath("/");
  return { success: true };
}
