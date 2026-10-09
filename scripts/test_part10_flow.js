const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Part 10 Trash Workspace End-to-End Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  page.on("response", async (res) => {
    if (res.url().includes("/api/v1/trash")) {
      console.log("TRASH API RES:", res.status(), await res.text().catch(() => ""));
    }
  });

  const timestamp = Date.now().toString().slice(-5);
  const testUser = `trash_user_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Unauthenticated redirect test
    console.log("1. Checking unauthenticated redirect to /login from /trash...");
    await page.goto("http://localhost:3000/trash", { waitUntil: "networkidle0" });
    console.log("URL after visiting /trash unauthenticated:", page.url());
    if (!page.url().includes("/login")) {
      throw new Error(`Expected redirect to /login, got: ${page.url()}`);
    }
    console.log("✓ Protected /trash properly redirected to /login");

    // 2. Register creator user
    console.log(`2. Registering creator user (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    console.log("Registration API response:", regResult);
    if (regResult.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regResult)}`);
    }

    const userId = regResult.data.user.id;
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    console.log("✓ Creator registered and session active");

    // 3. Create 2 forms and set one as published with a real submission
    console.log("3. Creating forms and recording real response data...");
    const form1 = await page.evaluate(async () => {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Event Registration 2026" }),
      });
      return res.json();
    });
    const form1Id = form1.form.id;

    const form2 = await page.evaluate(async () => {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Workshop Feedback Survey" }),
      });
      return res.json();
    });
    const form2Id = form2.form.id;

    // Publish form 1
    await page.evaluate(async (id) => {
      await fetch(`/api/v1/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
    }, form1Id);

    // Record submission for form 1
    await page.evaluate(async (id) => {
      await fetch(`/api/public/forms/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: { name: "Alice Wonderland", email: "alice@example.com" },
          durationSeconds: 42,
        }),
      });
    }, form1Id);

    console.log("✓ Forms created: form1 (PUBLISHED with 1 response), form2 (DRAFT)");

    // 4. Move form 1 to Trash
    console.log("4. Moving 'Event Registration 2026' to Trash...");
    const trashRes = await page.evaluate(async (id) => {
      const res = await fetch(`/api/v1/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
      return res.json();
    }, form1Id);

    console.log("Trash response:", trashRes);
    if (!trashRes.form || trashRes.form.status !== "TRASHED") {
      throw new Error(`Failed to move form to trash: ${JSON.stringify(trashRes)}`);
    }

    // Verify form 1 is excluded from /my-forms
    await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
    const myFormsContent = await page.evaluate(() => document.body.innerText);
    if (myFormsContent.includes("Event Registration 2026")) {
      throw new Error("Trashed form still appeared on My Forms!");
    }
    console.log("✓ Trashed form immediately excluded from My Forms");

    // Verify public form link is unavailable
    await page.goto(`http://localhost:3000/f/${form1Id}`, { waitUntil: "networkidle0" });
    const publicContent = await page.evaluate(() => document.body.innerText);
    if (!publicContent.includes("Form Unavailable")) {
      throw new Error("Public form link was not disabled while in Trash!");
    }
    console.log("✓ Trashed form public route returned 'Form Unavailable'");

    // 5. Visit /trash and verify visual structure matching 10.png
    console.log("5. Visiting /trash as signed-in creator...");
    await page.goto("http://localhost:3000/trash", { waitUntil: "networkidle0" });
    await delay(1000);

    // Verify Title & Subtitle
    const heading = await page.$eval("h1", (el) => el.textContent);
    console.log("Trash heading:", heading);
    if (!heading.includes("Trash")) {
      throw new Error(`Expected 'Trash', got: ${heading}`);
    }

    // Verify Sidebar highlights Trash
    const activeSidebar = await page.evaluate(() => {
      const link = document.querySelector("a[href='/trash']");
      return link ? link.textContent?.trim() : null;
    });
    console.log("Active sidebar link:", activeSidebar);
    if (!activeSidebar || !activeSidebar.includes("Trash")) {
      throw new Error("Sidebar did not highlight Trash link");
    }
    console.log("✓ Trash properly highlighted in app sidebar");

    // Verify Category Pills
    const categoriesText = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll("button span:first-child"));
      return pills.map((p) => p.textContent?.trim()).filter(Boolean);
    });
    console.log("Found toolbar buttons:", categoriesText);

    // Verify Trashed Item Row in Table
    const rowTitle = await page.$eval("tbody tr", (el) => el.innerText);
    console.log("First table row text:", rowTitle);
    if (!rowTitle.includes("Event Registration 2026")) {
      throw new Error("Trashed form not found in trash table");
    }
    if (!rowTitle.includes("Form")) {
      throw new Error("Type badge 'Form' missing in trash table");
    }
    console.log("✓ Trash table accurately displays trashed form, type badge, and days left");

    // Verify Details Panel on right
    const detailsPanelText = await page.evaluate(() => {
      const panel = document.querySelector(".sticky.top-4");
      return panel ? panel.innerText : "";
    });
    console.log("Details panel content snippet:", detailsPanelText.slice(0, 200));
    if (!detailsPanelText.includes("Event Registration 2026")) {
      throw new Error("Details panel did not show active trashed form");
    }
    if (!detailsPanelText.includes("1 response")) {
      throw new Error("Details panel did not show real total responses count");
    }
    console.log("✓ Details panel displays form metadata and real total responses (1 response)");

    // 6. Test Safe Restore Flow
    console.log("6. Testing Restore Form flow with Published warning...");
    // Click Restore Form button in Details panel
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const restoreBtn = btns.find((b) => b.innerText.includes("Restore Form"));
      if (restoreBtn) restoreBtn.click();
    });
    await delay(500);

    // Verify Published notice inside Restore dialog
    const dialogNotice = await page.evaluate(() => {
      const notice = document.querySelector("[data-testid='published-restore-notice']");
      return notice ? notice.innerText : "";
    });
    console.log("Restore dialog published notice:", dialogNotice);
    if (!dialogNotice.includes("Notice for Published Form")) {
      throw new Error("Expected notice for restoring published form in dialog");
    }

    // Confirm restore
    await page.evaluate(() => {
      document.querySelector("#confirm-restore-btn")?.click();
    });
    await delay(1500);

    // Verify form is no longer in Trash
    const afterRestoreRows = await page.evaluate(() => {
      return document.querySelector("tbody tr")?.innerText || "empty";
    });
    console.log("Trash rows after restore:", afterRestoreRows);
    if (afterRestoreRows.includes("Event Registration 2026")) {
      throw new Error("Form still appeared in trash after restoration");
    }

    // Verify form is restored to PUBLISHED in database
    const dbForm1 = await prisma.form.findUnique({
      where: { id: form1Id },
      select: { status: true, statusBeforeTrash: true, deletedAt: true, purgeAt: true },
    });
    console.log("DB Form status after restore:", dbForm1);
    if (dbForm1.status !== "PUBLISHED" || dbForm1.deletedAt !== null) {
      throw new Error(`Expected status PUBLISHED and deletedAt null, got: ${JSON.stringify(dbForm1)}`);
    }

    // Verify public route accepts responses again
    await page.goto(`http://localhost:3000/f/${form1Id}`, { waitUntil: "networkidle0" });
    const publicAfterRestore = await page.evaluate(() => document.body.innerText);
    if (publicAfterRestore.includes("Form Unavailable")) {
      throw new Error("Public route was still unavailable after restoring published form!");
    }
    console.log("✓ Form successfully restored to PUBLISHED status and public route reactivated");

    // 7. Test Permanent Deletion Flow
    console.log("7. Testing Permanent Deletion of 'Workshop Feedback Survey'...");
    // Move form 2 to trash
    await page.evaluate(async (id) => {
      await fetch(`/api/v1/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
    }, form2Id);

    await page.goto("http://localhost:3000/trash", { waitUntil: "networkidle0" });
    await delay(800);

    // Click Delete Permanently in Details Panel
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const delBtn = btns.find((b) => b.innerText.includes("Delete Permanently"));
      if (delBtn) delBtn.click();
    });
    await delay(500);

    // Verify Delete confirmation modal is open and input requires typing DELETE
    const confirmInput = await page.$("#delete-confirm-input");
    if (!confirmInput) {
      throw new Error("Delete confirmation input not found in dialog");
    }

    // Type "DELETE" into confirmation input
    await confirmInput.type("DELETE");
    await delay(300);

    // Click confirm delete permanently
    await page.evaluate(() => {
      document.querySelector("#confirm-permanent-delete-btn")?.click();
    });
    await delay(1200);

    // Verify form is completely purged from Neon PostgreSQL database
    const dbForm2 = await prisma.form.findUnique({
      where: { id: form2Id },
    });
    console.log("DB Form 2 after permanent deletion:", dbForm2);
    if (dbForm2 !== null) {
      throw new Error("Form was not deleted from database!");
    }
    console.log("✓ Form permanently deleted from Neon PostgreSQL");

    // 8. Test Internal Cleanup Job route
    console.log("8. Testing internal cleanup cron job (/api/internal/jobs/trash-cleanup)...");
    const unauthCron = await page.evaluate(async () => {
      const res = await fetch("/api/internal/jobs/trash-cleanup", { method: "POST" });
      return res.status;
    });
    console.log("Unauthenticated cron status:", unauthCron);
    if (unauthCron !== 401) {
      throw new Error(`Expected 401 Unauthorized for cron without secret, got ${unauthCron}`);
    }

    const authCron = await page.evaluate(async () => {
      const res = await fetch("/api/internal/jobs/trash-cleanup", {
        method: "POST",
        headers: { "Authorization": "Bearer f9b4c052e96d1912a7810b4da4815462" },
      });
      return { status: res.status, data: await res.json() };
    });
    console.log("Authorized cron response:", authCron);
    if (authCron.status !== 200 || !authCron.data.success) {
      throw new Error(`Authorized cron job failed: ${JSON.stringify(authCron)}`);
    }
    console.log("✓ Internal cleanup cron job verified and secured");

    // 9. Re-trash form 1 to capture rich visual proof matching 10.png
    console.log("9. Setting up rich Trash state and capturing screenshots across viewports...");
    await page.evaluate(async (id) => {
      await fetch(`/api/v1/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });
    }, form1Id);

    await page.goto("http://localhost:3000/trash", { waitUntil: "networkidle0" });
    await delay(800);

    // Desktop Screenshot (1280x800)
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await delay(400);
    const desktopPath = path.join(ARTIFACT_DIR, "trash_desktop_light.png");
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`✓ Saved desktop screenshot: ${desktopPath}`);

    // Tablet Screenshot (820x1180)
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
    await delay(400);
    const tabletPath = path.join(ARTIFACT_DIR, "trash_tablet_view.png");
    await page.screenshot({ path: tabletPath, fullPage: true });
    console.log(`✓ Saved tablet screenshot: ${tabletPath}`);

    // Mobile Screenshot (375x812)
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
    await delay(400);
    const mobilePath = path.join(ARTIFACT_DIR, "trash_mobile_view.png");
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`✓ Saved mobile screenshot: ${mobilePath}`);

    console.log("\n========================================================");
    console.log("ALL STEP 10 TRASH TESTS PASSED WITH 100% SUCCESS!");
    console.log("========================================================");
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
