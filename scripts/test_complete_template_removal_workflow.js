const puppeteer = require("puppeteer-core");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runCompleteTemplateRemovalSuite() {
  console.log("============================================================");
  console.log("   Formly Complete Template Feature Removal E2E Verification");
  console.log("============================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `notpl_tester_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log(`\n1. Registering test user (${testUser})...`);
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
    console.log("✓ User registration successful.");

    // 2. Test Dashboard and AppShell
    console.log("\n2. Checking AppShell and Dashboard...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
    await delay(1500);

    // Sidebar: No Templates
    const sidebarLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("aside a, aside nav a"));
      return links.map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute("href"),
      }));
    });
    console.log("Sidebar Nav items found:", sidebarLinks.map((l) => l.text));
    const hasTemplatesSidebar = sidebarLinks.some(
      (l) => l.text.toLowerCase().includes("template") || l.href === "/templates"
    );
    assert.strictEqual(hasTemplatesSidebar, false, "Sidebar MUST NOT contain Templates navigation item");
    console.log("✓ Sidebar verified: 0 template items.");

    // Topbar Search placeholder
    const topbarSearchPlaceholder = await page.evaluate(() => {
      const input = document.querySelector("header input[type='text']");
      return input ? input.getAttribute("placeholder") : null;
    });
    console.log("Topbar search placeholder:", topbarSearchPlaceholder);
    assert.strictEqual(
      topbarSearchPlaceholder,
      "Search your forms...",
      "Topbar search placeholder must be 'Search your forms...'"
    );
    console.log("✓ Topbar search placeholder clean.");

    // Dashboard Quick Actions: 3 cards
    const quickActionTexts = await page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll("[data-testid='blank-form-card'], button, div")
      );
      const textSet = [];
      if (document.body.innerText.includes("Blank Form")) textSet.push("Blank Form");
      if (document.body.innerText.includes("Import with AI")) textSet.push("Import with AI");
      if (document.body.innerText.includes("Upload File")) textSet.push("Upload File");
      if (document.body.innerText.includes("Use Template")) textSet.push("Use Template");
      return textSet;
    });
    console.log("Quick actions found in Dashboard:", quickActionTexts);
    assert.ok(quickActionTexts.includes("Blank Form"), "Must preserve Blank Form");
    assert.ok(quickActionTexts.includes("Import with AI"), "Must preserve Import with AI");
    assert.ok(quickActionTexts.includes("Upload File"), "Must preserve Upload File");
    assert.strictEqual(
      quickActionTexts.includes("Use Template"),
      false,
      "Dashboard must NOT have 'Use Template' card"
    );
    console.log("✓ Dashboard Quick Actions: Exactly 3 preserved cards, 0 template cards.");

    // Right Rail: No Browse templates
    const hasRightRailBrowseTemplates = await page.evaluate(() => {
      return document.body.innerText.includes("Browse templates");
    });
    assert.strictEqual(
      hasRightRailBrowseTemplates,
      false,
      "Right rail must NOT have 'Browse templates'"
    );
    console.log("✓ Right Rail verified: 0 template references.");

    // 3. Test /templates route redirect
    console.log("\n3. Testing /templates route direct access...");
    await page.goto("http://127.0.0.1:3000/templates", { waitUntil: "domcontentloaded" });
    await delay(1500);
    const currentUrl = page.url();
    console.log("Navigated to /templates, current URL is:", currentUrl);
    assert.ok(
      currentUrl.includes("/dashboard"),
      "Direct navigation to /templates must redirect to /dashboard"
    );
    console.log("✓ Route /templates cleanly redirects to /dashboard.");

    // 4. Test /my-forms dropdown
    console.log("\n4. Testing /my-forms Create Form dropdown...");
    await page.goto("http://127.0.0.1:3000/my-forms", { waitUntil: "domcontentloaded" });
    await delay(1000);

    // Open Create Form dropdown
    await page.waitForSelector("button");
    // Find button containing 'Create Form'
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cfBtn = btns.find((b) => b.textContent.includes("Create Form"));
      if (cfBtn) cfBtn.click();
    });
    await delay(500);

    const myFormsDropdownTexts = await page.evaluate(() => {
      return document.body.innerText;
    });
    assert.ok(myFormsDropdownTexts.includes("Blank Form"), "My Forms must preserve Blank Form in dropdown");
    assert.strictEqual(
      myFormsDropdownTexts.includes("From Template"),
      false,
      "My Forms dropdown must NOT contain 'From Template'"
    );
    console.log("✓ My Forms header verified: 'From Template' removed, 'Blank Form' preserved.");

    // 5. Test /trash categories
    console.log("\n5. Testing /trash categories...");
    await page.goto("http://127.0.0.1:3000/trash", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const trashPills = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.map((b) => b.textContent.trim()).filter((t) => t.length > 0);
    });
    console.log("Trash buttons/categories found:", trashPills);
    const hasTemplatesTrash = trashPills.some((t) => t.toLowerCase().startsWith("templates"));
    assert.strictEqual(hasTemplatesTrash, false, "Trash toolbar must NOT contain Templates category tab");
    console.log("✓ Trash verified: 0 templates tab.");

    // 6. Test /settings Default Landing Page options
    console.log("\n6. Testing /settings landing page options...");
    await page.goto("http://127.0.0.1:3000/settings", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const landingPageOptions = await page.evaluate(() => {
      const select = document.querySelector("#default-landing-page");
      if (!select) return [];
      return Array.from(select.options).map((o) => ({
        value: o.value,
        text: o.text,
      }));
    });
    console.log("Landing page select options:", landingPageOptions);
    const hasTemplateSetting = landingPageOptions.some(
      (o) => o.value === "templates" || o.text.toLowerCase().includes("template")
    );
    assert.strictEqual(hasTemplateSetting, false, "Settings must NOT have Templates landing page option");
    console.log("✓ Settings verified: 0 templates options.");

    // 7. Test /profile Account Stats
    console.log("\n7. Testing /profile Account Stats...");
    await page.goto("http://127.0.0.1:3000/profile", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const profileText = await page.evaluate(() => document.body.innerText);
    assert.strictEqual(
      profileText.includes("Templates Used"),
      false,
      "Profile stats must NOT contain 'Templates Used'"
    );
    assert.ok(profileText.includes("Draft Forms"), "Profile stats should display Draft Forms");
    assert.strictEqual(
      profileText.includes("Shared global templates"),
      false,
      "Profile must NOT contain shared global templates notice"
    );
    console.log("✓ Profile verified: 'Draft Forms' present, 0 templates references.");

    // 8. Test /responses empty state
    console.log("\n8. Testing /responses empty state...");
    await page.goto("http://127.0.0.1:3000/responses", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const responsesText = await page.evaluate(() => document.body.innerText);
    assert.strictEqual(
      responsesText.includes("Browse Templates"),
      false,
      "Responses empty state must NOT have 'Browse Templates'"
    );
    assert.strictEqual(
      responsesText.includes("templates catalogue"),
      false,
      "Responses empty state text must NOT mention templates"
    );
    console.log("✓ Responses empty state clean: 0 template references.");

    // 9. Test /analytics empty state
    console.log("\n9. Testing /analytics empty state...");
    await page.goto("http://127.0.0.1:3000/analytics", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const analyticsText = await page.evaluate(() => document.body.innerText);
    assert.strictEqual(
      analyticsText.includes("Browse Templates"),
      false,
      "Analytics empty state must NOT have 'Browse Templates'"
    );
    console.log("✓ Analytics empty state clean: 0 template references.");

    // 10. Test Blank Form Creation flow
    console.log("\n10. Testing Blank Form creation functionality...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
    await delay(1000);

    const blankFormBtnClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("button, div"));
      const blankCard = cards.find(
        (el) =>
          el.tagName === "BUTTON" &&
          el.textContent.includes("Blank Form") &&
          el.textContent.includes("Start from scratch")
      );
      if (blankCard) {
        blankCard.click();
        return true;
      }
      return false;
    });

    assert.ok(blankFormBtnClicked, "Blank Form button must be clickable on Dashboard");
    console.log("Clicked Blank Form card, waiting for editor navigation...");
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 });
    await delay(1500);

    const editorUrl = page.url();
    console.log("Editor URL:", editorUrl);
    assert.ok(
      editorUrl.includes("/forms/") && editorUrl.includes("/edit"),
      "Must navigate to /forms/[id]/edit"
    );
    console.log("✓ Blank Form creation verified: editor successfully loaded at", editorUrl);

    // Check for severe console errors
    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("favicon") &&
        !err.includes("hydration") &&
        !err.includes("Download the React DevTools")
    );
    console.log("\nConsole errors encountered:", fatalErrors);
    assert.strictEqual(fatalErrors.length, 0, "There should be no unexpected console errors");

    console.log("\n============================================================");
    console.log("🎉 ALL TESTS PASSED: Templates feature 100% removed cleanly!");
    console.log("============================================================");
  } catch (err) {
    console.error("Test failure:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runCompleteTemplateRemovalSuite();
