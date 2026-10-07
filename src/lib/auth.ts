import { sql } from "../db";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export const DEMO_USER: CurrentUser = {
  id: "usr_demo",
  name: "Sajal Jaiswal",
  email: "sajaljaiswal525@gmail.com",
  image: null,
};

export async function getCurrentUser(): Promise<CurrentUser> {
  // In development, ensure demo user exists in DB
  try {
    await sql.query(
      `INSERT INTO "user" (id, name, email, email_verified, prefs)
       VALUES ($1, $2, $3, true, '{"view":"list","hideTemplates":false}')
       ON CONFLICT (id) DO NOTHING`,
      [DEMO_USER.id, DEMO_USER.name, DEMO_USER.email]
    );
  } catch (err) {
    // ignore if already seeded or error
  }

  return DEMO_USER;
}
