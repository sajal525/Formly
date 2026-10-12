const puppeteer = require("puppeteer-core");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runNothingThemeTestSuite() {
  console.log("=== Formly Nothing Theme & Live Preview Verification Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => console.log("[BROWSER CONSOLE]", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("[BROWSER ERROR]", err.message));
  page.on("response", async (res) => {
    if (res.url().includes("/draft")) {
      console.log("[DRAFT API RESPONSE]", res.status(), res.url(), await res.text().catch(() => ""));
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `nothing_tester_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log("1. Registering test user on localhost:3000...");
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

    // 3. Create test form initially with soft-lavender
    console.log("3. Creating test draft form in Neon PostgreSQL...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Untitled form",
        themeKey: "soft-lavender",
        definition: {
          schemaVersion: 1,
          title: "Untitled form",
          description: "Add a description (optional)",
          themeKey: "soft-lavender",
          blocks: [
            {
              id: "q-1",
              kind: "question",
              question: {
                id: "q-1",
                type: "SHORT_TEXT",
                label: "Untitled question",
                description: "",
                required: false,
                settings: { placeholder: "Short answer text" },
              },
            },
          ],
          questions: [
            {
              id: "q-1",
              kind: "question",
              type: "SHORT_TEXT",
              label: "Untitled question",
              description: "",
              required: false,
              settings: { placeholder: "Short answer text" },
            },
          ],
        },
      },
    });

    // 4. Open Form Builder and go to Theme tab
    console.log(`4. Opening Form Builder at http://127.0.0.1:3000/forms/${form.id}/edit...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll("button")).some((b) => b.textContent && b.textContent.includes("Theme"));
    }, { timeout: 15000 });
    await delay(1000);

    console.log("5. Switching to Theme tab...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const themeBtn = buttons.find((b) => b.textContent && b.textContent.includes("Theme"));
      if (themeBtn) themeBtn.click();
    });
    await delay(1000);

    // Verify Category Filter counts
    console.log("6. Verifying category filter pills and counts in Theme Gallery...");
    const categoryCounts = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('[role="tablist"] button'));
      return pills.map((p) => p.textContent?.trim());
    });
    console.log("Category pills observed:", categoryCounts);

    // Verify "Event" shows 1 (not 2)
    const eventPill = categoryCounts.find((c) => c && c.startsWith("Event"));
    assert.ok(eventPill && eventPill.includes("1"), `Event category must show 1 (found: ${eventPill})`);

    // Verify "Minimal" shows 3 (Minimal, Vintage, Nothing)
    const minimalPill = categoryCounts.find((c) => c && c.startsWith("Minimal"));
    assert.ok(minimalPill && minimalPill.includes("3"), `Minimal category must show 3 (found: ${minimalPill})`);

    // Verify Party / Event is absent and Nothing is present
    const cards = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('[role="radio"]'));
      return radios.map((r) => ({
        text: r.textContent?.trim(),
        ariaLabel: r.getAttribute("aria-label"),
        ariaChecked: r.getAttribute("aria-checked"),
      }));
    });

    const hasPartyCard = cards.some((c) => c.text?.includes("Party / Event"));
    assert.strictEqual(hasPartyCard, false, "Party / Event card must NOT exist in the gallery");

    const nothingCard = cards.find((c) => c.text?.includes("Nothing"));
    assert.ok(nothingCard, "Nothing theme card must exist in the gallery");
    assert.ok(nothingCard.text.includes("Minimal tech aesthetic"), "Nothing card must show 'Minimal tech aesthetic'");

    // 7. Click Nothing theme card and verify IMMEDIATE live preview update
    console.log("7. Clicking Nothing theme card...");
    await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('[role="radio"]'));
      const card = radios.find((r) => r.textContent?.includes("Nothing"));
      if (card) card.click();
    });

    // Check immediate local state update on the same frame / within 100ms
    await delay(100);
    const nothingCardState = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('[role="radio"]'));
      const card = radios.find((r) => r.textContent?.includes("Nothing"));
      return {
        isChecked: card?.getAttribute("aria-checked") === "true",
        hasActiveBadge: card?.textContent?.includes("Active"),
      };
    });
    assert.strictEqual(nothingCardState.isChecked, true, "Nothing card must be immediately checked");
    assert.strictEqual(nothingCardState.hasActiveBadge, true, "Nothing card must immediately show Active badge");
    console.log("Nothing card selected immediately!");

    // Check right-side Theme Preview panel immediately reflects Nothing
    console.log("8. Verifying Theme Preview panel immediately reflects Nothing theme...");
    const themePreviewState = await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll("h3"));
      const previewH3 = h3s.find((h) => h.textContent?.includes("Theme Preview"));
      const previewCard = previewH3?.closest("div.bg-white, div.dark\\:bg-slate-900, div.rounded-xl");
      // Look for theme name badge in preview header
      const headerText = previewCard?.textContent || "";
      const isShowingNothing = headerText.includes("Nothing");

      // Check submit button in preview surface
      const submitBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Submit Form"));
      const submitStyle = submitBtn ? window.getComputedStyle(submitBtn).backgroundColor : "";

      return {
        isShowingNothing,
        submitBtnBg: submitStyle,
      };
    });
    assert.strictEqual(themePreviewState.isShowingNothing, true, "Theme preview header must immediately show 'Nothing'");
    console.log("Theme Preview panel updated immediately with Nothing theme!");

    // 8. Wait for debounced autosave to complete
    console.log("9. Waiting for autosave confirmation...");
    await delay(2500);

    const savedForm = await prisma.form.findUnique({ where: { id: form.id } });
    assert.strictEqual(savedForm?.themeKey, "nothing", "Form themeKey in database must be 'nothing'");
    assert.strictEqual(savedForm?.definition?.themeKey, "nothing", "Definition JSON themeKey in DB must be 'nothing'");
    console.log("Autosave persisted themeKey: 'nothing' to Neon DB successfully!");

    // 9. Reload the page and verify persistence
    console.log("10. Refreshing page to verify persistence across reloads...");
    await page.goto("about:blank");
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll("button")).some((b) => b.textContent && b.textContent.includes("Theme"));
    }, { timeout: 15000 });
    await delay(1000);

    // Switch to Preview Tab
    console.log("11. Switching to Preview tab (B4 respondent preview)...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const prevBtn = buttons.find((b) => b.textContent && b.textContent.includes("Preview"));
      if (prevBtn) prevBtn.click();
    });
    await delay(1000);

    // Verify Nothing respondent view elements in Preview Canvas
    const previewCanvasCheck = await page.evaluate(() => {
      // Check for FORM 01 — text
      const bodyText = document.body.textContent || "";
      const hasForm01 = bodyText.includes("FORM") && bodyText.includes("01");
      const hasBuiltWithFormly = bodyText.includes("BUILT WITH FORMLY");
      const hasProgressLabel = bodyText.includes("P R O G R E S S");

      // Check submit button
      const buttons = Array.from(document.querySelectorAll("button"));
      const submitBtn = buttons.find((b) => b.textContent?.includes("Submit"));
      const submitBg = submitBtn ? window.getComputedStyle(submitBtn).backgroundColor : "";

      // Check number badge
      const numberBadge = document.querySelector("span.bg-red-600, span[style*='background-color: rgb(220, 38, 38)']");

      return {
        hasForm01,
        hasBuiltWithFormly,
        hasProgressLabel,
        hasSubmitBtn: Boolean(submitBtn),
        submitBg,
        hasNumberBadge: Boolean(numberBadge),
      };
    });

    console.log("Preview Canvas Nothing Inspection:", previewCanvasCheck);
    assert.strictEqual(previewCanvasCheck.hasForm01, true, "Preview must show 'FORM 01 —' metadata label");
    assert.strictEqual(previewCanvasCheck.hasBuiltWithFormly, true, "Preview must show 'BUILT WITH FORMLY —' footer");
    assert.strictEqual(previewCanvasCheck.hasProgressLabel, true, "Preview must show tracked 'P R O G R E S S' bar");
    assert.strictEqual(previewCanvasCheck.hasSubmitBtn, true, "Preview must have Submit button");

    // 12. Verify Standalone Preview URL /forms/[id]/preview
    console.log(`12. Navigating to Standalone Preview at http://127.0.0.1:3000/forms/${form.id}/preview...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/preview`, { waitUntil: "domcontentloaded" });
    await delay(1500);

    const standaloneCheck = await page.evaluate(() => {
      const text = document.body.textContent || "";
      return {
        hasProgress: text.includes("P R O G R E S S"),
        hasBuiltWithFormly: text.includes("BUILT WITH FORMLY"),
        hasForm01: text.includes("FORM") && text.includes("01"),
      };
    });
    assert.strictEqual(standaloneCheck.hasProgress, true, "Standalone preview must show Nothing progress bar");
    assert.strictEqual(standaloneCheck.hasBuiltWithFormly, true, "Standalone preview must show Nothing footer");
    console.log("Standalone respondent preview verified successfully!");

    console.log("\n==================================================================");
    console.log(">>> ALL 12 NOTHING THEME & LIVE PREVIEW TESTS PASSED WITH 100% SUCCESS <<<");
    console.log("==================================================================\n");
  } catch (error) {
    console.error("Test Suite Failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runNothingThemeTestSuite();
