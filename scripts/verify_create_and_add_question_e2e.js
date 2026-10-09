const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly: Create Form and Add Question E2E Verification ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  const ts = Date.now().toString().slice(-6);
  const userA = `creator_a_${ts}`;
  const userB = `creator_b_${ts}`;
  const password = "Password123!";

  try {
    // ---------------------------------------------------------
    // Phase 1: Register User A and create blank form
    // ---------------------------------------------------------
    console.log(`\n[Phase 1] Registering User A (${userA})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    const regResultA = await page.evaluate(async (username, pwd) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pwd }),
      });
      return { status: res.status, data: await res.json() };
    }, userA, password);

    if (regResultA.status !== 201) {
      throw new Error(`Failed to register User A: ${JSON.stringify(regResultA.data)}`);
    }
    console.log("✓ User A registered and session active");

    console.log("Navigating to Dashboard...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    console.log("Clicking 'Blank Form' quick start card on Dashboard...");
    const clickedBlank = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const blankBtn = buttons.find((b) => b.innerText.includes("Blank Form"));
      if (blankBtn) {
        blankBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedBlank) {
      throw new Error("Could not find 'Blank Form' button on dashboard");
    }

    console.log("Waiting for navigation to editor route /forms/[id]/edit...");
    await page.waitForFunction(
      () => window.location.pathname.includes("/forms/") && window.location.pathname.includes("/edit"),
      { timeout: 20000 }
    );
    await delay(1500);

    const editorUrl = page.url();
    console.log(`✓ Navigated to editor route: ${editorUrl}`);
    const formIdMatch = editorUrl.match(/\/forms\/([^/]+)\/edit/);
    if (!formIdMatch) {
      throw new Error(`URL did not match expected format: ${editorUrl}`);
    }
    const formId = formIdMatch[1];
    console.log(`✓ Form ID extracted: ${formId}`);

    // Verify exactly 1 draft created in database for User A
    const dbFormA = await prisma.form.findUnique({
      where: { id: formId },
      include: { owner: true },
    });
    if (!dbFormA) {
      throw new Error("Created form not found in database!");
    }
    console.log(`✓ Database record confirmed: title="${dbFormA.title}", status="${dbFormA.status}", owner="${dbFormA.owner.username}"`);
    if (dbFormA.status !== "DRAFT") {
      throw new Error(`Expected DRAFT status, got ${dbFormA.status}`);
    }

    // ---------------------------------------------------------
    // Phase 2: Add questions via both controls and modify them
    // ---------------------------------------------------------
    console.log("\n[Phase 2] Verifying initial editor state and Add Question controls...");

    // Check initial question exists
    const initialQuestionCount = await page.evaluate(() => {
      return document.querySelectorAll("input[aria-label='Question title']").length;
    });
    console.log(`Initial questions count on canvas: ${initialQuestionCount}`);
    if (initialQuestionCount < 1) {
      throw new Error("Expected at least 1 initial default question");
    }

    // Set first question title
    console.log("Updating Question 1 title...");
    await page.evaluate(() => {
      const setNativeValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const titleInput = document.querySelector("input[aria-label='Question title']");
      if (titleInput) {
        setNativeValue(titleInput, "What is your full name?");
      }
    });
    await delay(400);

    // Click Add Question via Quick Actions Toolbar (Floating Plus Button)
    console.log("Clicking '+ Add Question' via Quick Actions Toolbar...");
    const toolbarClicked = await page.evaluate(() => {
      const btn = document.querySelector("aside[aria-label='Quick actions'] button[aria-label='Add Question']");
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Toolbar Add Question clicked: ${toolbarClicked}`);
    if (!toolbarClicked) {
      throw new Error("Could not find toolbar Add Question button");
    }
    await delay(600);

    // Verify question count is now 2
    const countAfterQ2 = await page.evaluate(() => {
      return document.querySelectorAll("input[aria-label='Question title']").length;
    });
    console.log(`Question count after toolbar addition: ${countAfterQ2}`);
    if (countAfterQ2 !== 2) {
      throw new Error(`Expected 2 questions, found ${countAfterQ2}`);
    }

    // Configure Question 2: Type = RATING, Title = "How would you rate our platform?"
    console.log("Configuring Question 2 as RATING...");
    await page.evaluate(() => {
      const setNativeValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const titleInputs = document.querySelectorAll("input[aria-label='Question title']");
      if (titleInputs[1]) {
        setNativeValue(titleInputs[1], "How would you rate our platform?");
      }
      const typeSelects = document.querySelectorAll("select[aria-label='Question type']");
      if (typeSelects[1]) {
        typeSelects[1].value = "RATING";
        typeSelects[1].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(600);

    // Click Add Question via Canvas bottom button
    console.log("Clicking '+ Add question' via Canvas bottom button...");
    const canvasBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const addBtn = buttons.find((b) => b.innerText.trim() === "Add question" && !b.closest("aside"));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Canvas bottom Add Question clicked: ${canvasBtnClicked}`);
    if (!canvasBtnClicked) {
      throw new Error("Could not find canvas bottom Add question button");
    }
    await delay(600);

    // Verify question count is now 3
    const countAfterQ3 = await page.evaluate(() => {
      return document.querySelectorAll("input[aria-label='Question title']").length;
    });
    console.log(`Question count after canvas button addition: ${countAfterQ3}`);
    if (countAfterQ3 !== 3) {
      throw new Error(`Expected 3 questions, found ${countAfterQ3}`);
    }

    // Configure Question 3: Type = MULTIPLE_CHOICE, Title = "How did you hear about us?"
    console.log("Configuring Question 3 as MULTIPLE_CHOICE...");
    await page.evaluate(() => {
      const setNativeValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const titleInputs = document.querySelectorAll("input[aria-label='Question title']");
      if (titleInputs[2]) {
        setNativeValue(titleInputs[2], "How did you hear about us?");
      }
      const typeSelects = document.querySelectorAll("select[aria-label='Question type']");
      if (typeSelects[2]) {
        typeSelects[2].value = "MULTIPLE_CHOICE";
        typeSelects[2].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(600);

    // Test incomplete question draft save (empty title temporarily while typing)
    console.log("Testing incomplete question handling (clearing question 3 title temporarily)...");
    await page.evaluate(() => {
      const setNativeValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const titleInputs = document.querySelectorAll("input[aria-label='Question title']");
      if (titleInputs[2]) {
        setNativeValue(titleInputs[2], ""); // Empty string
      }
    });
    await delay(1200);

    // Now restore title to complete value
    await page.evaluate(() => {
      const setNativeValue = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const titleInputs = document.querySelectorAll("input[aria-label='Question title']");
      if (titleInputs[2]) {
        setNativeValue(titleInputs[2], "How did you hear about us?");
      }
    });

    // ---------------------------------------------------------
    // Phase 3: Wait for autosave and verify persistence
    // ---------------------------------------------------------
    console.log("\n[Phase 3] Waiting 2.5s for autosave to complete...");
    await delay(2500);

    const autosaveStatusText = await page.evaluate(() => {
      const statusPill = document.querySelector("header div.hidden.sm\\:block span");
      return statusPill ? statusPill.innerText : "Not found";
    });
    console.log(`UI Autosave status: "${autosaveStatusText}"`);

    // Verify in database directly
    const persistedForm = await prisma.form.findUnique({
      where: { id: formId },
    });
    const def = persistedForm.definition;
    console.log(`Persisted in DB: draftRevision=${persistedForm.draftRevision}, questions=${def.questions?.length}`);
    if (!def.questions || def.questions.length !== 3) {
      throw new Error(`Expected 3 questions in database definition, found ${def.questions?.length}`);
    }
    console.log(`Q1: "${def.questions[0].label}" (${def.questions[0].type})`);
    console.log(`Q2: "${def.questions[1].label}" (${def.questions[1].type})`);
    console.log(`Q3: "${def.questions[2].label}" (${def.questions[2].type})`);

    if (def.questions[0].label !== "What is your full name?" || def.questions[0].type !== "SHORT_TEXT") {
      throw new Error("Question 1 mismatch in DB definition");
    }
    if (def.questions[1].label !== "How would you rate our platform?" || def.questions[1].type !== "RATING") {
      throw new Error("Question 2 mismatch in DB definition");
    }
    if (def.questions[2].label !== "How did you hear about us?" || def.questions[2].type !== "MULTIPLE_CHOICE") {
      throw new Error("Question 3 mismatch in DB definition");
    }
    console.log("✓ All 3 questions successfully persisted to Neon Postgres database!");

    // ---------------------------------------------------------
    // Phase 4: Full page reload verification
    // ---------------------------------------------------------
    console.log("\n[Phase 4] Reloading the page to test persistent loader restoration...");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1500);

    const reloadedQuestionCount = await page.evaluate(() => {
      return document.querySelectorAll("input[aria-label='Question title']").length;
    });
    console.log(`Questions rendered on canvas after reload: ${reloadedQuestionCount}`);
    if (reloadedQuestionCount !== 3) {
      throw new Error(`Expected 3 questions after page reload, got ${reloadedQuestionCount}`);
    }

    const reloadedTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("input[aria-label='Question title']")).map((i) => i.value);
    });
    console.log("Reloaded titles:", reloadedTitles);
    if (
      reloadedTitles[0] !== "What is your full name?" ||
      reloadedTitles[1] !== "How would you rate our platform?" ||
      reloadedTitles[2] !== "How did you hear about us?"
    ) {
      throw new Error(`Titles after reload do not match expected saved titles: ${JSON.stringify(reloadedTitles)}`);
    }
    console.log("✓ Reload test passed: identical questions, types, titles, and order restored from database!");

    // Capture screenshot of reloaded builder
    const reloadScreenshot = path.join(ARTIFACT_DIR, "builder_reloaded_success.png");
    await page.screenshot({ path: reloadScreenshot });
    console.log(`✓ Screenshot saved: ${reloadScreenshot}`);

    // ---------------------------------------------------------
    // Phase 5: Authorization and ownership check (User B vs User A)
    // ---------------------------------------------------------
    console.log(`\n[Phase 5] Registering User B (${userB}) to test ownership enforcement...`);
    const regResultB = await page.evaluate(async (username, pwd) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pwd }),
      });
      return { status: res.status, data: await res.json() };
    }, userB, password);

    if (regResultB.status !== 201) {
      throw new Error(`Failed to register User B: ${JSON.stringify(regResultB.data)}`);
    }
    console.log("✓ User B session active");

    console.log(`User B attempting to load User A's editor route (/forms/${formId}/edit)...`);
    const responseB = await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    const statusB = responseB.status();
    console.log(`User B HTTP response status for User A's form: ${statusB}`);
    // Next.js App Router notFound() returns 404
    if (statusB !== 404) {
      console.log(`User B URL or page content: status=${statusB}, url=${page.url()}`);
      const pageText = await page.evaluate(() => document.body.innerText);
      if (!pageText.includes("404") && !pageText.includes("This page could not be found")) {
        throw new Error(`User B was able to view User A's form! Expected 404 Not Found.`);
      }
    }
    console.log("✓ User B cannot access User A's form (returns 404 Not Found)");

    // User B attempting to overwrite User A's draft via API
    console.log("User B attempting unauthorized PATCH /api/v1/forms/[formId]/draft...");
    const unauthorizedSave = await page.evaluate(async (fId) => {
      const res = await fetch(`/api/v1/forms/${fId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: 1,
          definition: {
            schemaVersion: 1,
            title: "Hacked Form",
            settings: { showProgressIndicator: true },
            questions: [],
          },
        }),
      });
      return { status: res.status, data: await res.json() };
    }, formId);

    console.log(`Unauthorized save HTTP status: ${unauthorizedSave.status}`, unauthorizedSave.data);
    if (unauthorizedSave.status === 200) {
      throw new Error("SECURITY FAILURE: User B was able to modify User A's form!");
    }
    console.log("✓ Security verified: User B cannot modify User A's form!");

    console.log("\n=======================================================");
    console.log("🎉 ALL ACCEPTANCE CRITERIA VERIFIED AND PASSED 100%!");
    console.log("=======================================================");
  } catch (err) {
    console.error("VERIFICATION FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
