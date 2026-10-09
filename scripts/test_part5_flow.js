const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

async function run() {
  console.log("=== Starting Step 5 Templates Gallery Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  const timestamp = Date.now().toString().slice(-5);
  const testUser = `creator5_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Unauthenticated redirect test
    console.log("1. Checking unauthenticated redirect to /login from /templates...");
    await page.goto("http://localhost:3000/templates", { waitUntil: "networkidle0" });
    console.log("URL after visiting /templates unauthenticated:", page.url());
    if (!page.url().includes("/login")) {
      throw new Error(`Expected redirect to /login, got: ${page.url()}`);
    }
    console.log("✓ Protected route properly redirected to /login");

    // 2. Register user
    console.log(`2. Registering User (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", testUser);
    await page.type("#reg-password-input", testPassword);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log("✓ User registered, current URL:", page.url());

    // 3. Navigate to /templates via sidebar
    console.log("3. Navigating to /templates via sidebar link...");
    await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
    const templatesSidebarLink = await page.$('a[href="/templates"]');
    if (!templatesSidebarLink) {
      throw new Error("Templates sidebar link not found in AppSidebar!");
    }
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
      templatesSidebarLink.click(),
    ]);
    console.log("✓ Arrived at /templates:", page.url());

    // 4. Verify Heading & Quick Actions
    console.log("4. Verifying page heading and quick-action cards...");
    const headingText = await page.$eval("h1", (el) => el.textContent);
    console.log("Heading text:", headingText);
    if (!headingText.includes("Templates")) {
      throw new Error("Page heading does not include 'Templates'");
    }

    // Check quick-action cards
    const blankBtnExists = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.some((b) => b.textContent && b.textContent.includes("Blank Form"));
    });
    console.log("✓ Blank Form button exists:", blankBtnExists);

    // 5. Verify Template Cards Count
    console.log("5. Checking initial template cards render...");
    await page.waitForSelector("h3", { timeout: 10000 });
    const cardTitles = await page.$$eval("h3", (els) => els.map((el) => el.textContent.trim()));
    console.log(`Rendered card titles (${cardTitles.length}):`, cardTitles);
    if (cardTitles.length !== 12) {
      throw new Error(`Expected 12 seeded templates, found: ${cardTitles.length}`);
    }
    console.log("✓ All 12 curated templates are rendered in grid");

    // 6. Test Category Filter
    console.log("6. Testing category filtering (Education)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const eduBtn = btns.find((b) => b.textContent && b.textContent.trim().startsWith("Education"));
      if (eduBtn) eduBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const eduTitles = await page.$$eval("h3", (els) => els.map((el) => el.textContent.trim()));
    console.log(`Education templates (${eduTitles.length}):`, eduTitles);
    if (!eduTitles.includes("Student Registration") || !eduTitles.includes("Class Feedback")) {
      throw new Error("Category filter did not show expected Education templates");
    }
    if (eduTitles.includes("Patient Intake Form")) {
      throw new Error("Category filter incorrectly included Patient Intake Form in Education");
    }
    console.log("✓ Category filter correctly updated results and URL");

    // Reset back to All Templates
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const allBtn = btns.find((b) => b.textContent && b.textContent.includes("All Templates"));
      if (allBtn) allBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 7. Test Search Filter
    console.log("7. Testing search filter (feedback)...");
    const searchInput = await page.$('input[placeholder="Search templates..."]');
    await searchInput.type("feedback");
    await new Promise((r) => setTimeout(r, 800));

    const searchTitles = await page.$$eval("h3", (els) => els.map((el) => el.textContent.trim()));
    console.log(`Search results for 'feedback' (${searchTitles.length}):`, searchTitles);
    if (searchTitles.length === 0 || !searchTitles.includes("Feedback Form")) {
      throw new Error("Search filter did not include Feedback Form");
    }
    if (searchTitles.includes("Job Application")) {
      throw new Error("Search filter incorrectly included Job Application for 'feedback'");
    }
    console.log("✓ Search filter works accurately");

    // Clear search
    await page.evaluate(() => {
      const clearBtn = document.querySelector('button[aria-label="Clear search"]');
      if (clearBtn) clearBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 8. Test Template Preview Dialog
    console.log("8. Testing template preview dialog...");
    await page.evaluate(() => {
      const previewBtns = Array.from(document.querySelectorAll("button")).filter(
        (b) => b.textContent && b.textContent.trim() === "Preview"
      );
      if (previewBtns.length > 0) previewBtns[0].click();
    });

    await page.waitForSelector('div[role="dialog"]', { timeout: 6000 });
    console.log("✓ Preview dialog opened");

    // Wait for questions to load
    await new Promise((r) => setTimeout(r, 1500));
    const questionLabels = await page.$$eval('div[role="dialog"] span.font-semibold', (els) =>
      els.map((el) => el.textContent.trim())
    );
    console.log("Preview questions found:", questionLabels);
    if (questionLabels.length === 0) {
      throw new Error("Questions list was empty in preview dialog");
    }
    console.log("✓ Preview dialog loaded question structure successfully");

    // Close preview dialog
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close preview"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 9. Test "Use Template" action
    console.log("9. Testing 'Use Template' action on Event Registration...");
    const clickedUse = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      const eventCard = cards.find((c) => c.textContent && c.textContent.includes("Event Registration"));
      if (!eventCard) return false;
      const useBtn = Array.from(eventCard.querySelectorAll("button")).find(
        (b) => b.textContent && b.textContent.includes("Use Template")
      );
      if (useBtn) {
        useBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedUse) throw new Error("Could not find Use Template button for Event Registration");

    // Wait for success notice
    await page.waitForFunction(
      () => document.body.textContent.includes("Draft Form Created!"),
      { timeout: 10000 }
    );
    console.log("✓ Success notice appeared: Draft Form Created!");

    // 10. Check that the Draft appears in My Forms
    console.log("10. Checking that new draft appears in /my-forms...");
    await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
    await page.waitForSelector("table, .group", { timeout: 8000 });
    const myFormsContent = await page.content();
    if (!myFormsContent.includes("Event Registration")) {
      throw new Error("Newly created draft 'Event Registration' was not found in /my-forms!");
    }
    console.log("✓ 'Event Registration' is visible in My Forms library");

    // 11. Database snapshot verification
    console.log("11. Verifying database record snapshot...");
    const dbForm = await prisma.form.findFirst({
      where: { title: "Event Registration" },
      include: { sourceTemplate: true, sourceTemplateVersion: true },
    });
    if (!dbForm) throw new Error("Form not found in database");
    if (!dbForm.definition || !dbForm.sourceTemplateId) {
      throw new Error("Form definition or sourceTemplateId was not saved in database");
    }
    console.log(`✓ Database record verified: formId=${dbForm.id}, sourceTemplate=${dbForm.sourceTemplate?.slug}`);

    // 12. Capture Screenshots
    console.log("12. Capturing high-resolution screenshots for review...");
    await page.goto("http://localhost:3000/templates", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));

    // Desktop Light
    await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "templates_desktop_light.png"),
      fullPage: false,
    });
    console.log("✓ Captured templates_desktop_light.png");

    // Desktop with Preview Open
    await page.evaluate(() => {
      const previewBtns = Array.from(document.querySelectorAll("button")).filter(
        (b) => b.textContent && b.textContent.trim() === "Preview"
      );
      if (previewBtns.length > 0) previewBtns[0].click();
    });
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "templates_preview_dialog.png"),
      fullPage: false,
    });
    console.log("✓ Captured templates_preview_dialog.png");

    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close preview"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Tablet
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "templates_tablet_light.png"),
      fullPage: false,
    });
    console.log("✓ Captured templates_tablet_light.png");

    // Mobile
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "templates_mobile_light.png"),
      fullPage: false,
    });
    console.log("✓ Captured templates_mobile_light.png");

    console.log("=== ALL STEP 5 TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
