const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("=== Starting Reliable Notifications Access Everywhere E2E Test ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("PAGE ERROR:", msg.text());
    }
  });

  try {
    // ------------------------------------------------------------------
    // STEP 1: REGISTER USER & CHECK DASHBOARD EMPTY STATE
    // ------------------------------------------------------------------
    const username = `notif_test_${Date.now().toString().slice(-6)}`;
    console.log(`\n1. Registering test user (${username})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", username);
    await page.type("#reg-password-input", "Password123!");
    const regSubmit = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regSubmit.click(),
    ]);

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    console.log("2. Verifying Bell on /dashboard...");
    let bellBtn = await page.waitForSelector('button[aria-label*="Notifications"]', { timeout: 5000 });
    assert.ok(bellBtn, "Bell button must exist on Dashboard");

    let ariaLabel = await page.evaluate((el) => el.getAttribute("aria-label"), bellBtn);
    console.log("Dashboard Bell aria-label:", ariaLabel);
    assert.ok(ariaLabel.includes("no unread"), "Initially unread should be 0");

    // Open popover on dashboard
    await bellBtn.click();
    let panel = await page.waitForSelector("#notifications-popover-panel", { timeout: 5000 });
    assert.ok(panel, "Panel must open on Dashboard");

    // Wait for skeleton loading to complete
    await page.waitForFunction(
      () => {
        const el = document.querySelector("#notifications-popover-panel");
        return el && el.innerText.includes("You're all caught up");
      },
      { timeout: 10000 }
    );

    let panelText = await page.evaluate((el) => el.innerText, panel);
    assert.ok(panelText.includes("You're all caught up"), "Must show empty state");
    assert.ok(panelText.includes("New form activity will appear here."), "Must show empty subtitle");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "notif_dashboard_open_panel.png") });
    console.log("✓ Saved notif_dashboard_open_panel.png");

    // Escape closes
    await page.keyboard.press("Escape");
    await delay(300);
    assert.strictEqual(await page.$("#notifications-popover-panel"), null, "Escape must close panel");

    // ------------------------------------------------------------------
    // STEP 2: VERIFY BELL VISIBLE & USABLE ON ALL AUTHENTICATED ROUTES
    // ------------------------------------------------------------------
    const routesToCheck = [
      "/my-forms",
      "/responses",
      "/analytics",
      "/profile",
      "/settings",
      "/trash",
    ];

    for (const route of routesToCheck) {
      console.log(`3. Checking Bell on ${route}...`);
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle0" });
      await delay(500);

      const routeBell = await page.waitForSelector('button[aria-label*="Notifications"]', { timeout: 5000 });
      assert.ok(routeBell, `Bell must exist on ${route}`);

      // Click to ensure it opens
      await routeBell.click();
      await delay(300);
      const routePanel = await page.waitForSelector("#notifications-popover-panel", { timeout: 5000 });
      assert.ok(routePanel, `Panel must open from ${route}`);

      // Close it
      await page.keyboard.press("Escape");
      await delay(300);
    }
    console.log("✓ All standard routes have working notification bell!");

    // ------------------------------------------------------------------
    // STEP 3: CREATE FORM & CHECK FORM BUILDER TABS
    // ------------------------------------------------------------------
    console.log("\n4. Creating a draft form to verify Form Builder views...");
    const createRes = await page.evaluate(async () => {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Notifications Test Form" }),
      });
      return res.json();
    });

    assert.ok(createRes.form?.id, "Form creation must succeed");
    const formId = createRes.form.id;
    console.log("Form created ID:", formId);

    const builderTabs = ["questions", "theme", "settings", "preview"];
    for (const tab of builderTabs) {
      console.log(`5. Checking Bell on Form Builder tab: ${tab}...`);
      await page.goto(`http://localhost:3000/forms/${formId}/edit?tab=${tab}`, { waitUntil: "networkidle0" });
      await delay(600);

      const builderBell = await page.waitForSelector('button[aria-label*="Notifications"]', { timeout: 5000 });
      assert.ok(builderBell, `Bell must exist on builder tab: ${tab}`);

      // Verify clicking opens real panel
      await builderBell.click();
      await delay(300);
      const builderPanel = await page.waitForSelector("#notifications-popover-panel", { timeout: 5000 });
      assert.ok(builderPanel, `Panel must open on builder tab: ${tab}`);

      // Verify panel content
      const bText = await page.evaluate((el) => el.innerText, builderPanel);
      assert.ok(bText.includes("Notifications"), "Must have Notifications title");
      assert.ok(bText.includes("Mark all as read"), "Must have Mark all as read");

      if (tab === "questions") {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, "notif_builder_open_panel.png") });
        console.log("✓ Saved notif_builder_open_panel.png");
      }

      await page.keyboard.press("Escape");
      await delay(300);
    }
    console.log("✓ Bell is available and opens real popover on ALL builder tabs!");

    // ------------------------------------------------------------------
    // STEP 4: PUBLISH FORM & RECEIVE REAL NOTIFICATION
    // ------------------------------------------------------------------
    console.log("\n6. Publishing form and submitting response to generate notification...");
    await page.evaluate(async (fId) => {
      await fetch(`/api/v1/forms/${fId}/publish`, { method: "POST" });
    }, formId);

    // Submit a public response
    const submitRes = await page.evaluate(async (fId) => {
      const res = await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: { feedback: "Antigravity reliable notifications test" },
        }),
      });
      return res.json();
    }, formId);
    assert.strictEqual(submitRes.success, true, "Submission must succeed");

    // Revisit Form Builder and verify badge shows 1
    console.log("7. Verifying unread badge in Form Builder...");
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    await delay(1200);

    const builderBellWithBadge = await page.waitForSelector('button[aria-label*="Notifications"]');
    const badgeText = await page.evaluate((el) => {
      const badge = el.querySelector("span");
      return badge ? badge.innerText.trim() : null;
    }, builderBellWithBadge);
    console.log("Form Builder Bell badge count:", badgeText);
    assert.strictEqual(badgeText, "1", "Badge text must be '1'");

    const builderAria = await page.evaluate((el) => el.getAttribute("aria-label"), builderBellWithBadge);
    console.log("Form Builder Bell aria-label:", builderAria);
    assert.ok(builderAria.includes("1 unread"), "Aria label must state 1 unread");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "notif_builder_badge_1.png") });
    console.log("✓ Saved notif_builder_badge_1.png");

    // Open panel in builder
    await builderBellWithBadge.click();
    await delay(400);

    const populatedBuilderPanel = await page.waitForSelector("#notifications-popover-panel");
    const notifItem = await page.waitForSelector("[data-notification-id]");
    assert.ok(notifItem, "Notification item must be rendered in Form Builder");

    const itemText = await page.evaluate((el) => el.innerText, notifItem);
    console.log("Notification item text in Builder:", itemText.replace(/\n/g, " "));
    assert.ok(itemText.includes("New Response Received"), "Must be response notification");

    // ------------------------------------------------------------------
    // STEP 5: CLICK ITEM -> MARKS READ & NAVIGATES TO RESPONSES
    // ------------------------------------------------------------------
    console.log("8. Clicking notification item from Form Builder to test navigation & mark read...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      notifItem.click(),
    ]);

    await delay(1000);
    const destUrl = page.url();
    console.log("Navigated to:", destUrl);
    assert.ok(destUrl.includes("/responses"), "Must navigate to Responses page");
    assert.ok(destUrl.includes(`formId=${formId}`), "Must contain formId in query");

    // Verify unread badge is cleared
    const clearedBell = await page.waitForSelector('button[aria-label*="Notifications"]');
    const clearedBadge = await page.evaluate((el) => el.querySelector("span"), clearedBell);
    assert.strictEqual(clearedBadge, null, "Badge must be removed when count is 0");

    const clearedAria = await page.evaluate((el) => el.getAttribute("aria-label"), clearedBell);
    console.log("Cleared Bell aria-label:", clearedAria);
    assert.ok(clearedAria.includes("no unread"), "Aria label must state no unread");

    // ------------------------------------------------------------------
    // STEP 6: TEST 'MARK ALL AS READ' PERSISTENCE
    // ------------------------------------------------------------------
    console.log("\n9. Testing 'Mark all as read' with multiple notifications...");
    await page.evaluate(async (fId) => {
      await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { test: 1 } }),
      });
      await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { test: 2 } }),
      });
    }, formId);

    // Go back to Form Builder
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    await delay(1200);

    const bell2 = await page.waitForSelector('button[aria-label*="Notifications"]');
    const count2 = await page.evaluate((el) => {
      const b = el.querySelector("span");
      return b ? b.innerText.trim() : null;
    }, bell2);
    console.log("Badge count with 2 new notifications:", count2);
    assert.strictEqual(count2, "2", "Badge must show 2");

    // Open popover
    await bell2.click();
    await delay(400);

    const markAllBtn = await page.evaluateHandle(() => {
      const panel = document.querySelector("#notifications-popover-panel");
      if (!panel) return null;
      const btns = Array.from(panel.querySelectorAll("button"));
      return btns.find((b) => b.innerText.includes("Mark all as read")) || null;
    });
    console.log("Clicking 'Mark all as read'...");
    await markAllBtn.click();
    await delay(600);

    // Verify badge cleared immediately
    const postMarkAllBadge = await page.evaluate((el) => el.querySelector("span"), bell2);
    assert.strictEqual(postMarkAllBadge, null, "Badge must clear immediately upon Mark all as read");

    // Reload page to verify database persistence
    console.log("10. Reloading page to verify persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1000);

    const persistedBell = await page.waitForSelector('button[aria-label*="Notifications"]');
    const persistedBadge = await page.evaluate((el) => el.querySelector("span"), persistedBell);
    assert.strictEqual(persistedBadge, null, "Badge must remain cleared after full reload");
    console.log("✓ Mark all as read successfully persisted in DB!");

    // ------------------------------------------------------------------
    // STEP 7: TEST RESPONSIVE VIEWPORTS (TABLET & MOBILE)
    // ------------------------------------------------------------------
    console.log("\n11. Testing Tablet Viewport (768x1024)...");
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    await delay(1000);

    let tabletBell = await page.waitForSelector('button[aria-label*="Notifications"]');
    assert.ok(tabletBell, "Bell must be present on Tablet");
    let tabletVisible = await page.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0;
    }, tabletBell);
    assert.strictEqual(tabletVisible, true, "Bell must be visible on Tablet (768px)");

    await tabletBell.click();
    await delay(400);
    let tabletPanel = await page.waitForSelector("#notifications-popover-panel");
    assert.ok(tabletPanel, "Popover must open on Tablet");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "notif_tablet_view.png") });
    console.log("✓ Saved notif_tablet_view.png");

    await page.keyboard.press("Escape");
    await delay(300);

    console.log("12. Testing Mobile Viewport (375x667)...");
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "networkidle0" });
    await delay(1000);

    let mobileBell = await page.waitForSelector('button[aria-label*="Notifications"]');
    assert.ok(mobileBell, "Bell must be present on Mobile");
    let mobileVisible = await page.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0;
    }, mobileBell);
    assert.strictEqual(mobileVisible, true, "Bell must be visible on Mobile (375px)");

    await mobileBell.click();
    await delay(400);
    let mobilePanel = await page.waitForSelector("#notifications-popover-panel");
    assert.ok(mobilePanel, "Popover must open on Mobile");

    // Check mobile panel bounds
    const panelBounds = await page.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    }, mobilePanel);
    console.log("Mobile panel bounds:", panelBounds);
    assert.ok(panelBounds.left >= 0, "Panel left must be within viewport");
    assert.ok(panelBounds.right <= 375 + 2, "Panel right must fit within 375px mobile viewport");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "notif_mobile_view.png") });
    console.log("✓ Saved notif_mobile_view.png");

    // Test outside click on mobile
    await page.mouse.click(10, 10);
    await delay(300);
    assert.strictEqual(await page.$("#notifications-popover-panel"), null, "Outside click must close panel on mobile");

    console.log("\n========================================================");
    console.log("🎉 ALL NOTIFICATIONS TESTS PASSED WITH 100% SUCCESS! 🎉");
    console.log("========================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTest();
