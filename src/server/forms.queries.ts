import { sql } from "../db";
import { FormItem } from "../components/recent/FormRow";

export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  sortOrder: string;
  headerColor: string;
  schema: any;
}

export async function getTemplates(): Promise<TemplateRecord[]> {
  try {
    const rows = await sql.query(
      `SELECT id, name, description, sort_order as "sortOrder", header_color as "headerColor", schema
       FROM templates
       WHERE is_active = true
       ORDER BY CAST(sort_order AS INTEGER) ASC`
    );
    return rows as TemplateRecord[];
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function listForms(userId: string): Promise<FormItem[]> {
  try {
    const rows = await sql.query(
      `SELECT 
         f.id, 
         f.title, 
         f.status, 
         f.owner_id as "ownerId",
         u.name as "ownerName",
         f.created_at as "createdAt",
         f.updated_at as "updatedAt",
         fo.last_opened_at as "lastOpenedAt"
       FROM forms f
       LEFT JOIN "user" u ON f.owner_id = u.id
       LEFT JOIN form_opens fo ON f.id = fo.form_id AND fo.user_id = $1
       WHERE f.deleted_at IS NULL AND (f.owner_id = $1)
       ORDER BY COALESCE(fo.last_opened_at, f.updated_at) DESC`,
      [userId]
    );

    return (rows as any[]).map((row) => ({
      id: row.id,
      title: row.title || "Untitled form",
      ownerName: row.ownerName || "Me",
      isOwner: row.ownerId === userId,
      status: (row.status || "draft") as "draft" | "published" | "closed",
      lastOpenedAt: formatRelativeDate(row.lastOpenedAt || row.updatedAt),
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error listing forms:", error);
    return [];
  }
}

export interface OptionData {
  id: string;
  label: string;
  imageUrl?: string | null;
  sortOrder: number;
  isOther: boolean;
  targetSectionId?: string | null;
}

export interface QuestionData {
  id: string;
  sectionId?: string | null;
  title: string;
  description?: string | null;
  type: string;
  isRequired: boolean;
  sortOrder: number;
  config: Record<string, any>;
  validation: Record<string, any>;
  points: number;
  answerKey: Record<string, any>;
  feedback: Record<string, any>;
  isArchived: boolean;
  options: OptionData[];
}

export interface SectionData {
  id: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  afterSectionAction: string;
  targetSectionId?: string | null;
}

export interface FormEditorData {
  id: string;
  title: string;
  description?: string | null;
  folderId?: string | null;
  slug?: string | null;
  status: "draft" | "published" | "closed";
  isStarred: boolean;
  isQuiz: boolean;
  isAcceptingResponses: boolean;
  theme: {
    color: string;
    bgColor?: string;
    font: string;
    mode: "light" | "dark" | "auto";
  };
  settings: Record<string, any>;
  updatedAt: string;
  sections: SectionData[];
  questions: QuestionData[];
  responseCount: number;
}

export async function getFormEditorData(
  formId: string,
  userId: string
): Promise<FormEditorData | null> {
  try {
    // 1. Fetch form
    const formRows = await sql.query(
      `SELECT 
         id, title, description, folder_id as "folderId", slug, status,
         is_starred as "isStarred", is_quiz as "isQuiz", 
         is_accepting_responses as "isAcceptingResponses",
         theme, settings, updated_at as "updatedAt"
       FROM forms
       WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
      [formId, userId]
    );

    if (formRows.length === 0) return null;
    const form = formRows[0] as any;

    // Record open time
    await sql.query(
      `INSERT INTO form_opens (form_id, user_id, last_opened_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (form_id, user_id) DO UPDATE SET last_opened_at = NOW()`,
      [formId, userId]
    );

    // 2. Fetch sections
    let sections = (await sql.query(
      `SELECT id, title, description, sort_order as "sortOrder",
              after_section_action as "afterSectionAction", target_section_id as "targetSectionId"
       FROM form_sections
       WHERE form_id = $1
       ORDER BY sort_order ASC`,
      [formId]
    )) as SectionData[];

    // If no sections exist, bootstrap default section & question
    if (sections.length === 0) {
      const secResult = await sql.query(
        `INSERT INTO form_sections (form_id, title, sort_order)
         VALUES ($1, 'Untitled Section', 0)
         RETURNING id, title, description, sort_order as "sortOrder",
                   after_section_action as "afterSectionAction", target_section_id as "targetSectionId"`,
        [formId]
      );
      const defaultSec = secResult[0] as SectionData;
      sections = [defaultSec];

      const qResult = await sql.query(
        `INSERT INTO form_questions (form_id, section_id, title, type, sort_order)
         VALUES ($1, $2, 'Untitled Question', 'multiple_choice', 0)
         RETURNING id`,
        [formId, defaultSec.id]
      );
      const defaultQId = (qResult[0] as any).id;

      await sql.query(
        `INSERT INTO form_options (question_id, label, sort_order)
         VALUES ($1, 'Option 1', 0)`,
        [defaultQId]
      );
    }

    // 3. Fetch questions
    const questionRows = (await sql.query(
      `SELECT id, section_id as "sectionId", title, description, type,
              is_required as "isRequired", sort_order as "sortOrder",
              config, validation, points, answer_key as "answerKey",
              feedback, is_archived as "isArchived"
       FROM form_questions
       WHERE form_id = $1 AND is_archived = false
       ORDER BY sort_order ASC`,
      [formId]
    )) as any[];

    // 4. Fetch options for all questions
    const optionRows = (await sql.query(
      `SELECT o.id, o.question_id as "questionId", o.label, o.image_url as "imageUrl",
              o.sort_order as "sortOrder", o.is_other as "isOther",
              o.target_section_id as "targetSectionId"
       FROM form_options o
       JOIN form_questions q ON o.question_id = q.id
       WHERE q.form_id = $1
       ORDER BY o.sort_order ASC`,
      [formId]
    )) as any[];

    // Group options by questionId
    const optionsByQ = new Map<string, OptionData[]>();
    for (const opt of optionRows) {
      const list = optionsByQ.get(opt.questionId) || [];
      list.push({
        id: opt.id,
        label: opt.label,
        imageUrl: opt.imageUrl,
        sortOrder: opt.sortOrder,
        isOther: Boolean(opt.isOther),
        targetSectionId: opt.targetSectionId,
      });
      optionsByQ.set(opt.questionId, list);
    }

    const questions: QuestionData[] = questionRows.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      title: q.title || "",
      description: q.description || "",
      type: q.type || "multiple_choice",
      isRequired: Boolean(q.isRequired),
      sortOrder: q.sortOrder || 0,
      config: q.config || {},
      validation: q.validation || {},
      points: q.points || 0,
      answerKey: q.answerKey || {},
      feedback: q.feedback || {},
      isArchived: Boolean(q.isArchived),
      options: optionsByQ.get(q.id) || [],
    }));

    // 5. Response count
    const respCountRows = await sql.query(
      `SELECT COUNT(*)::int as count FROM responses WHERE form_id = $1`,
      [formId]
    );
    const responseCount = (respCountRows[0] as any)?.count || 0;

    return {
      id: form.id,
      title: form.title || "Untitled form",
      description: form.description || "",
      folderId: form.folderId,
      slug: form.slug,
      status: form.status || "draft",
      isStarred: Boolean(form.isStarred),
      isQuiz: Boolean(form.isQuiz),
      isAcceptingResponses: form.isAcceptingResponses ?? true,
      theme: form.theme || { color: "#6366F1", font: "Basic", mode: "dark" },
      settings: form.settings || {},
      updatedAt: form.updatedAt ? new Date(form.updatedAt).toISOString() : new Date().toISOString(),
      sections,
      questions,
      responseCount,
    };
  } catch (error) {
    console.error("Error in getFormEditorData:", error);
    return null;
  }
}
