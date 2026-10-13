const puppeteer = require("puppeteer-core");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDashboardTemplateRemovalSuite() {
  console.log("=== Formly Dashboard Template Removal Verification Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `dash_tester_${timestamp}`;
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

    // 2. Navigate to Dashboard
    console.log("2. Navigating to Dashboard at http://127.0.0.1:3000/dashboard...");
    await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
    await delay(1500);

    // TEST 1: Waving hand emoji removed from greeting
    console.log("TEST 1: Verifying waving hand emoji is removed next to user's name...");
    const greetingInfo = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return {
        text: h1 ? h1.textContent : "",
        html: h1 ? h1.innerHTML : "",
        hasHandEmoji: h1 ? h1.textContent.includes("👋") : false,
      };
    });
    console.log("Greeting Info:", greetingInfo);
    assert.strictEqual(greetingInfo.hasHandEmoji, false, "Greeting must NOT contain waving hand emoji 👋");
    assert.ok(greetingInfo.text.includes(testUser), `Greeting must include user name ${testUser}`);

    // TEST 2: "Use Template" card removed from Quick Action section
    console.log("TEST 2: Verifying 'Use Template' card is removed from quick-actions...");
    const quickActionCards = await page.evaluate(() => {
      // The quick actions container has buttons and divs
      const quickStartContainer = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-3");
      if (!quickStartContainer) return null;
      const cards = Array.from(quickStartContainer.children);
      return {
        count: cards.length,
        titles: cards.map((c) => {
          const titleEl = c.querySelector("h2");
          return titleEl ? titleEl.textContent.trim() : "";
        }),
      };
    });
    console.log("Quick Action Cards observed:", quickActionCards);
    assert.ok(quickActionCards, "Quick start grid must exist with 3 columns (grid-cols-1 sm:grid-cols-3)");
    assert.strictEqual(quickActionCards.count, 3, "There must be exactly 3 quick action cards");
    assert.strictEqual(quickActionCards.titles.includes("Use Template"), false, "'Use Template' card must NOT exist");
    assert.deepStrictEqual(quickActionCards.titles, ["Blank Form", "Import with AI", "Upload File"]);

    // TEST 3: Popular Templates section and Curated Template Gallery completely removed
    console.log("TEST 3: Verifying 'Popular Templates' heading and 'Curated Template Gallery' are removed...");
    const templateSectionCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent || "";
      const hasPopularTemplates = bodyText.includes("Popular Templates");
      const hasCuratedTemplateGallery = bodyText.includes("Curated Template Gallery");
      const hasBrowseTemplates = bodyText.includes("Browse templates");
      const hasTemplateDescription = bodyText.includes("Pre-built templates for student registration");
      return {
        hasPopularTemplates,
        hasCuratedTemplateGallery,
        hasBrowseTemplates,
        hasTemplateDescription,
      };
    });
    console.log("Template Section Check:", templateSectionCheck);
    assert.strictEqual(templateSectionCheck.hasPopularTemplates, false, "'Popular Templates' must NOT exist in the dashboard");
    assert.strictEqual(templateSectionCheck.hasCuratedTemplateGallery, false, "'Curated Template Gallery' must NOT exist in the dashboard");
    assert.strictEqual(templateSectionCheck.hasBrowseTemplates, false, "'Browse templates' must NOT exist in the dashboard");
    assert.strictEqual(templateSectionCheck.hasTemplateDescription, false, "Template description must NOT exist in the dashboard");

    // TEST 4: Check "+ Create Form" dropdown options (must not have "Use Template")
    console.log("TEST 4: Verifying '+ Create Form' dropdown options...");
    // Click dropdown chevron
    const dropdownChevron = await page.$('button[aria-label="More creation options"]');
    assert.ok(dropdownChevron, "Dropdown chevron button must exist");
    await dropdownChevron.click();
    await delay(300);

    const dropdownOptions = await page.evaluate(() => {
      const dropdown = document.querySelector('div.absolute.right-0.mt-2');
      if (!dropdown) return null;
      return {
        text: dropdown.textContent || "",
        hasUseTemplate: (dropdown.textContent || "").includes("Use Template"),
        hasTemplatesLink: Boolean(dropdown.querySelector('a[href="/templates"]')),
      };
    });
    console.log("Dropdown Options Check:", dropdownOptions);
    assert.ok(dropdownOptions, "Dropdown menu must be open");
    assert.strictEqual(dropdownOptions.hasUseTemplate, false, "Dropdown must NOT contain 'Use Template'");
    assert.strictEqual(dropdownOptions.hasTemplatesLink, false, "Dropdown must NOT contain link to /templates");

    // TEST 5: Verify creating blank form still works
    console.log("TEST 5: Testing Blank Form creation action from quick start...");
    // Close dropdown if open
    await page.click("body", { offset: { x: 5, y: 5 } });
    await delay(300);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const blankBtn = buttons.find((b) => b.textContent && b.textContent.includes("Blank Form"));
      if (blankBtn) blankBtn.click();
    });

    await page.waitForFunction(() => window.location.pathname.includes("/forms/") && window.location.pathname.includes("/edit"), { timeout: 15000 });
    const currentUrl = page.url();
    console.log("URL after clicking Blank Form:", currentUrl);
    assert.ok(currentUrl.includes("/forms/") && currentUrl.includes("/edit"), "Clicking Blank Form must redirect to form editor");

    console.log("\n==================================================================");
    console.log(">>> ALL DASHBOARD TEMPLATE REMOVAL TESTS PASSED WITH 100% SUCCESS <<<");
    console.log("==================================================================\n");
  } catch (error) {
    console.error("Test Suite Failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runDashboardTemplateRemovalSuite();
