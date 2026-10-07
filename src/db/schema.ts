import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
  primaryKey,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const formStatus = pgEnum("form_status", ["draft", "published", "closed"]);
export const collabRole = pgEnum("collab_role", ["editor", "viewer"]);
export const questionTypeEnum = pgEnum("question_type", [
  "short_answer",
  "paragraph",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "linear_scale",
  "rating",
  "multiple_choice_grid",
  "checkbox_grid",
  "date",
  "time",
  "file_upload",
  "number",
  "email",
  "url",
  "title_description",
  "image",
  "video",
]);

// Users
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  prefs: jsonb("prefs").notNull().default(sql`'{"view":"list","hideTemplates":false}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Folders
export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("blue"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("folders_owner_idx").on(t.ownerId)]
);

// Templates (Full Parity)
export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("Work"), // Personal, Work, Education, Events
  sortOrder: text("sort_order").notNull().default("0"),
  headerColor: text("header_color").notNull().default("#6366F1"),
  schema: jsonb("schema").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Forms
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
    title: text("title").notNull().default("Untitled form"),
    description: text("description"),
    slug: text("slug").unique(),
    schema: jsonb("schema").notNull().default(sql`'{"questions":[]}'::jsonb`),
    status: formStatus("status").notNull().default("draft"),
    isStarred: boolean("is_starred").notNull().default(false),
    isQuiz: boolean("is_quiz").notNull().default(false),
    isAcceptingResponses: boolean("is_accepting_responses").notNull().default(true),
    theme: jsonb("theme").notNull().default(sql`'{"color":"#6366F1","font":"Basic","mode":"dark"}'::jsonb`),
    settings: jsonb("settings").notNull().default(
      sql`'{"limitOneResponse":false,"collectEmail":"Off","confirmationMessage":"Your response has been recorded."}'::jsonb`
    ),
    templateId: text("template_id").references(() => templates.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("forms_owner_updated_idx").on(t.ownerId, t.updatedAt.desc()),
    index("forms_owner_deleted_idx").on(t.ownerId, t.deletedAt),
    index("forms_folder_idx").on(t.folderId),
  ]
);

// Sections (Multi-page forms)
export const formSections = pgTable(
  "form_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled Section"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    afterSectionAction: text("after_section_action").notNull().default("continue"), // continue | submit | goto
    targetSectionId: uuid("target_section_id"),
  },
  (t) => [index("sections_form_sort_idx").on(t.formId, t.sortOrder)]
);

// Questions
export const formQuestions = pgTable(
  "form_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id").references(() => formSections.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    description: text("description"),
    type: questionTypeEnum("type").notNull().default("multiple_choice"),
    isRequired: boolean("is_required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    config: jsonb("config").notNull().default(sql`'{}'::jsonb`), // scale range, rating icons, grid rows/cols
    validation: jsonb("validation").notNull().default(sql`'{}'::jsonb`), // regex, min/max, number rules
    points: integer("points").notNull().default(0),
    answerKey: jsonb("answer_key").notNull().default(sql`'{}'::jsonb`),
    feedback: jsonb("feedback").notNull().default(sql`'{}'::jsonb`),
    isArchived: boolean("is_archived").notNull().default(false),
  },
  (t) => [index("questions_form_sort_idx").on(t.formId, t.sortOrder)]
);

// Options (Multiple choice, checkboxes, dropdown, grid)
export const formOptions = pgTable(
  "form_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").notNull().references(() => formQuestions.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Option"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isOther: boolean("is_other").notNull().default(false),
    targetSectionId: uuid("target_section_id"),
  },
  (t) => [index("options_question_sort_idx").on(t.questionId, t.sortOrder)]
);

// Form Opens (Per-user last opened timestamps)
export const formOpens = pgTable(
  "form_opens",
  {
    formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.formId, t.userId] }),
    index("form_opens_user_idx").on(t.userId, t.lastOpenedAt.desc()),
  ]
);

// Form Collaborators
export const formCollaborators = pgTable(
  "form_collaborators",
  {
    formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: collabRole("role").notNull().default("viewer"),
  },
  (t) => [primaryKey({ columns: [t.formId, t.userId] })]
);

// Submissions (Responses)
export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
    respondentEmail: text("respondent_email"),
    score: integer("score"),
    maxScore: integer("max_score"),
    isGraded: boolean("is_graded").notNull().default(false),
    editToken: text("edit_token"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("responses_form_submitted_idx").on(t.formId, t.submittedAt.desc())]
);

// Response Answers
export const responseAnswers = pgTable(
  "response_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull().references(() => formQuestions.id, { onDelete: "cascade" }),
    value: jsonb("value").notNull(),
    pointsAwarded: integer("points_awarded"),
    feedback: text("feedback"),
  },
  (t) => [index("answers_response_question_idx").on(t.responseId, t.questionId)]
);

// Short Links
export const shortLinks = pgTable("short_links", {
  code: text("code").primaryKey(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Personal API Keys
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  scopes: jsonb("scopes").notNull().default(sql`'["read:forms","read:responses"]'::jsonb`),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
