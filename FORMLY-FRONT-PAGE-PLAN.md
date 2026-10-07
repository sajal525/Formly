# Formly: Front Page (Forms Home) Build Plan

> **For the AI agent (Antigravity):** Read this file fully before writing any code. Also read `DESIGN.md` (the Genesis design system) in the repo root. Build ONLY what is described here. Do not build the form editor, responses page, or public form-fill page. Create stub routes for them only where this plan says so.
> Work milestone by milestone (Section 15). After each milestone, run the checks listed and stop if any fail.

---

## 1. Scope

**"Front page" = the signed-in home screen at `/`** (the page a user lands on after login). It contains:

1. Top navigation bar (logo, global search, theme toggle, user menu)
2. "Start a new form" section (blank form card + 5 template cards)
3. "Recent forms" section (toolbar + list/grid of the user's forms)
4. States: loading, empty, no search results, error

**Logged-out visitors** hitting `/` are redirected to `/sign-in` (a minimal sign-in page with "Continue with Google" is included as a dependency, nothing more).

### Out of scope (do NOT build)
- Form editor / question builder
- Responses / analytics
- Public form-filling page
- Sharing UI and folders (database tables for sharing are created now; UI is not)
- Billing, teams, notifications

### Legal / branding note
The reference screenshot is Google Forms. **Do not copy** Google's logo, multicolor plus icon, template thumbnail photos, or any Google wording that is trademarked. Use Formly's own logo, Genesis colors, and CSS-drawn template previews (Section 6.4).

---

## 2. Tech Stack (fixed, do not substitute)

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS variables for Genesis tokens |
| Database | **Neon Postgres** (serverless) |
| DB driver | `@neondatabase/serverless` |
| ORM / migrations | Drizzle ORM + drizzle-kit |
| Auth | Better Auth (Google OAuth) with Drizzle adapter, sessions stored in Neon |
| Validation | Zod |
| Data fetching | React Server Components for first load; Server Actions for mutations; TanStack Query only for search/sort/pagination on the client list |
| Icons | `lucide-react` |
| Command palette | `cmdk` |
| Menus / dialogs | Radix UI primitives (`@radix-ui/react-dropdown-menu`, `react-dialog`, `react-tooltip`) |
| Fonts | General Sans (Fontshare), DM Sans + JetBrains Mono (`next/font/google`) |
| Tests | Vitest (unit), Playwright (e2e) |
| Package manager | pnpm |

---

## 3. Design Tokens (from Genesis `DESIGN.md`)

Define in `src/app/globals.css` as CSS variables, with a dark-mode override.

```css
:root {
  --primary: #6366F1;
  --primary-hover: #4F46E5;
  --neutral: #9C9C9C;
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --bg-alt: #F3F3F5;          /* nav link hover, list row hover */
  --text: #0A0A0A;
  --text-secondary: #6B6B6B;
  --border: #E8E8EC;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --ring: 0 0 0 3px rgba(99,102,241,0.12);
  --shadow-card-hover: 0 8px 30px rgba(0,0,0,0.08);
}
:root[data-theme="dark"] {
  --bg: #0B0B0D;
  --surface: #141417;
  --bg-alt: #1C1C20;
  --text: #F4F4F5;
  --text-secondary: #A1A1AA;
  --border: #26262B;
  --neutral: #71717A;
}
```

Rules to enforce (from Genesis Do's and Don'ts):
- Indigo only on interactive elements (links, focus, active chips, buttons). Never decorative.
- Never `#000` or `#FFF` for text.
- General Sans (bold, letter-spacing -0.03em) for headings and the wordmark; DM Sans for everything else.
- Max two font weights on the screen: **400 and 500** for DM Sans, **700** for General Sans headings. (That is three numbers, but only two weights per font family in use; keep body to 400/500 only.)
- 4px spacing grid only (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- Cards: 12px radius, 1px border, flat. Hover = lift -2px + shadow, 200ms.
- Buttons and inputs: 6px radius.
- No decorative gradients or illustrations. The Genesis "interactive dot grid" is NOT used on this page.
- **Secondary green (#20970B) is not used anywhere in Formly.**
- **Only one filled-indigo primary button per view section.** This page has none by default; the "Blank form" card is the primary action.
- Page container: max-width 1280px, 24px horizontal padding.

Type scale used on this page: Section heading 24px (General Sans bold), Body 15px, Small 13px, Caption 12px, Overline 11px.

---

## 4. Folder Structure

```
formly/
├─ DESIGN.md                      # Genesis file (copy of genesis-DESIGN.md)
├─ FORMLY-FRONT-PAGE-PLAN.md      # this file
├─ drizzle.config.ts
├─ .env.local / .env.example
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               # fonts, theme script, providers
│  │  ├─ globals.css
│  │  ├─ page.tsx                 # FRONT PAGE (server component)
│  │  ├─ loading.tsx              # skeleton for front page
│  │  ├─ error.tsx
│  │  ├─ (auth)/sign-in/page.tsx
│  │  ├─ api/auth/[...all]/route.ts
│  │  ├─ api/forms/route.ts       # GET list (search/sort/filter/cursor)
│  │  ├─ forms/[id]/edit/page.tsx # STUB: "Editor coming soon"
│  │  ├─ templates/page.tsx       # STUB: "Template gallery coming soon"
│  │  └─ settings/page.tsx        # STUB
│  ├─ components/
│  │  ├─ nav/TopNav.tsx, SearchBar.tsx, CommandPalette.tsx, UserMenu.tsx, ThemeToggle.tsx, Logo.tsx
│  │  ├─ start/StartSection.tsx, BlankFormCard.tsx, TemplateCard.tsx, TemplatePreview.tsx
│  │  ├─ recent/RecentSection.tsx, RecentToolbar.tsx, OwnerFilter.tsx, SortMenu.tsx, ViewToggle.tsx
│  │  ├─ recent/FormList.tsx, FormRow.tsx, FormGridCard.tsx, FormRowMenu.tsx
│  │  ├─ recent/EmptyState.tsx, NoResults.tsx, ListSkeleton.tsx
│  │  └─ ui/Button.tsx, Chip.tsx, Dialog.tsx, Toast.tsx, Skeleton.tsx
│  ├─ db/
│  │  ├─ index.ts                 # Neon + Drizzle client
│  │  ├─ schema.ts
│  │  ├─ seed-templates.ts
│  │  └─ migrations/
│  ├─ lib/
│  │  ├─ auth.ts, auth-client.ts, session.ts
│  │  ├─ validators.ts            # Zod schemas
│  │  ├─ rate-limit.ts
│  │  └─ format.ts                # relative dates
│  ├─ server/
│  │  ├─ forms.queries.ts         # reads
│  │  └─ forms.actions.ts         # "use server" mutations
│  └─ types/
└─ tests/ (unit + e2e)
```

---

## 5. Page Layout (desktop ≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ TopNav (sticky, 56px, backdrop-blur, 1px bottom border)      │
│ [≡?] Logo Formly    [ Search forms…        ⌘K ]   ☾  (avatar)│
├──────────────────────────────────────────────────────────────┤
│ START SECTION  (background: --bg-alt band, full width)       │
│  "Start a new form"                  Template gallery ⇅  ⋮   │
│  [Blank] [Contact] [RSVP] [Party] [T-Shirt] [Event Reg.]     │
├──────────────────────────────────────────────────────────────┤
│ RECENT SECTION (background: --bg)                            │
│  "Recent forms"        Owned by anyone ▾   ☰/▦   A↕Z         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ form rows OR empty state                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

Vertical spacing: Start section padding 24px top / 32px bottom; Recent section padding 32px top; gap between heading row and content 16px.

---

## 6. Components (detailed specs)

### 6.1 TopNav
- Height 56px, `position: sticky; top: 0; z-index: 40`, background `color-mix(in srgb, var(--surface) 80%, transparent)` + `backdrop-filter: blur(12px)`, border-bottom 1px `--border`. No shadow.
- Left: Logo (Formly wordmark in General Sans bold, -0.03em, 20px, plus a simple monochrome icon you draw as inline SVG, a rounded square with two horizontal lines; use `--text` color, not indigo, as it is static).
- Center: `SearchBar` (max-width 640px, flex-1, 12px radius, 40px tall, `--bg-alt` background, magnifier icon left, placeholder "Search forms", `⌘K` badge right (shows `Ctrl K` on Windows/Linux). Clicking or pressing ⌘K/Ctrl+K opens `CommandPalette`.
- Right: ThemeToggle (ghost icon button 36px, sun/moon), UserMenu (36px circular avatar; image from Google profile, fallback initials).
- UserMenu (Radix dropdown, shadow-lg, 8px radius): name + email (non-clickable header), "Settings" (→ `/settings`), "Sign out".
- Mobile (<768px): search bar collapses to an icon button that opens the palette full-screen; logo stays left.

### 6.2 CommandPalette (⌘K)
- `cmdk` dialog, centered, 560px wide, 12px radius.
- Searches the user's forms (debounced 200ms, calls `/api/forms?q=`), shows max 8 results with title + "Edited {relative}".
- Static group "Actions": "Create blank form", plus each template by name.
- Enter on a form → `/forms/{id}/edit`. Esc closes. Focus is trapped; return focus to trigger on close.

### 6.3 StartSection
- Background `--bg-alt`, full-bleed; inner container 1280px.
- Header row: `<h2>` "Start a new form" (General Sans bold 24px). Right side: button "Template gallery" (secondary style, small, chevron up/down icon) and a kebab icon button.
  - **Template gallery button** toggles collapsing the cards row (animation 200ms height). State saved in `users.prefs.hideTemplates` via server action (optimistic).
  - **Kebab menu**: "Settings" (→ `/settings`), "Help" (opens `/help`, 404-safe stub or external link placeholder).
- Cards row: horizontal flex, gap 20px, `overflow-x: auto` with scroll-snap on mobile. Card width 172px.
- Each card = `<button>` or `<form action>` (Server Action) so it works without JS. Under the preview: label 14px DM Sans medium.

#### BlankFormCard
- Preview area 172×130, white surface, 1px border, 12px radius. Centered 32px "plus" icon in **`--text-secondary`** (not multicolor; it is Formly's own style). Hover: border `--primary`, lift -2px, shadow.
- Click → server action `createForm({ templateId: null })` → redirect to `/forms/{id}/edit`.
- Pending state: card shows spinner, ignores further clicks (prevent double create).

#### TemplateCard
- Same size/behaviour. Preview area renders `TemplatePreview` (6.4). Label below = template name.
- Click → `createForm({ templateId })` → copies template questions into a new form → redirect.

### 6.4 TemplatePreview (CSS-drawn, no images)
- Takes the template's `schema` JSON and draws a miniature form: a header bar (3px `--primary`-free: use `--border` color, because indigo is interactive only), a title line, then up to 3 mini question blocks made of gray skeleton lines (`--border` and `--bg-alt`). Radio/checkbox questions draw tiny circles/squares.
- Pure presentational, `aria-hidden="true"`. Card has `aria-label="Create form from {name} template"`.

### 6.5 RecentSection
- Header row: `<h2>` "Recent forms" left. Right toolbar (`RecentToolbar`):
  - **OwnerFilter** (dropdown button): "Owned by anyone" (default), "Owned by me", "Not owned by me". Value stored in URL query `?owner=any|me|others`.
  - **ViewToggle**: list ↔ grid icons. Persisted in `users.prefs.view` ("list" | "grid").
  - **SortMenu** (A-Z icon): "Last opened by me" (default), "Last modified", "Title (A to Z)", "Title (Z to A)". URL query `?sort=opened|modified|title_asc|title_desc`.
  - (Folder icon from the reference is **omitted** in v1.)
- Content container: surface background, 1px border, 12px radius.

### 6.6 FormList (list view)
- Rows: flex space-between, padding 12px 16px, 1px divider between rows, hover `--bg-alt`.
- Row content left to right: form-type icon (24px, gray), title (15px medium, truncate), owner ("Me" or owner name, 13px secondary), "Opened {relative date}" (13px secondary), status chip (Published = green, Draft = gray, Closed = red; pill shape per Genesis), kebab menu.
- Whole row is a link to `/forms/{id}/edit`; kebab button stops propagation.
- **FormRowMenu** (Radix dropdown): Rename (opens Dialog with input), Duplicate, Copy link (only if published), Remove (soft delete, destructive red text, confirm Dialog).
- Keyboard: Tab to row, Enter opens, kebab reachable by Tab, menu with arrow keys.

### 6.7 Grid view (FormGridCard)
- Responsive grid: 1 col (<640), 2 (640+), 3 (900+), 4 (1200+); gap 20px.
- Card: preview area 120px (reuse `TemplatePreview` using the form's first questions), below: title, "Opened {date}", chip, kebab. Same hover lift.

### 6.8 States
| State | Behaviour |
|---|---|
| Initial load | `loading.tsx` shows skeleton: 6 template-card skeletons + 5 row skeletons (shimmer 1.4s, disabled when `prefers-reduced-motion`) |
| Empty (0 forms ever) | Centered in container, padding 48px: heading "No forms yet" (18px medium) + text "Select a blank form or choose another template above to get started". No button (keeps "one primary" rule). |
| No results (filters/search return 0 but user has forms) | "No forms match your filters" + ghost button "Clear filters" |
| Loading more | "Load more" ghost button at bottom, or infinite scroll with IntersectionObserver (use button as fallback) |
| Error | Inline card with error text and secondary button "Try again" (refetch). Toast for mutation errors |
| Offline | Toast "You are offline", disable create cards |

### 6.9 Toasts
Bottom-left, 4s auto-dismiss, `role="status"`. Used for: "Form created", "Renamed", "Duplicated", "Moved to trash" (with Undo for 8s, restores soft-delete).

---

## 7. Database (Neon Postgres + Drizzle)

### 7.1 Setup
1. Create Neon project `formly`, region closest to users, Postgres 16+.
2. Create two branches: `main` (production) and `dev` (development). Use `dev` locally.
3. Use the **pooled** connection string (host contains `-pooler`) for the app at runtime. Use the **direct** (non-pooled) string for migrations.
4. `src/db/index.ts`:
```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
```
Note: `neon-http` does not support interactive transactions. If a transaction is needed (e.g. duplicate form), use `drizzle-orm/neon-serverless` with `Pool` for that action, or make the operation a single SQL statement/batch.

### 7.2 Schema (`src/db/schema.ts`)
Better Auth manages its own tables (`user`, `session`, `account`, `verification`). Generate them with the Better Auth CLI and keep them in this schema. The `user` table needs one extra column `prefs jsonb default '{}'` (store `{ view, hideTemplates }`).

```ts
import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index, primaryKey, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const formStatus = pgEnum("form_status", ["draft", "published", "closed"]);
export const collabRole = pgEnum("collab_role", ["editor", "viewer"]);

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),               // 'contact-information', 'rsvp', ...
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: text("sort_order").notNull().default("0"),
  schema: jsonb("schema").notNull(),         // { title, description, questions: [...] }
  isActive: boolean("is_active").notNull().default(true),
});

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),       // FK -> user.id (Better Auth), onDelete cascade
  title: text("title").notNull().default("Untitled form"),
  description: text("description"),
  schema: jsonb("schema").notNull().default(sql`'{"questions":[]}'::jsonb`),
  status: formStatus("status").notNull().default("draft"),
  templateId: text("template_id"),           // FK -> templates.id, onDelete set null
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),   // soft delete
}, (t) => [
  index("forms_owner_updated_idx").on(t.ownerId, t.updatedAt.desc()),
  index("forms_owner_deleted_idx").on(t.ownerId, t.deletedAt),
]);

// per-user "last opened" (a form can be opened by several people)
export const formOpens = pgTable("form_opens", {
  formId: uuid("form_id").notNull(),         // FK -> forms.id cascade
  userId: text("user_id").notNull(),         // FK -> user.id cascade
  lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.formId, t.userId] }),
  index("form_opens_user_idx").on(t.userId, t.lastOpenedAt.desc()),
]);

// created now so "Owned by anyone / not by me" works later. No UI yet.
export const formCollaborators = pgTable("form_collaborators", {
  formId: uuid("form_id").notNull(),
  userId: text("user_id").notNull(),
  role: collabRole("role").notNull().default("viewer"),
}, (t) => [primaryKey({ columns: [t.formId, t.userId] })]);
```
Add explicit foreign keys with `.references()` in the real file. Enable the `pg_trgm` extension and add `CREATE INDEX forms_title_trgm ON forms USING gin (title gin_trgm_ops);` in a custom migration for fast `ILIKE` search.

### 7.3 Template schema shape (JSON)
```json
{
  "title": "RSVP",
  "description": "Let us know if you can make it.",
  "questions": [
    { "id": "q1", "type": "short_text", "label": "Name", "required": true },
    { "id": "q2", "type": "single_choice", "label": "Can you attend?", "required": true, "options": ["Yes", "No", "Maybe"] },
    { "id": "q3", "type": "number", "label": "Number of guests", "required": false }
  ]
}
```
Allowed `type` values (v1): `short_text`, `long_text`, `single_choice`, `multi_choice`, `dropdown`, `number`, `email`, `date`.

### 7.4 Seed templates (`seed-templates.ts`, idempotent upsert)
1. `contact-information`: Name, Email, Address, Phone
2. `rsvp`: Name, Can you attend? (Yes/No/Maybe), Number of guests, Dietary notes
3. `party-invite`: Name, Can you attend?, What will you bring? (multi_choice), Message to host
4. `t-shirt-sign-up`: Name, Email, T-shirt size (single_choice S/M/L/XL/XXL)
5. `event-registration`: Name, Email, Organization, Sessions to attend (multi_choice), Questions for organizers

Write original copy for all questions. Seed must be runnable repeatedly (`onConflictDoUpdate`).

### 7.5 Queries (`forms.queries.ts`)
`listForms({ userId, q, owner, sort, cursor, limit = 24 })`:
- Base: forms where `deleted_at IS NULL` and (`owner_id = userId` OR id in collaborators for userId).
- `owner=me` → `owner_id = userId`; `owner=others` → shared-with-me only; `owner=any` → both.
- `q` → `title ILIKE '%' || q || '%'` (escape `%`, `_`, `\`).
- Join `form_opens` (left) for `last_opened_at`; default sort `COALESCE(last_opened_at, created_at) DESC`.
- Cursor pagination using `(sort_value, id)` keyset, not OFFSET. Return `{ items, nextCursor }`.
- Select only needed columns (no full `schema` for list view; for grid previews return first 3 questions via `jsonb_path_query` or a separate `previewQuestions` computed in SQL).
- Response item shape: `{ id, title, status, ownerName, isOwner, lastOpenedAt, updatedAt, preview }`.

`getTemplates()` → active templates ordered by `sort_order` (cache with `unstable_cache`, tag `templates`, revalidate 1 hour).

### 7.6 Mutations (`forms.actions.ts`, all `"use server"`)
Every action: (1) get session, throw/redirect if none, (2) validate input with Zod, (3) rate-limit, (4) enforce ownership in the SQL `WHERE`, (5) `revalidatePath("/")`.

| Action | Input | Behaviour |
|---|---|---|
| `createForm` | `{ templateId?: string }` | Insert form with template schema/title (or blank "Untitled form"), insert `form_opens`, redirect `/forms/{id}/edit` |
| `renameForm` | `{ id, title }` (1–120 chars, trimmed) | Update title + `updated_at` where owner |
| `duplicateForm` | `{ id }` | Copy row as "Copy of {title}", status draft |
| `trashForm` | `{ id }` | Set `deleted_at = now()` |
| `restoreForm` | `{ id }` | Set `deleted_at = null` (Undo) |
| `setPrefs` | `{ view?, hideTemplates? }` | Merge into `user.prefs` |

Hard-delete job (out of scope): forms with `deleted_at` older than 30 days.

### 7.7 `GET /api/forms`
Query params validated with Zod: `q`, `owner`, `sort`, `cursor`, `limit` (max 50). Returns 401 if no session. Sets `Cache-Control: private, no-store`.

---

## 8. Authentication
- Better Auth, Google provider only for v1. Callback: `/api/auth/callback/google`.
- Middleware (`middleware.ts`): redirect unauthenticated requests for `/`, `/forms/*`, `/settings` to `/sign-in?next=...`. Do not rely on middleware alone: **re-check the session in every server component/action/route**.
- On first sign-in, create user row (handled by Better Auth); `prefs` defaults to `{ "view": "list", "hideTemplates": false }`.
- `/sign-in` page: centered card, Formly logo, one **primary** button "Continue with Google" (this is the only primary button on that page), short privacy line.

---

## 9. Responsive Behaviour

| Breakpoint | Changes |
|---|---|
| <640px | Nav: logo + search icon + avatar; template row horizontal scroll with snap; list rows stack (title on first line, meta below); grid = 1 col; toolbar wraps, filter becomes icon-only |
| 640–1023px | Search bar shown at 360px; grid 2–3 cols |
| ≥1024px | Full layout as in Section 5 |

Touch targets ≥ 44px on mobile. No horizontal page scroll at any width (320px minimum).

---

## 10. Accessibility (WCAG 2.2 AA)
- Landmarks: `<header>` nav, `<main>`, section headings `h1` (visually hidden "Formly Home"), `h2` for the two sections.
- Skip link "Skip to content" as first focusable element.
- Visible focus: 3px indigo ring (`--ring`) on all interactive elements, never removed.
- Color contrast ≥ 4.5:1 for text in both themes (verify `--text-secondary` on `--surface` and `--bg-alt`).
- Menus/dialogs from Radix (focus trap, Esc, ARIA roles). Toasts use `aria-live="polite"`.
- Respect `prefers-reduced-motion` (no lift animation, no shimmer) and `prefers-color-scheme` as the initial theme.
- Status chips include text, never color alone.
- Template cards and rows have accessible names; decorative previews are `aria-hidden`.

---

## 11. Performance
- Front page is a server component: fetch templates (cached) and the first page of forms in parallel (`Promise.all`) on the server; hydrate TanStack Query with that data.
- `next/font` with `display: swap`; preload General Sans via `<link rel="preload">` (self-host the font file if Fontshare CDN is slow).
- No images on this page except the user avatar (use `next/image`, 36×36).
- Target: LCP < 2.0s, CLS < 0.05, INP < 200ms, JS for this route < 150KB gzipped.
- Neon: use pooled connection string; scale-to-zero cold start can add ~0.5s, so show skeletons and consider keeping a lightweight cron ping on production.

---

## 12. Security Checklist
- [ ] All DB access via Drizzle (parameterized). No string-built SQL. Escape LIKE wildcards.
- [ ] Every query/mutation scoped by `owner_id`/collaborator from the **session**, never from client-sent user ids.
- [ ] Zod validation on all inputs; max lengths enforced; reject unknown keys (`.strict()`).
- [ ] Rate limiting on `createForm` (e.g. 20 per minute per user) and on `/api/forms` (60 per minute). Use Upstash Redis or an in-DB counter table.
- [ ] Per-user cap of 500 non-deleted forms (return friendly error).
- [ ] Server Actions are same-origin by default; do not disable that. Set `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY` in `next.config.ts` headers.
- [ ] Secrets only in env vars; `.env*` in `.gitignore`; never expose `DATABASE_URL` with `NEXT_PUBLIC_`.
- [ ] Render user text (form titles) only as text, never `dangerouslySetInnerHTML`.
- [ ] Neon: database role used by the app has only the privileges it needs; migrations run with a separate owner role in CI.
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.

---

## 13. Edge Cases to Handle
- Double click on a template card → only one form created (disable + idempotency via `useTransition` pending state).
- Very long titles (truncate with ellipsis, full title in `title` attribute).
- Titles with emoji / RTL text / only whitespace (trim; empty becomes "Untitled form").
- User with 0 forms vs. user whose filter returns 0 forms (different messages).
- Deleted form opened from a stale tab → editor stub shows "Form not found" with link home.
- Session expiry during an action → redirect to `/sign-in?next=/`.
- Neon cold start or transient error → retry once with 300ms backoff in queries, then show error state.
- Search query with `%`, `_`, quotes, 500 characters (cap to 100).
- Timezones: store UTC, format relative date on the client with `Intl.RelativeTimeFormat`; for older than 7 days show `MMM d` (and year if different).
- Dark mode flash: inline script in `<head>` sets `data-theme` from localStorage/`prefers-color-scheme` before paint.

---

## 14. Testing

**Unit (Vitest):** relative date formatter, Zod validators, LIKE-escape helper, cursor encode/decode, `TemplatePreview` rendering for each question type.

**Integration:** `listForms` against a Neon test branch: owner filter, search, each sort, pagination correctness (no duplicates or gaps), soft-deleted excluded, cannot see another user's forms.

**E2E (Playwright), minimum set:**
1. Logged out → `/` redirects to `/sign-in`.
2. New user sees empty state and 6 cards.
3. Click Blank form → lands on `/forms/{id}/edit` → back to `/` → form appears in list.
4. Click each template → form created with the template's title.
5. Rename, duplicate, trash + undo.
6. Search (nav + ⌘K), sort, filter, view toggle persist after reload.
7. Theme toggle persists, no flash.
8. Mobile viewport (375px) layout has no horizontal scroll.
9. Axe accessibility scan: zero serious/critical violations in light and dark.

---

## 15. Build Order (milestones, with "done when")

**M0. Project setup**
- `pnpm create next-app`, TS strict, Tailwind v4, ESLint, Prettier. Copy `genesis-DESIGN.md` to `DESIGN.md`.
- Done when: `pnpm dev` runs, fonts load, tokens applied, light/dark works.

**M1. Database**
- Create Neon project/branches, set env, schema, generate and run migration, enable `pg_trgm`, seed templates.
- Done when: `pnpm db:migrate && pnpm db:seed` succeeds twice with no errors; templates table has 5 rows.

**M2. Auth**
- Better Auth + Google, `/sign-in`, middleware, `getSession()` helper, avatar menu with sign out.
- Done when: sign in/out works; `/` is protected.

**M3. Static UI (no data)**
- TopNav, StartSection with hardcoded template names, RecentSection empty state, skeletons, responsive CSS.
- Done when: matches the layout in Section 5 at 375, 768, 1280px in both themes.

**M4. Wire templates + create actions**
- `getTemplates()`, `createForm`, redirect to editor stub, toasts.
- Done when: all 6 cards create a form with correct content; double-click safe.

**M5. Recent forms list**
- `listForms`, `/api/forms`, FormList, FormRow, relative dates, status chips, load more.
- Done when: created forms appear in order; pagination works with 60 test rows.

**M6. Toolbar + search**
- Owner filter, sort, view toggle (persist), grid view, nav search + ⌘K palette.
- Done when: URL params reflect state; reload keeps state.

**M7. Row actions**
- Rename, duplicate, trash/undo dialogs and actions.
- Done when: ownership enforced (verify with a second account).

**M8. Hardening**
- Rate limits, security headers, a11y pass, performance pass, error states, offline toast.
- Done when: Security checklist (Section 12) fully ticked; Lighthouse ≥ 95 for Accessibility and Best Practices, ≥ 90 Performance (mobile).

**M9. Tests + deploy**
- Write the tests in Section 14, deploy to Vercel with Neon `main` branch, set env vars, run migrations in CI before deploy.
- Done when: CI green, production smoke test passes.

---

## 16. Environment Variables (`.env.example`)

```
# Neon (pooled for runtime, direct for migrations)
DATABASE_URL="postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/formly?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASS@ep-xxx.REGION.aws.neon.tech/formly?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="generate with: openssl rand -base64 32"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional rate limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

`package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`, `db:studio`.

---

## 17. Final Acceptance Checklist

- [ ] Visually matches Genesis tokens; no hard-coded hex values outside `globals.css`
- [ ] No Google logos/images/trademarked assets used
- [ ] No more than one filled-indigo button in any section
- [ ] Works with JavaScript disabled for creating forms from cards (progressive enhancement)
- [ ] Light and dark mode both pass contrast checks
- [ ] Keyboard-only user can do every action
- [ ] Another user can never see or modify your forms (tested)
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` all pass
- [ ] Production build has no console errors or warnings

---

## 18. Suggested Kickoff Prompt for Antigravity

> Read `FORMLY-FRONT-PAGE-PLAN.md` and `DESIGN.md` in this repo. Start with Milestone M0 and M1 only. Before coding, restate the plan for those milestones in 10 lines and list any assumptions or questions. After finishing each milestone, run the "done when" checks, show me the results, and wait for my approval before starting the next one. Do not build anything outside the scope in Section 1.
