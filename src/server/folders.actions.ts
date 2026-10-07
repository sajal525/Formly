"use server";

import { revalidatePath } from "next/cache";
import { sql } from "../db";
import { getCurrentUser } from "../lib/auth";

export async function createFolderAction(name: string, color = "blue") {
  const user = await getCurrentUser();
  const trimmed = name.trim().slice(0, 100);

  if (!trimmed) {
    return { success: false, error: "Folder name cannot be empty" };
  }

  try {
    const result = await sql.query(
      `INSERT INTO folders (owner_id, name, color)
       VALUES ($1, $2, $3)
       RETURNING id, name, color`,
      [user.id, trimmed, color]
    );

    revalidatePath("/");
    return { success: true, folder: result[0] };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

export async function renameFolderAction(folderId: string, newName: string) {
  const user = await getCurrentUser();
  const trimmed = newName.trim().slice(0, 100);

  if (!trimmed) {
    return { success: false, error: "Folder name cannot be empty" };
  }

  try {
    await sql.query(
      `UPDATE folders
       SET name = $1, updated_at = NOW()
       WHERE id = $2 AND owner_id = $3 AND deleted_at IS NULL`,
      [trimmed, folderId, user.id]
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to rename folder:", error);
    return { success: false, error: "Failed to rename folder" };
  }
}

export async function deleteFolderAction(folderId: string) {
  const user = await getCurrentUser();

  try {
    // Parity Rule: Deleting a folder unlinks its forms back to Unfiled
    await sql.query(
      `UPDATE forms
       SET folder_id = NULL, updated_at = NOW()
       WHERE folder_id = $1 AND owner_id = $2`,
      [folderId, user.id]
    );

    // Soft delete the folder
    await sql.query(
      `UPDATE folders
       SET deleted_at = NOW()
       WHERE id = $1 AND owner_id = $2`,
      [folderId, user.id]
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}
