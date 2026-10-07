# Formly: Complete Google Forms Parity Plan

This is the definitive specification and roadmap for Formly to achieve complete parity with Google Forms and expand beyond it.

---

## 1. Dashboard (Home Screen)

### Create
- **Blank form:** First card in the template gallery. Clicking it creates an "Untitled form" with one section and one empty question, then opens the editor (`/forms/[id]/edit`).
- **Template gallery:** A horizontal row of templates with "View all". The full gallery opens `/templates`, with tabs for Personal, Work, Education, and Events (at least 15 curated templates). Each template can be previewed before use.
- **Create inside a folder:** A "New form here" action sits on every folder page.

### Browse and Organize
- **Recent forms:** Sorted by last opened. Each card/row shows title, status, response count, and last edited time.
- **Filter:** "Owned by anyone / Owned by me / Not owned by me".
- **Sort:** Last opened by me, Last modified, Title A to Z, Title Z to A.
- **View toggle:** Grid and list.
- **Folders:** Create, rename, recolor, and delete. Forms move in via drag & drop or "Move to". Deleting a folder returns its forms to Unfiled.
- **Sidebar sections:** Home, All forms, Recent, Starred, Shared with me, Trash, Settings.
- **Search:** Instant search bar plus a `Ctrl/⌘+K` command palette searching form titles, descriptions, and folders.

### Context Actions
- **Form card menu:** Open, Open in new tab, Rename, Move to folder, Star, Make a copy, Copy link, Share, Remove (to Trash).
- **Trash:** Forms and folders stay for 30 days. You can restore them or delete forever.
- **Account menu:** Profile, theme (light, dark, system), language, Settings, Sign out.
- **Dashboard settings (the "⋮" next to Template gallery):** Default settings for all new forms.

---

## 2. Editor Layout

- **Top bar:**
  - Back arrow
  - Editable title
  - Star
  - Folder/move
  - "Saving… / Saved" status indicator
  - Customize theme (palette icon)
  - Preview (eye icon)
  - Undo and redo
  - Send (the single primary filled button)
  - Collaborators
  - More menu (⋮)
- **Tabs:** Questions, Responses (with real-time count badge), Settings.
- **Form header card:** Form title in large type, description, and header image if chosen.
- **Floating toolbar:** Sits beside the active question card:
  - Add question
  - Import questions
  - Add title and description
  - Add image
  - Add video
  - Add section
- **Question cards:** Click a card to make it active. Inactive cards render exactly as a respondent will see them.
- **More menu (⋮):**
  - Make a copy
  - Move to trash
  - Print
  - Get pre-filled link
  - Embed
  - Add-ons / Integrations
  - Preferences
  - Keyboard shortcuts
- **Autosave:** Every change saves automatically with "Last edit was X minutes ago". Offline banner syncs changes on reconnection.

---

## 3. Question Types

Every question includes title, optional description, required toggle, and a type switcher with icons that preserves the title when changing types.

1. **Short answer:** Single line, up to 500 chars. Supports validation.
2. **Paragraph:** Multi-line, up to 10,000 chars. Supports length and regex validation.
3. **Multiple choice:**
   - Radio options with drag-to-reorder.
   - "Add option" and "Add 'Other'" (with text input).
   - Optional image per option.
   - "Clear selection" link for optional questions.
   - Shuffle option order.
   - "Go to section based on answer".
4. **Checkboxes:** Multi-select with validation ("Select at least / at most / exactly N").
5. **Dropdown:** Single selection list. Supports shuffle and go-to-section. Multi-line paste creates one option per line.
6. **Linear scale:** 0 or 1 to 2–10 with optional end labels.
7. **Rating:** Star, heart, or thumb icon with levels from 3 to 10.
8. **Multiple choice grid:** Editable rows and columns. Require response in each row, limit 1 per column, shuffle row order.
9. **Checkbox grid:** Grid with checkbox cells.
10. **Date:** Include time, include year toggles; native picker with typed fallback.
11. **Time:** Time of day or Duration (hours, minutes, seconds).
12. **File upload:**
    - Allowed types: Document, Spreadsheet, Presentation, Drawing, PDF, Image, Video, Audio, or Any.
    - Max files: 1, 5, or 10.
    - Max size: 1 MB, 10 MB, 100 MB.
    - Neon Object Storage backend (S3-compatible).
13. **Extra types (beyond Google):** Dedicated Number, Email, and URL with preset validations.

### Non-question Blocks
- **Title and description:** Formatted text block.
- **Image:** Upload, URL, or Unsplash search. Left/center/right alignment, drag-resize, caption, and alt text.
- **Video:** YouTube or Vimeo URL with alignment, caption, and thumbnail.

---

## 4. Question-Level Options

- **Text formatting:** Bold, italic, underline, link, clear formatting (stored safely as sanitized JSON/HTML).
- **Image in question:** Header image directly above title.
- **Description toggle:** Accessible via question ⋮ menu.
- **Duplicate question:** Deep clone with logic, validation, and answer key.
- **Delete question:** Hard delete if 0 responses; archive if responses exist (preserving export/report data).
- **Drag handle:** Reorder questions via drag & drop or `Alt+↑/↓`.
- **Move between sections:** Drag or "Move to section" dialog.
- **Response validation (⋮):**
  - **Number:** >, >=, <, <=, ==, !=, between, not between, is number, whole number.
  - **Text:** contains, doesn't contain, email, URL.
  - **Length:** max chars, min chars.
  - **Regular expression:** contains, doesn't contain, matches, doesn't match (ReDoS-safe engine).
  - **Checkboxes:** at least, at most, exactly N.
  - Custom error messages for all rules.
- **Shuffle options:** Randomized per respondent.
- **Go to section based on answer:** For multiple choice and dropdown.
- **Show only if…:** Extended conditional logic beyond Google.
- **Answer key & feedback:** Enabled in Quiz mode.

---

## 5. Sections and Logic

### Sections (Pages)
- Add section creates a new page with title, description, and "Section X of Y" badge.
- Section menu: Duplicate, Move, Delete (re-parent questions), Merge with above.
- "After section X": Continue to next section / Go to section N / Submit form.

### Routing Logic
- **Go to section based on answer:** Map each choice option to a target section or submit.
- Cycle/loop prevention: Only forward jumps allowed.
- First routed answer decides if multiple routed questions appear in one section.

### Show only if… (Conditional Display)
- Rule: earlier question + operator + value.
- Operators: equals, does not equal, contains, is empty, is not empty, >, <.
- Grouping: "All of (AND)" or "Any of (OR)".
- Hidden questions are skipped, never required, and cleared on submission.
- Validation warnings badge questions if parent question/section is deleted.

---

## 6. Quiz Mode

### Configuration
- Enable in Settings > Quizzes > "Make this a quiz".
- Questions gain Answer Key, Point Value (0–100), and Answer Feedback (correct/incorrect feedback with links/videos).
- Text questions support multiple accepted answers with case-sensitive toggle; numbers support exact or range.

### Grade Release
- **Immediately after submission:** Score and feedback shown on confirmation screen.
- **Later, after manual review:** Requires collecting emails; score release triggers automated email.

### Respondent Visibility
- Checkboxes: Missed questions, Correct answers, Point values.

### Manual Grading & Analytics
- Individual tab: Score overrides and custom written feedback.
- Questions tab: Batch grading ("Grade all responses to question X").
- Analytics: Average score, median, range, score distribution histogram, most missed questions list.

---

## 7. Customize Theme

- **Header image:** Built-in curated gallery (Nature, Abstract, Minimal) or upload (cropped to 1600×400).
- **Theme color:** Curated swatches + custom hex code. Generates accessible button, focus ring, and progress bar accents.
- **Background tint:** 4 derived tints + dark mode option.
- **Font styles:** Basic (DM Sans), Decorative (General Sans / Display Serif), Formal (Serif), Playful (Rounded Sans).
- **Live preview:** Real-time WYSIWYG updates.
- **Theme mode:** Light, dark, or system match.

---

## 8. Settings

- **Responses:**
  - Collect email addresses: Off, Verified (Google sign-in), Responder input.
  - Send responders a copy: Off, Always, When requested.
  - Allow response editing: Secure token link on confirmation page & email copy.
  - Limit to 1 response (requires sign-in).
  - Require sign-in (Google).
  - Restrict to domain (e.g. `@company.com`).
  - Response cap: Auto-close after N responses.
  - Close on date & time (with timezone).
- **Presentation:**
  - Progress bar.
  - Shuffle question order.
  - Link to submit another response.
  - Custom confirmation message (up to 500 chars).
  - Custom closed message.
  - Disable autosave toggle.
- **Quizzes:** Point defaults, grade release options, answer visibility.
- **Defaults:** User-level defaults for all new forms.
- **Protection:** Turnstile captcha toggle, honeypot field (always active), email notification on new submission.

---

## 9. Send, Share, and Collaborate

- **Send Dialog:**
  - Email: Send link with custom subject/message.
  - Link: Direct link + short link (`/s/[code]`).
  - Embed: Responsive `<iframe>` with auto-resizing `postMessage`.
  - QR Code: Download PNG and SVG.
  - Social: Direct share to Twitter, LinkedIn, WhatsApp, Facebook.
- **Collaborators:** Add by email as Editor or Viewer (7-day invite token). Revoke or modify permissions anytime.
- **Publishing Checklist:** Verifies question titles, option counts, and logic before opening to public.
- **Print / Pre-filled Link:** Generate URL with answers pre-populated.

---

## 10. Preview

- Dedicated preview route (`/forms/[id]/preview`).
- "Preview mode: responses will not be saved" top banner.
- Fully functional validation, paging, and routing logic.

---

## 11. Respondent Experience (`/f/[slug]`)

- Fast server-side access checks: 404 if draft/deleted, closed message if expired/full, auth check if restricted.
- Progress bar, required indicators (`*`), back/next/submit buttons.
- LocalStorage draft autosave (restores on accidental refresh; cleared on submit).
- Double-submission & idempotency protection.
- Confirmation screen with score, review, edit link, or repeat submission link.
- Query param `?embedded=true` removes header/footer for seamless iframe embedding.

---

## 12. Responses & Analytics

- **Controls:** Accepting responses toggle, response counter, notification toggle, delete all responses.
- **Summary Tab:** Auto-generated charts:
  - Multiple choice / Dropdown: Pie charts.
  - Checkboxes / Linear scale: Bar charts with averages.
  - Grids: Stacked bars per row.
  - Text / Dates / Numbers: Answers list with min/max/average.
  - File uploads: Download links.
- **Question Tab:** View and filter all answers per specific question.
- **Individual Tab:** Browse individual respondent submissions (with pagination, delete, and print).
- **Built-in Table Tab:** Formly spreadsheet view:
  - Virtualized rows for high performance.
  - Search, sort, filter by date, column toggles.
  - Bulk select & delete.
- **Export:** Instant CSV and XLSX downloads with formula injection prevention (`=`, `+`, `-`, `@` escaped).
- **Google Sheets Sync:** Optional automated two-way append integration.

---

## 13. Integrations & API

- **Webhooks:** Automated HTTPS POST payload with HMAC signature on every response.
- **REST API:** Personal API keys with granular scopes (read forms, read responses, create forms).
- **Keyboard Shortcuts:** Quick modal triggered by `?`.

---

## 14. Transactional Emails

- Collaborator invite.
- New submission notification (digest mode if >5/min).
- Respondent submission copy (with edit link).
- Quiz score release.
- Send form invitation.

---

## 15. Internationalization & Accessibility

- Multi-language support via `next-intl` (English, Hindi, Marathi, Spanish, French, German, Arabic RTL, Portuguese).
- WCAG 2.2 AA compliant, screen-reader friendly, visible 3px focus rings, reduced-motion queries.
- Zero raw IP storage (daily-salted hashing for abuse prevention).

---

## 16. Database Model

Tables in Neon Postgres:
- `user`, `session`, `account`, `verification`
- `templates`
- `folders`
- `forms`
- `form_sections`
- `form_questions`
- `form_options`
- `form_logic_rules`
- `form_opens`
- `form_collaborators`
- `form_invites`
- `responses`
- `response_answers`
- `response_grades`
- `webhooks`, `webhook_deliveries`
- `api_keys`
- `short_links`

---

## 17. 14-Step Build Order

1. **Step 1: Foundation & Data Model:** Add full relational schema (folders, sections, questions, responses), run migrations, seed templates.
2. **Step 2: Dashboard Live:** Live folders CRUD, drag/move, search, trash, starred, templates.
3. **Step 3: Editor Core:** `/forms/[id]/edit` top bar, tabs, autosave, undo/redo, question list.
4. **Step 4: Editor Complete:** All 12 question types, floating toolbar, media blocks, validation editor.
5. **Step 5: Sections & Logic:** Multi-page sections, go-to-section routing, show-if conditional logic.
6. **Step 6: Quiz Mode:** Answer key editor, point values, feedback, manual grading UI.
7. **Step 7: Customize Theme:** Header image picker, palette colors, font style presets, live preview.
8. **Step 8: Form Settings:** Response limits, email collection, domain restriction, timers, confirmation message.
9. **Step 9: Respondent View (`/f/[slug]`):** Public form rendering, paging, client/server validation, submission pipeline.
10. **Step 10: Preview & Send Dialog:** Eye preview mode, email/link/embed/QR share dialog, short links.
11. **Step 11: Responses & Summary:** Analytics charts (pie, bar, average), question view, individual view.
12. **Step 12: Responses Table & Export:** Virtualized spreadsheet table, CSV/XLSX export, formula escaping.
13. **Step 13: File Uploads & Webhooks:** S3-compatible Neon storage uploads, webhook triggers, API keys.
14. **Step 14: Hardening, Polish & Parity Verification:** A11y, mobile pass, rate-limiting, comprehensive smoke test.
