const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("=== Testing Formly Dashboard Recent Forms Grid Plan ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `grid_tester_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log(`1. Registering test user (${testUser})...`);
    await page.goto("http://127.0.0.1:3000/register", { waitUntil: "domcontentloaded" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    assert.strictEqual(regResult.status, 201, "Registration failed");
    const userId = regResult.data.user.id;
    console.log("✓ Registered user:", userId);

    // 2. Navigate to Dashboard (empty state test)
    console.log("2. Navigating to Dashboard with 0 forms (testing Empty State)...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
    await delay(1200);

    // Check empty state
    const hasEmptyState = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h3")).map((h) => h.textContent.trim());
      return headings.includes("No forms created yet");
    });
    assert.ok(hasEmptyState, "Empty state heading 'No forms created yet' must be rendered");

    const hasCreateFirstFormBtn = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button")).some((b) =>
        b.textContent.includes("Create your first form")
      );
    });
    assert.ok(hasCreateFirstFormBtn, "'Create your first form' button must be present in empty state");
    console.log("✓ Empty state verified successfully");

    // Capture screenshot of empty state
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "dashboard_recent_forms_empty.png"),
      fullPage: false,
    });

    // 3. Create test forms in Neon Postgres (Draft, Published, Closed)
    console.log("3. Creating 4 test forms in database...");
    const form1 = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Product Feedback Survey 2026",
        description: "Gather feedback from users regarding recent release features and usability.",
        definition: {
          schemaVersion: 1,
          title: "Product Feedback Survey 2026",
          themeKey: "soft-lavender",
        },
      },
    });

    const form2 = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "PUBLISHED",
        title: "Customer Support Quality Rating",
        description: "Quarterly CSAT satisfaction metrics collection for VIP customer tier.",
        definition: {
          schemaVersion: 1,
          title: "Customer Support Quality Rating",
          themeKey: "ocean-breeze",
        },
      },
    });

    const form3 = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "CLOSED",
        title: "Annual Hackathon Team Registration",
        description: "Official entry submissions for developer hackathon event in Pune.",
        definition: {
          schemaVersion: 1,
          title: "Annual Hackathon Team Registration",
        },
      },
    });

    const form4 = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Very Long Form Title That Tests Text Clamping And Overflow Prevention Gracefully Across Screen Sizes",
        description: "Extremely long description text that goes on for multiple lines to ensure that line-clamp-2 prevents uneven card heights or visual overflow in the dashboard recent forms grid component.",
      },
    });

    console.log("✓ Created 4 forms in database");

    // 4. Reload Dashboard to view populated grid
    console.log("4. Reloading Dashboard to verify Recent Forms Card Grid...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
    await delay(1500);

    // Verify NO table elements exist in Recent Forms
    const hasTable = await page.evaluate(() => {
      return document.querySelector("section table") !== null;
    });
    assert.strictEqual(hasTable, false, "Recent Forms section must NOT render a table");
    console.log("✓ Verified table presentation is completely replaced");

    // Verify Grid container classes
    const gridClasses = await page.$eval("section .grid", (el) => el.className);
    console.log("Grid classes found:", gridClasses);
    assert.ok(gridClasses.includes("grid-cols-1"), "Grid must support 1 col on mobile");
    assert.ok(gridClasses.includes("md:grid-cols-2"), "Grid must support 2 cols on medium");
    assert.ok(gridClasses.includes("lg:grid-cols-3"), "Grid must support 3 cols on desktop");
    console.log("✓ Responsive grid columns verified (1 / 2 / 3 cols)");

    // Count cards rendered
    const cardCount = await page.$$eval('section [role="article"]', (els) => els.length);
    console.log(`Rendered ${cardCount} form cards in Recent Forms`);
    assert.strictEqual(cardCount, 4, "Should render 4 form cards");

    // 5. Verify Card Content
    console.log("5. Verifying card content (title, status, badges, timestamps, metrics)...");
    const cardsData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('section [role="article"]'));
      return cards.map((card) => {
        const title = card.querySelector("h3")?.textContent?.trim();
        const desc = card.querySelector("p")?.textContent?.trim();
        const badge = card.querySelector('span[class*="rounded-full"]')?.textContent?.trim();
        const metrics = card.textContent;
        return { title, desc, badge, hasResponses: metrics.includes("Responses:"), hasViews: metrics.includes("Views:") };
      });
    });

    console.log("Card titles:", cardsData.map((c) => c.title));
    assert.ok(cardsData.some((c) => c.badge.includes("Draft")), "Must render Draft status badge");
    assert.ok(cardsData.some((c) => c.badge.includes("Published")), "Must render Published status badge");
    assert.ok(cardsData.some((c) => c.badge.includes("Closed")), "Must render Closed status badge");
    assert.ok(cardsData.every((c) => c.hasResponses && c.hasViews), "Every card must show Responses and Views");
    console.log("✓ Form statuses and metrics verified on all cards");

    // 6. Test Contextual Actions Menu & Event Isolation
    console.log("6. Testing Actions Menu dropdown & click isolation...");
    const initialUrl = page.url();

    // Click the actions menu button on first card
    const firstMenuBtn = await page.$('section [role="article"] button[aria-label^="Actions"]');
    assert.ok(firstMenuBtn, "Actions menu button must exist on card");
    await firstMenuBtn.click();
    await delay(300);

    // Verify menu opened and page did not navigate
    assert.strictEqual(page.url(), initialUrl, "Clicking actions menu must NOT trigger card navigation");
    const menuOpened = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div")).some((d) =>
        d.textContent.includes("Copy Form ID")
      );
    });
    assert.ok(menuOpened, "Actions menu dropdown must open with 'Copy Form ID'");
    console.log("✓ Actions menu opened with event isolation verified");

    // Click Copy Form ID
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Copy Form ID")
      );
      if (btn) btn.click();
    });
    await delay(300);
    console.log("✓ Copy Form ID clicked");

    // 7. Test View All link
    console.log("7. Verifying 'View all' link...");
    const viewAllHref = await page.$eval('section a[href="/my-forms"]', (el) => el.getAttribute("href"));
    assert.strictEqual(viewAllHref, "/my-forms", "View all must link to /my-forms");
    console.log("✓ 'View all' link verified");

    // 8. Responsive Viewport Tests & Screenshots
    console.log("8. Testing responsive layouts across viewports...");

    // Desktop 1440px (3 columns)
    await page.setViewport({ width: 1440, height: 900 });
    await delay(500);
    const desktopScreenshot = path.join(ARTIFACT_DIR, "dashboard_recent_forms_desktop_grid.png");
    await page.screenshot({ path: desktopScreenshot, fullPage: false });
    console.log("✓ Captured desktop 3-col screenshot:", desktopScreenshot);

    // Tablet 820px (2 columns)
    await page.setViewport({ width: 820, height: 900 });
    await delay(500);
    const tabletScreenshot = path.join(ARTIFACT_DIR, "dashboard_recent_forms_tablet_grid.png");
    await page.screenshot({ path: tabletScreenshot, fullPage: false });
    console.log("✓ Captured tablet 2-col screenshot:", tabletScreenshot);

    // Mobile 420px (1 column)
    await page.setViewport({ width: 420, height: 850 });
    await delay(500);
    const mobileScreenshot = path.join(ARTIFACT_DIR, "dashboard_recent_forms_mobile_grid.png");
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log("✓ Captured mobile 1-col screenshot:", mobileScreenshot);

    // Reset to desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    await delay(500);

    // 9. Test Card Click Target (Navigates to builder)
    console.log("9. Testing Card primary click navigation...");
    await page.evaluate(() => {
      const firstCard = document.querySelector('section [role="article"]');
      if (firstCard) firstCard.click();
    });
    await delay(2000);

    console.log("Navigated URL after card click:", page.url());
    assert.ok(page.url().includes("/forms/"), "Clicking card must navigate to form edit/builder");
    console.log("✓ Primary card navigation verified");

    console.log("\n========================================================");
    console.log("🎉 ALL DASHBOARD RECENT FORMS GRID TESTS PASSED!");
    console.log("========================================================\n");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
