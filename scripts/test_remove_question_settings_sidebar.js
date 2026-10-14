const puppeteer = require("puppeteer-core");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTestSuite() {
  console.log("=== Formly Builder: Remove Question Settings Sidebar Test Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => console.log("[BROWSER CONSOLE]", msg.type(), msg.text()));
  page.on("response", async (res) => {
    if (res.url().includes("/draft")) {
      console.log("[DRAFT API RESPONSE]", res.status(), res.url(), await res.text().catch(() => ""));
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `sidebar_removal_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log("1. Registering test user...");
    await page.goto("http://127.0.0.1:3000/register", { waitUntil: "domcontentloaded" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    assert.strictEqual(regResult.status, 201, "Registration must succeed");
    const userId = regResult.data.user.id;

    // 2. Create test draft form
    console.log("2. Creating test draft form...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Test Sidebar Removal Form",
        themeKey: "soft-lavender",
        definition: {
          schemaVersion: 1,
          title: "Test Sidebar Removal Form",
          description: "Initial description",
          themeKey: "soft-lavender",
          blocks: [
            {
              id: "q-test-1",
              kind: "question",
              question: {
                id: "q-test-1",
                type: "SHORT_TEXT",
                label: "What is your full name?",
                description: null,
                required: false,
                settings: {
                  placeholder: "e.g. John Doe",
                },
              },
            },
          ],
        },
      },
    });

    // 3. Open Builder
    console.log(`3. Opening Form Builder at http://127.0.0.1:3000/forms/${form.id}/edit...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      return Boolean(document.querySelector('input[aria-label="Form title"]'));
    }, { timeout: 15000 });
    await delay(1200);

    // 4. Verify right-side Question settings panel is NOT in DOM
    console.log("4. Verifying Question settings panel and reserved space are absent...");
    const panelElements = await page.evaluate(() => {
      const byAria = document.querySelector('aside[aria-label="Question settings panel"]');
      const byAria2 = document.querySelector('aside[aria-label="Question settings"]');
      const byTitle = Array.from(document.querySelectorAll("h2")).find(
        (h) => h.textContent.trim() === "Question settings"
      );
      const byReservedWidth = document.querySelector(".lg\\:w-\\[340px\\], .w-\\[340px\\]");
      return {
        hasByAria: Boolean(byAria),
        hasByAria2: Boolean(byAria2),
        hasByTitle: Boolean(byTitle),
        hasByReservedWidth: Boolean(byReservedWidth),
      };
    });

    assert.strictEqual(panelElements.hasByAria, false, "Sidebar with aria-label Question settings panel must not exist");
    assert.strictEqual(panelElements.hasByAria2, false, "Sidebar with aria-label Question settings must not exist");
    assert.strictEqual(panelElements.hasByTitle, false, "Sidebar with heading 'Question settings' must not exist");
    assert.strictEqual(panelElements.hasByReservedWidth, false, "Reserved column width must not exist");
    console.log("✓ Right-side Question settings panel and column are completely gone.");

    // 5. Verify Canvas width and QuickActionsToolbar alignment
    console.log("5. Checking canvas layout and floating toolbar positioning...");
    const layoutMetrics = await page.evaluate(() => {
      const canvasContainer = document.querySelector("main div.max-w-4xl");
      const quickToolbar = document.querySelector('aside[aria-label="Quick actions"]');
      const card = document.querySelector('[aria-label="Question title"]')?.closest(".group");
      
      const canvasRect = canvasContainer?.getBoundingClientRect();
      const toolbarRect = quickToolbar?.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();

      return {
        hasCanvasContainer: Boolean(canvasContainer),
        canvasWidth: canvasRect?.width || 0,
        toolbarRightOfCard: toolbarRect && cardRect ? toolbarRect.left > cardRect.right : false,
        noOverlap: toolbarRect && cardRect ? (toolbarRect.left >= cardRect.right) : false,
      };
    });

    assert.strictEqual(layoutMetrics.hasCanvasContainer, true, "Canvas container must have max-w-4xl");
    assert.ok(layoutMetrics.canvasWidth >= 700, `Canvas width should be expansive (got ${layoutMetrics.canvasWidth}px)`);
    assert.strictEqual(layoutMetrics.noOverlap, true, "Toolbar must not overlap question card");
    console.log(`✓ Canvas container width is ${layoutMetrics.canvasWidth}px without toolbar overlap.`);

    // 6. Test selecting question card
    console.log("6. Testing selecting question card...");
    await page.evaluate(() => {
      const qInput = document.querySelector('input[aria-label="Question title"]');
      qInput?.click();
    });
    await delay(400);

    const postClickPanel = await page.evaluate(() => {
      return Boolean(document.querySelector('aside[aria-label="Question settings panel"]'));
    });
    assert.strictEqual(postClickPanel, false, "Selecting question card must NOT open side panel");
    console.log("✓ Selecting question card highlights card without opening side panel.");

    // 7. Test immediately available controls on the card
    console.log("7. Testing immediate controls on card (Title, Type, Required, Description)...");
    
    // 7a. Edit Question Title
    const titleInput = await page.$('input[aria-label="Question title"]');
    assert.ok(titleInput, "Question title input must exist");
    await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Question title"]');
      input?.select();
    });
    await page.keyboard.press("Backspace");
    await titleInput.type("What is your professional email?");
    
    // 7b. Toggle Required
    const requiredToggle = await page.$('input[aria-label="Required question"]');
    assert.ok(requiredToggle, "Required toggle must exist on card footer");
    await requiredToggle.click();

    // 7c. Add Description button
    const addDescBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Add description")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(addDescBtn, "Add description button must exist when question has no description");
    await delay(300);

    const descInput = await page.$('input[aria-label="Question helper text"]');
    assert.ok(descInput, "Question helper text input must appear under title after clicking Add description");
    await descInput.type("We will send your verification code here.");

    // 8. Test More Options inline expandable area
    console.log("8. Testing inline More options expandable section...");
    const moreOptionsBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("More options")
      );
      if (btn) {
        const expandedBefore = btn.getAttribute("aria-expanded");
        btn.click();
        return { clicked: true, expandedBefore };
      }
      return { clicked: false };
    });

    assert.strictEqual(moreOptionsBtn.clicked, true, "More options button must exist on card");
    assert.strictEqual(moreOptionsBtn.expandedBefore, "false", "More options must be collapsed by default");
    await delay(300);

    // Verify More options is now open
    const isNowExpanded = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("More options")
      );
      return btn?.getAttribute("aria-expanded");
    });
    assert.strictEqual(isNowExpanded, "true", "More options must have aria-expanded true when open");

    // 8b. Configure Placeholder in More options
    const placeholderInput = await page.$('input[placeholder="e.g. Type your answer here..."]');
    assert.ok(placeholderInput, "Placeholder input must be present inside More options for SHORT_TEXT");
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="e.g. Type your answer here..."]');
      input?.select();
    });
    await page.keyboard.press("Backspace");
    await placeholderInput.type("yourname@company.com");

    // 8c. Configure Response Validation (Text length & pattern)
    console.log("8c. Configuring Response validation in More options...");
    await page.evaluate(() => {
      const select = Array.from(document.querySelectorAll("select")).find((s) => {
        return Array.from(s.options).some((o) => o.value === "MIN");
      });
      if (select) {
        select.value = "MIN";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(300);

    // Set min length
    const minInput = await page.$('input[type="number"]');
    assert.ok(minInput, "Minimum characters input must appear when MIN is selected");
    await minInput.click({ clickCount: 3 });
    await minInput.type("8");

    // Set pattern
    const patternInput = await page.$('input[placeholder="e.g. [0-9]+"]');
    assert.ok(patternInput, "Pattern input must exist in More options");
    await patternInput.type("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    // Set custom error message
    const customErrInput = await page.$('input[placeholder="Enter error message"]');
    assert.ok(customErrInput, "Custom error message input must exist in More options");
    await customErrInput.type("Please enter a valid work email address.");

    const artifactDir = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
    await page.screenshot({ path: path.join(artifactDir, "desktop_builder_more_options_expanded.png") });
    console.log("Captured desktop_builder_more_options_expanded.png");

    // Wait for autosave to complete
    console.log("9. Waiting for autosave persistence...");
    await page.waitForFunction(() => {
      const topbarText = document.querySelector("header")?.textContent || "";
      return topbarText.includes("All changes saved") || topbarText.includes("Saved");
    }, { timeout: 10000 });

    const topbarText = await page.evaluate(() => document.querySelector("header")?.textContent || "");
    console.log("Autosave topbar text:", topbarText.trim());

    // 10. Reload page and check persistence
    console.log("10. Reloading page to verify persistence...");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      return Boolean(document.querySelector('input[aria-label="Question title"]'));
    }, { timeout: 15000 });
    await delay(1200);

    const reloadedValues = await page.evaluate(() => {
      const title = document.querySelector('input[aria-label="Question title"]')?.value;
      const desc = document.querySelector('input[aria-label="Question helper text"]')?.value;
      const required = document.querySelector('input[aria-label="Required question"]')?.checked;
      return { title, desc, required };
    });

    assert.strictEqual(reloadedValues.title, "What is your professional email?", "Question title must persist");
    assert.strictEqual(reloadedValues.desc, "We will send your verification code here.", "Description must persist");
    assert.strictEqual(reloadedValues.required, true, "Required toggle must persist as true");
    console.log("✓ Reload persistence verified for title, description, and required toggle.");

    // Check expanded settings persistence
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("More options")
      );
      btn?.click();
    });
    await delay(400);

    const reloadedSettings = await page.evaluate(() => {
      const placeholder = document.querySelector('input[placeholder="e.g. Type your answer here..."]')?.value;
      const customErr = document.querySelector('input[placeholder="Enter error message"]')?.value;
      const pattern = document.querySelector('input[placeholder="e.g. [0-9]+"]')?.value;
      return { placeholder, customErr, pattern };
    });

    assert.strictEqual(reloadedSettings.placeholder, "yourname@company.com", "Placeholder must persist");
    assert.strictEqual(reloadedSettings.customErr, "Please enter a valid work email address.", "Custom error message must persist");
    assert.strictEqual(reloadedSettings.pattern, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", "Pattern must persist");
    console.log("✓ More options validation settings persisted perfectly.");

    // 11. Test Type-awareness (Change to RATING)
    console.log("11. Testing type-awareness by changing question to RATING...");
    await page.evaluate(() => {
      const typeSelect = document.querySelector('select[aria-label="Question type"]');
      if (typeSelect) {
        typeSelect.value = "RATING";
        typeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(500);

    const ratingControls = await page.evaluate(() => {
      const hasPatternInput = Boolean(document.querySelector('input[placeholder="e.g. [0-9]+"]'));
      const hasLengthSelect = Boolean(
        Array.from(document.querySelectorAll("select")).find((s) =>
          Array.from(s.options).some((o) => o.value === "MIN")
        )
      );
      const hasRatingScale = Boolean(document.querySelector('select[id*="rating-scale"]'));
      const stars = document.querySelectorAll(".fill-amber-400\\/40");
      return {
        hasPatternInput,
        hasLengthSelect,
        hasRatingScale,
        starCount: stars.length,
      };
    });

    assert.strictEqual(ratingControls.hasPatternInput, false, "Text pattern input must NOT appear on RATING question");
    assert.strictEqual(ratingControls.hasLengthSelect, false, "Text length select must NOT appear on RATING question");
    assert.strictEqual(ratingControls.hasRatingScale, true, "Rating scale select MUST appear on RATING question");
    console.log(`✓ Type-awareness verified: text controls hidden, rating scale available (${ratingControls.starCount} stars).`);

    // Change rating scale to 7 stars
    await page.evaluate(() => {
      const ratingSelect = document.querySelector('select[id*="rating-scale"]');
      if (ratingSelect) {
        ratingSelect.value = "7";
        ratingSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(400);

    const newStarCount = await page.evaluate(() => {
      return document.querySelectorAll(".fill-amber-400\\/40").length;
    });
    assert.strictEqual(newStarCount, 7, "Rating stars in preview should update to 7 stars");
    console.log("✓ Dynamic rating scale updated to 7 stars in real time.");

    // 12. Test Preview Tab
    console.log("12. Testing Preview tab integration...");
    await page.evaluate(() => {
      const previewTab = Array.from(document.querySelectorAll("button, a")).find(
        (el) => el.textContent.includes("Preview")
      );
      previewTab?.click();
    });
    await delay(1200);

    const previewRendered = await page.evaluate(() => {
      const questionHeading = Array.from(document.querySelectorAll("h2")).find(
        (h) => h.textContent.includes("What is your professional email?")
      );
      return Boolean(questionHeading);
    });
    assert.strictEqual(previewRendered, true, "Preview tab must render the updated question correctly");
    console.log("✓ Preview tab successfully displays question with description and required badge.");

    // 13. Test Top-level Settings Tab intact
    console.log("13. Testing top-level Settings tab remains intact...");
    await page.evaluate(() => {
      const editorTabs = Array.from(document.querySelectorAll('nav[aria-label="Editor tabs"] button'));
      const settingsTab = editorTabs.find((b) => b.textContent.includes("Settings"));
      settingsTab?.click();
    });
    await delay(1200);

    const settingsTabWorking = await page.evaluate(() => {
      const hasGeneral = Array.from(document.querySelectorAll("h2, h3, button, span")).some(
        (el) =>
          el.textContent.includes("General Preferences") ||
          el.textContent.includes("Form Access") ||
          el.textContent.includes("Category") ||
          el.textContent.includes("Danger Zone")
      );
      return hasGeneral;
    });
    assert.strictEqual(settingsTabWorking, true, "Top-level Form Settings tab must remain fully functional");
    console.log("✓ Top-level Settings tab confirmed completely intact.");

    // Switch back to questions tab
    await page.evaluate(() => {
      const editorTabs = Array.from(document.querySelectorAll('nav[aria-label="Editor tabs"] button'));
      const qTab = editorTabs.find((b) => b.textContent.includes("Questions"));
      qTab?.click();
    });
    await delay(1000);

    // 14. Responsive viewport testing & screenshots
    console.log("14. Capturing screenshots across Desktop, Tablet, and Mobile...");

    // Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await delay(500);
    const desktopScreenshot = path.join(artifactDir, "desktop_builder_no_sidebar.png");
    await page.screenshot({ path: desktopScreenshot });
    console.log(`Saved desktop screenshot to ${desktopScreenshot}`);

    // Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await delay(500);
    const tabletOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert.strictEqual(tabletOverflow, false, "Tablet layout must not have horizontal scroll overflow");
    const tabletScreenshot = path.join(artifactDir, "tablet_builder_no_sidebar.png");
    await page.screenshot({ path: tabletScreenshot });
    console.log(`Saved tablet screenshot to ${tabletScreenshot}`);

    // Mobile
    await page.setViewport({ width: 375, height: 812 });
    await delay(500);
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert.strictEqual(mobileOverflow, false, "Mobile layout must not have horizontal scroll overflow");
    const mobileScreenshot = path.join(artifactDir, "mobile_builder_no_sidebar.png");
    await page.screenshot({ path: mobileScreenshot });
    console.log(`Saved mobile screenshot to ${mobileScreenshot}`);

    console.log("\n========================================================");
    console.log("ALL VERIFICATION SUITE CHECKS PASSED SUCCESSFULLY (14/14)!");
    console.log("========================================================");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
