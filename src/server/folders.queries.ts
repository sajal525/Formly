import { sql } from "../db";

export interface FolderRecord {
  id: string;
  name: string;
  color: string;
  formCount: number;
}

export async function getFolders(userId: string): Promise<FolderRecord[]> {
  try {
    const rows = await sql.query(
      `SELECT 
         f.id, 
         f.name, 
         f.color, 
         COUNT(fm.id)::int as "formCount"
       FROM folders f
       LEFT JOIN forms fm ON f.id = fm.folder_id AND fm.deleted_at IS NULL
       WHERE f.owner_id = $1 AND f.deleted_at IS NULL
       GROUP BY f.id, f.name, f.color, f.created_at
       ORDER BY f.created_at ASC`,
      [userId]
    );
    return rows as FolderRecord[];
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
}
