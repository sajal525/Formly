const puppeteer = require("puppeteer-core");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runIconFilterExpansionSuite() {
  console.log("============================================================");
  console.log("  My Forms Compact Icon Filter Expansion E2E Verification  ");
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
  const testUser = `filter_tester_${timestamp}`;
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

    // 2. Navigate to /my-forms
    console.log("\n2. Navigating to /my-forms...");
    await page.goto("http://127.0.0.1:3000/my-forms", { waitUntil: "domcontentloaded" });
    await delay(1500);

    // 3. Inspect filter buttons in default collapsed state
    console.log("\n3. Inspecting compact icon-only filter buttons in default state...");
    const filterButtons = await page.evaluate(() => {
      const container = document.querySelector('div[role="tablist"]');
      if (!container) return [];
      const buttons = Array.from(container.querySelectorAll('button[role="tab"]'));
      return buttons.map((b) => {
        const rect = b.getBoundingClientRect();
        const hasGradient =
          b.className.includes("bg-gradient-to-r") ||
          window.getComputedStyle(b).backgroundImage.includes("gradient");
        const title = b.getAttribute("title");
        const ariaLabel = b.getAttribute("aria-label");
        const isSelected = b.getAttribute("aria-selected") === "true";
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          hasGradient,
          title,
          ariaLabel,
          isSelected,
        };
      });
    });

    console.log("Filter buttons info:", filterButtons);
    assert.strictEqual(filterButtons.length, 5, "There must be exactly 5 filter buttons (All, Drafts, Published, Closed, Archived)");

    // In default desktop state, inactive buttons must be compact (under 50px wide)
    for (const btn of filterButtons) {
      assert.ok(btn.width <= 50, `Default button should be compact (<= 50px), got ${btn.width}px`);
      assert.ok(btn.title, "Each button must have a title tooltip attribute");
      assert.ok(btn.ariaLabel, "Each button must have an aria-label");
    }

    // Active button ("All") must have Formly's purple gradient
    assert.ok(filterButtons[0].isSelected, "First button ('All') must be selected by default");
    assert.ok(filterButtons[0].hasGradient, "Active button must have purple gradient highlight");
    console.log("✓ All 5 filter buttons are compact icon buttons in default state.");
    console.log("✓ Active filter button is highlighted in Formly's purple gradient.");

    // 4. Test hover expansion
    console.log("\n4. Testing hover expansion on Drafts filter button...");
    const buttons = await page.$$('div[role="tablist"] button[role="tab"]');
    const draftsButton = buttons[1]; // Drafts is second tab

    const initialDraftsWidth = await page.evaluate((el) => el.getBoundingClientRect().width, draftsButton);
    console.log(`Initial Drafts button width: ${initialDraftsWidth}px`);

    // Hover over Drafts button
    await draftsButton.hover();
    await delay(400); // Allow 300ms transition to complete

    const expandedDraftsInfo = await page.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const textContainer = el.querySelector("div.overflow-hidden");
      const labelText = textContainer ? textContainer.textContent : "";
      return {
        width: Math.round(rect.width),
        labelText,
      };
    }, draftsButton);
    console.log("Hovered Drafts button info:", expandedDraftsInfo);
    assert.ok(
      expandedDraftsInfo.width > initialDraftsWidth + 25,
      `Drafts button must expand on hover (was ${initialDraftsWidth}px, now ${expandedDraftsInfo.width}px)`
    );
    assert.ok(
      expandedDraftsInfo.labelText.includes("Drafts"),
      "Drafts label text must be revealed on hover"
    );
    console.log("✓ Hover expansion smoothly revealed label and form count.");

    // 5. Test collapse on cursor leave
    console.log("\n5. Testing collapse when cursor leaves...");
    // Move cursor somewhere neutral (e.g. page title)
    await page.hover("h1");
    await delay(400); // Allow 300ms transition to complete

    const collapsedDraftsWidth = await page.evaluate((el) => Math.round(el.getBoundingClientRect().width), draftsButton);
    console.log(`Collapsed Drafts button width: ${collapsedDraftsWidth}px`);
    assert.ok(
      collapsedDraftsWidth <= 50,
      `Drafts button must collapse back to compact state (<= 50px), got ${collapsedDraftsWidth}px`
    );
    console.log("✓ Button smoothly collapsed back to compact icon when cursor left.");

    // 6. Test clicking to filter (activate Drafts)
    console.log("\n6. Testing click to activate Drafts filter...");
    await draftsButton.click();
    await delay(1200);

    const isDraftsActive = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('div[role="tablist"] button[role="tab"]'));
      const draftsTab = tabs[1];
      const isSelected = draftsTab.getAttribute("aria-selected") === "true";
      const hasGradient =
        draftsTab.className.includes("bg-gradient-to-r") ||
        window.getComputedStyle(draftsTab).backgroundImage.includes("gradient");
      return isSelected && hasGradient;
    });
    assert.ok(isDraftsActive, "Drafts button must be active with purple gradient highlight");
    console.log("✓ Drafts filter activated with purple gradient highlight.");

    // 7. Verify search, sort, and view toggle controls are fully preserved
    console.log("\n7. Verifying search, sort, and list/grid controls...");
    const controls = await page.evaluate(() => {
      const searchInput = document.querySelector('input[placeholder="Search forms..."]');
      const sortButton = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Last updated")
      );
      const listButton = document.querySelector('button[title="List view"]');
      const gridButton = document.querySelector('button[title="Grid view"]');
      return {
        hasSearch: Boolean(searchInput),
        hasSort: Boolean(sortButton),
        hasList: Boolean(listButton),
        hasGrid: Boolean(gridButton),
      };
    });
    assert.ok(controls.hasSearch, "Search input must be preserved");
    assert.ok(controls.hasSort, "Sort dropdown must be preserved");
    assert.ok(controls.hasList, "List view button must be preserved");
    assert.ok(controls.hasGrid, "Grid view button must be preserved");
    console.log("✓ All controls preserved (search, sort, view toggles).");

    // 8. Capture screenshot of compact and hovered states
    console.log("\n8. Capturing visual verification screenshots...");
    const freshButtons = await page.$$('div[role="tablist"] button[role="tab"]');
    const publishedButton = freshButtons[2];
    await publishedButton.hover();
    await delay(350);

    const screenshotPath = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981\\my_forms_icon_filters.png";
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log("Screenshot saved to:", screenshotPath);

    // Check console errors
    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("favicon") &&
        !err.includes("hydration") &&
        !err.includes("Download the React DevTools")
    );
    assert.strictEqual(fatalErrors.length, 0, "No console errors allowed");

    console.log("\n============================================================");
    console.log("🎉 ALL TESTS PASSED: Icon filter buttons expand smoothly!");
    console.log("============================================================");
  } catch (err) {
    console.error("Test failure:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runIconFilterExpansionSuite();
