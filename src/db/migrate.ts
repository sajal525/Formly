import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Applying Formly Complete Parity Schema Migration to Neon Postgres...");

  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

  // Create Enums if not exist
  await sql`
    DO $$ BEGIN
      CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE collab_role AS ENUM ('editor', 'viewer');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE question_type AS ENUM (
        'short_answer', 'paragraph', 'multiple_choice', 'checkboxes', 'dropdown',
        'linear_scale', 'rating', 'multiple_choice_grid', 'checkbox_grid',
        'date', 'time', 'file_upload', 'number', 'email', 'url',
        'title_description', 'image', 'video'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // Folders table
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'blue',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS folders_owner_idx ON folders(owner_id);`;

  // Alter Forms table with parity columns
  await sql`
    ALTER TABLE forms
    ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_accepting_responses BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS theme JSONB NOT NULL DEFAULT '{"color":"#6366F1","font":"Basic","mode":"dark"}'::jsonb,
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{"limitOneResponse":false,"collectEmail":"Off","confirmationMessage":"Your response has been recorded."}'::jsonb;
  `;
  await sql`CREATE INDEX IF NOT EXISTS forms_folder_idx ON forms(folder_id);`;

  // Form Sections table
  await sql`
    CREATE TABLE IF NOT EXISTS form_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Untitled Section',
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      after_section_action TEXT NOT NULL DEFAULT 'continue',
      target_section_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS sections_form_sort_idx ON form_sections(form_id, sort_order);`;

  // Form Questions table
  await sql`
    CREATE TABLE IF NOT EXISTS form_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      section_id UUID REFERENCES form_sections(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT '',
      description TEXT,
      type question_type NOT NULL DEFAULT 'multiple_choice',
      is_required BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0,
      config JSONB NOT NULL DEFAULT '{}'::jsonb,
      validation JSONB NOT NULL DEFAULT '{}'::jsonb,
      points INTEGER NOT NULL DEFAULT 0,
      answer_key JSONB NOT NULL DEFAULT '{}'::jsonb,
      feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_archived BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS questions_form_sort_idx ON form_questions(form_id, sort_order);`;

  // Form Options table
  await sql`
    CREATE TABLE IF NOT EXISTS form_options (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
      label TEXT NOT NULL DEFAULT 'Option',
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_other BOOLEAN NOT NULL DEFAULT false,
      target_section_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS options_question_sort_idx ON form_options(question_id, sort_order);`;

  // Responses table
  await sql`
    CREATE TABLE IF NOT EXISTS responses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      respondent_email TEXT,
      score INTEGER,
      max_score INTEGER,
      is_graded BOOLEAN NOT NULL DEFAULT false,
      edit_token TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS responses_form_submitted_idx ON responses(form_id, submitted_at DESC);`;

  // Response Answers table
  await sql`
    CREATE TABLE IF NOT EXISTS response_answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
      value JSONB NOT NULL,
      points_awarded INTEGER,
      feedback TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS answers_response_question_idx ON response_answers(response_id, question_id);`;

  // Short Links table
  await sql`
    CREATE TABLE IF NOT EXISTS short_links (
      code TEXT PRIMARY KEY,
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Webhooks table
  await sql`
    CREATE TABLE IF NOT EXISTS webhooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      secret TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // API Keys table
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      scopes JSONB NOT NULL DEFAULT '["read:forms","read:responses"]'::jsonb,
      last_used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Ensure category exists on templates
  await sql`
    ALTER TABLE templates
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Work';
  `;

  console.log("Formly Parity Schema Migration applied successfully!");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
