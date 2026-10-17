const puppeteer = require("puppeteer-core");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\74135bcb-4dde-4401-88a6-4fdba8664f14";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Formly App-Wide TUI-Minimal Visual & Functional Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Sign up a fresh test user
    const testUsername = `tui_user_${Date.now().toString().slice(-6)}`;
    console.log(`[Auth] Creating test user: ${testUsername}...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_register.png") });

    await page.type("#reg-username-input", testUsername);
    await page.type("#reg-password-input", "Password123456!");
    const submitBtn = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      submitBtn.click(),
    ]);

    const user = await prisma.user.findFirst({ where: { username: testUsername } });
    if (!user) {
      throw new Error("Failed to register test user");
    }

    // 2. Seed forms with responses, views, and trash
    console.log("[Data] Seeding sample forms, responses, and trash...");
    const sampleForms = [
      { title: "Customer Satisfaction Survey", description: "Quarterly customer sentiment analysis", status: "PUBLISHED" },
      { title: "Developer Onboarding", description: "Engineering feedback on internal tools", status: "DRAFT" },
      { title: "Product Launch Signups", description: "Early access waitlist and preferences", status: "PUBLISHED" },
      { title: "Conference Workshop Feedback", description: "Session evaluation and takeaways", status: "PUBLISHED" },
      { title: "Internal Hackathon 2026", description: "Team registration and project abstracts", status: "DRAFT" },
    ];

    let firstFormId = null;
    for (const f of sampleForms) {
      const created = await prisma.form.create({
        data: {
          ownerId: user.id,
          title: f.title,
          description: f.description,
          status: f.status,
          definition: {
            title: f.title,
            description: f.description,
            themeKey: "soft-lavender",
            questions: [
              { id: "q1", type: "short_text", label: "What is your full name?", required: true },
              { id: "q2", type: "rating", label: "How satisfied are you with our service?", required: false },
            ],
            settings: { showProgressBar: true, showQuestionNumbers: true },
          },
        },
      });

      if (!firstFormId) firstFormId = created.id;

      if (f.status === "PUBLISHED") {
        await prisma.responseSession.create({
          data: { formId: created.id },
        });
        await prisma.formResponse.create({
          data: {
            formId: created.id,
            answers: { q1: "Alice Smith", q2: 5 },
          },
        });
      }
    }

    // Also create 1 trashed form
    await prisma.form.create({
      data: {
        ownerId: user.id,
        title: "Archived Draft 2025",
        description: "Older deprecated form",
        status: "TRASHED",
        statusBeforeTrash: "DRAFT",
        deletedAt: new Date(),
        purgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        definition: {},
      },
    });

    // 3. Verify Dashboard
    console.log("[Route] Verifying /dashboard...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_dashboard.png") });

    // 4. Verify My Forms (Grid view)
    console.log("[Route] Verifying /my-forms (Grid)...");
    await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_my_forms_grid.png") });

    // Switch to List view
    console.log("[Route] Switching to /my-forms (List)...");
    const listBtn = await page.$('button[title="List view"]');
    if (listBtn) {
      await listBtn.click();
      await delay(500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_my_forms_list.png") });
    }

    // 5. Verify Responses
    console.log("[Route] Verifying /responses...");
    await page.goto("http://localhost:3000/responses", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_responses.png") });

    // 6. Verify Analytics
    console.log("[Route] Verifying /analytics...");
    await page.goto("http://localhost:3000/analytics", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_analytics.png") });

    // 7. Verify Profile
    console.log("[Route] Verifying /profile...");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_profile.png") });

    // 8. Verify Settings
    console.log("[Route] Verifying /settings...");
    await page.goto("http://localhost:3000/settings", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_settings.png") });

    // 9. Verify Trash
    console.log("[Route] Verifying /trash...");
    await page.goto("http://localhost:3000/trash", { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_trash.png") });

    // 10. Verify Form Builder
    if (firstFormId) {
      console.log(`[Route] Verifying /forms/${firstFormId}/edit (Builder)...`);
      await page.goto(`http://localhost:3000/forms/${firstFormId}/edit`, { waitUntil: "networkidle0" });
      await delay(1500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_builder_questions.png") });

      // Click Preview Tab
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('nav[aria-label="Editor tabs"] button'));
        const btn = buttons.find((b) => b.textContent && b.textContent.includes("Preview"));
        if (btn) btn.click();
      });
      await delay(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_builder_preview.png") });

      // Click Theme Tab
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('nav[aria-label="Editor tabs"] button'));
        const btn = buttons.find((b) => b.textContent && b.textContent.includes("Theme"));
        if (btn) btn.click();
      });
      await delay(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_builder_theme.png") });
    }

    // 11. Dark mode check
    console.log("[Theme] Checking Dark Mode toggle on /my-forms...");
    await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await delay(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_my_forms_dark.png") });

    // 12. Tablet & Mobile viewport check
    console.log("[Responsive] Checking tablet (768px) and mobile (375px)...");
    await page.setViewport({ width: 768, height: 1024 });
    await delay(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_tablet_view.png") });

    await page.setViewport({ width: 375, height: 812 });
    await delay(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "tui_mobile_view.png") });

    console.log("=== All App-Wide TUI Screenshots Captured Successfully ===");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
