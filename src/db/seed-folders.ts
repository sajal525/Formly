import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seedFolders() {
  console.log("Seeding initial dashboard folders in Neon Postgres...");

  const userRows = await sql.query(`SELECT id FROM "user" LIMIT 1`);
  if (userRows.length === 0) {
    console.error("No user found to associate folders with.");
    return;
  }
  const userId = (userRows[0] as any).id;

  const foldersToSeed = [
    { name: "College", color: "blue" },
    { name: "Assignment", color: "blue" },
    { name: "Class Feedback", color: "blue" },
    { name: "Suggestion", color: "blue" },
  ];

  for (const f of foldersToSeed) {
    await sql.query(
      `INSERT INTO folders (owner_id, name, color)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM folders WHERE owner_id = $1 AND name = $2 AND deleted_at IS NULL
       )`,
      [userId, f.name, f.color]
    );
  }

  const allFolders = await sql.query(`SELECT id, name, color FROM folders WHERE owner_id = $1`, [userId]);
  console.log("Seeded folders:", allFolders);
}

seedFolders().catch(console.error);
