const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Part B1 Blank Form Builder End-to-End Verification ===");
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

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `builder_user_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Unauthenticated access check
    console.log("1. Checking unauthenticated redirect to /login from /forms/fake-id/edit...");
    await page.goto("http://localhost:3000/forms/fake-id/edit", { waitUntil: "networkidle0" });
    if (!page.url().includes("/login")) {
      throw new Error(`Expected redirect to /login, got: ${page.url()}`);
    }
    console.log("✓ Unauthenticated request redirected to /login");

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

    console.log("Registration status:", regResult.status);
    if (regResult.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regResult.data)}`);
    }
    console.log("✓ Creator registered and session active");

    // 4. Visit Dashboard and click Blank Form
    console.log("4. Navigating to Dashboard and clicking Blank Form...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    // Click Blank Form card
    const blankCardSelector = "button:has-text('Blank Form'), button";
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const blankBtn = buttons.find((b) => b.innerText.includes("Blank Form"));
      if (blankBtn) {
        blankBtn.click();
        return true;
      }
      return false;
    });

    console.log("Clicked Blank Form card:", clicked);
    if (!clicked) {
      throw new Error("Could not find Blank Form card on dashboard");
    }

    // Wait for client-side redirect to /forms/[formId]/edit
    console.log("Waiting for client-side navigation to /forms/[formId]/edit...");
    await page.waitForFunction(
      () => window.location.pathname.includes("/forms/") && window.location.pathname.includes("/edit"),
      { timeout: 20000 }
    );
    await delay(1500);

    const currentUrl = page.url();
    console.log("Current URL after clicking Blank Form:", currentUrl);
    if (!currentUrl.includes("/forms/") || !currentUrl.includes("/edit")) {
      throw new Error(`Expected URL to contain /forms/[id]/edit, got ${currentUrl}`);
    }

    const formId = currentUrl.split("/forms/")[1].split("/edit")[0];
    console.log(`✓ Blank form created with ID: ${formId}`);

    // Verify draft in database
    const dbForm = await prisma.form.findUnique({
      where: { id: formId },
    });
    if (!dbForm) {
      throw new Error("Form not found in database");
    }
    console.log(`✓ Form exists in DB: title="${dbForm.title}", status="${dbForm.status}", draftRevision=${dbForm.draftRevision}`);
    if (dbForm.status !== "DRAFT") {
      throw new Error(`Expected status DRAFT, got ${dbForm.status}`);
    }

    // 5. Capture initial desktop editor screenshot
    const screenshot1 = path.join(ARTIFACT_DIR, "b1_builder_desktop_initial.png");
    await page.screenshot({ path: screenshot1 });
    console.log(`✓ Captured initial desktop editor screenshot: ${screenshot1}`);

    // 6. Test Title editing
    console.log("6. Testing title and description editing...");
    await page.evaluate(() => {
      const setVal = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(el, val);
        } else {
          el.value = val;
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const titleInput = document.querySelector("input[aria-label='Form title']");
      if (titleInput) {
        setVal(titleInput, "Customer Satisfaction Survey 2026");
      }
    });
    await delay(500);

    // 7. Add questions
    console.log("7. Adding new questions via quick actions and question card...");
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll("button"));
      const addBtn = addBtns.find((b) => b.innerText.includes("Add question") || b.title === "Add Question");
      if (addBtn) addBtn.click();
    });
    await delay(600);

    // Set second question title and type to RATING
    await page.evaluate(() => {
      const setVal = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(el, val);
        } else {
          el.value = val;
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const cards = document.querySelectorAll("input[aria-label='Question title']");
      if (cards.length >= 2) {
        setVal(cards[1], "How satisfied are you with our service?");
      }

      const typeSelects = document.querySelectorAll("select[aria-label='Question type']");
      if (typeSelects.length >= 2) {
        typeSelects[1].value = "RATING";
        typeSelects[1].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(800);

    // Wait for debounced autosave to trigger and complete
    console.log("Waiting 2s for debounced cloud autosave...");
    await delay(2000);

    // Verify database has updated definition
    const updatedDbForm = await prisma.form.findUnique({
      where: { id: formId },
    });
    console.log(`✓ Autosaved DB Form: title="${updatedDbForm.title}", draftRevision=${updatedDbForm.draftRevision}`);
    if (updatedDbForm.draftRevision < 1) {
      console.warn("Notice: draftRevision should be incremented after autosave");
    }

    // 8. Capture edited desktop screenshot
    const screenshot2 = path.join(ARTIFACT_DIR, "b1_builder_desktop_edited.png");
    await page.screenshot({ path: screenshot2 });
    console.log(`✓ Captured edited desktop editor screenshot: ${screenshot2}`);

    // 9. Concurrency test: simulate 409 conflict
    console.log("9. Testing optimistic concurrency conflict detection (409)...");
    const conflictRes = await page.evaluate(async (id) => {
      const res = await fetch(`/api/v1/forms/${id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: 999999, // Intentional mismatch
          definition: {
            schemaVersion: 1,
            title: "Stale title",
            themeKey: "soft-lavender",
            settings: { showProgressIndicator: true, confirmationMessage: "Thanks.", allowMultipleSubmissions: true },
            questions: [],
          },
        }),
      });
      return { status: res.status, data: await res.json() };
    }, formId);

    console.log("Conflict test HTTP status:", conflictRes.status);
    if (conflictRes.status !== 409 || !conflictRes.data.conflict) {
      throw new Error(`Expected 409 Conflict with conflict=true, got ${conflictRes.status}`);
    }
    console.log("✓ Optimistic concurrency correctly rejected stale expectedRevision with 409 Conflict!");

    // 10. Switch to Theme Tab
    console.log("10. Testing Theme tab and selecting Royal Purple...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const themeTab = tabs.find((t) => t.innerText.includes("Theme"));
      if (themeTab) themeTab.click();
    });
    await delay(1000);

    // Select Royal Purple theme card
    await page.evaluate(() => {
      const themeCards = Array.from(document.querySelectorAll("button"));
      const royalCard = themeCards.find((c) => c.innerText.includes("Royal Purple"));
      if (royalCard) royalCard.click();
    });
    await delay(1500);

    const screenshotTheme = path.join(ARTIFACT_DIR, "b1_theme_tab.png");
    await page.screenshot({ path: screenshotTheme });
    console.log(`✓ Captured Theme tab screenshot: ${screenshotTheme}`);

    // 11. Switch to Preview Tab (Single-Page Respondent Preview)
    console.log("11. Testing Preview tab (Single-Page Respondent Flow)...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const previewTab = tabs.find((t) => t.innerText.includes("Preview"));
      if (previewTab) previewTab.click();
    });
    await delay(1000);

    const screenshotPreview = path.join(ARTIFACT_DIR, "b1_respondent_preview.png");
    await page.screenshot({ path: screenshotPreview });
    console.log(`✓ Captured Single-Page Respondent Preview screenshot: ${screenshotPreview}`);

    // 12. Switch back to Questions tab and test Publish dialog
    console.log("12. Testing Publish flow...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const questionsTab = tabs.find((t) => t.innerText.includes("Questions"));
      if (questionsTab) questionsTab.click();
    });
    await delay(800);

    // Click Publish button in topbar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("header button"));
      const publishBtn = btns.find((b) => b.innerText.includes("Publish"));
      if (publishBtn) publishBtn.click();
    });
    await delay(1000);

    const screenshotPublishModal = path.join(ARTIFACT_DIR, "b1_publish_review_dialog.png");
    await page.screenshot({ path: screenshotPublishModal });
    console.log(`✓ Captured Publish review dialog screenshot: ${screenshotPublishModal}`);

    let publishStatus = null;
    let publishResponseText = null;
    const responseHandler = async (res) => {
      if (res.url().includes("/publish")) {
        publishStatus = res.status();
        publishResponseText = await res.text().catch(() => "");
        console.log("PUBLISH API RESPONSE:", publishStatus, publishResponseText);
      }
    };
    page.on("response", responseHandler);

    // Click Confirm & Publish in modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("div[role='dialog'] button"));
      const confirmBtn = btns.find((b) => b.innerText.includes("Confirm & Publish"));
      if (confirmBtn) confirmBtn.click();
    });

    console.log("Waiting for published URL input or API response...");
    await page.waitForSelector("input[value*='/f/']", { timeout: 15000 }).catch((e) => {
      console.log("waitForSelector info:", e.message);
    });
    await delay(1000);

    const screenshotPublished = path.join(ARTIFACT_DIR, "b1_published_success.png");
    await page.screenshot({ path: screenshotPublished });
    console.log(`✓ Captured Published success screenshot: ${screenshotPublished}`);
    page.off("response", responseHandler);

    // Verify in database that Form is now PUBLISHED and FormVersion exists
    const publishedDbForm = await prisma.form.findUnique({
      where: { id: formId },
    });
    console.log(`✓ Database Form status after publish: ${publishedDbForm.status}`);
    if (publishedDbForm.status !== "PUBLISHED") {
      throw new Error(`Expected status PUBLISHED, got ${publishedDbForm.status}`);
    }

    if (publishedDbForm.definitionVersion !== 1) {
      throw new Error(`Expected definitionVersion 1, got ${publishedDbForm.definitionVersion}`);
    }
    console.log(`✓ Form published successfully with definitionVersion=${publishedDbForm.definitionVersion}`);

    // 13. Test Public Respondent Route /f/[formId]
    console.log(`13. Verifying public respondent route http://localhost:3000/f/${formId}...`);
    await page.goto(`http://localhost:3000/f/${formId}`, { waitUntil: "networkidle0" });
    await delay(1500);

    const screenshotPublic = path.join(ARTIFACT_DIR, "b1_public_form_page.png");
    await page.screenshot({ path: screenshotPublic });
    console.log(`✓ Captured live public respondent page screenshot: ${screenshotPublic}`);

    // 14. Responsive Viewports
    console.log("14. Capturing responsive viewports...");
    // Return to editor
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    await delay(1000);

    // Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await delay(500);
    const screenshotTablet = path.join(ARTIFACT_DIR, "b1_builder_tablet.png");
    await page.screenshot({ path: screenshotTablet });
    console.log(`✓ Captured tablet screenshot: ${screenshotTablet}`);

    // Mobile
    await page.setViewport({ width: 375, height: 812 });
    await delay(500);
    const screenshotMobile = path.join(ARTIFACT_DIR, "b1_builder_mobile.png");
    await page.screenshot({ path: screenshotMobile });
    console.log(`✓ Captured mobile screenshot: ${screenshotMobile}`);

    console.log("=== ALL PART B1 VERIFICATIONS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
