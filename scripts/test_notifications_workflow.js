const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("=== Starting Formly Notifications Popover E2E Test ===");
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
    // -------------------------------------------------------------
    // 1. REGISTER USER 1 & TEST EMPTY NOTIFICATIONS STATE
    // -------------------------------------------------------------
    const user1 = `notif_owner_${Date.now().toString().slice(-6)}`;
    console.log(`1. Registering User 1 (${user1})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", user1);
    await page.type("#reg-password-input", "Password123456!");
    const regSubmit = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regSubmit.click(),
    ]);

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    // Verify Bell button
    console.log("2. Verifying topbar Bell button in initial state...");
    const bellBtn = await page.waitForSelector('button[aria-label*="Notifications"]');
    assert.ok(bellBtn, "Bell button must exist in topbar");

    const bellLabel = await page.evaluate((el) => el.getAttribute("aria-label"), bellBtn);
    console.log("Initial Bell aria-label:", bellLabel);
    assert.ok(bellLabel.includes("no unread") || bellLabel.includes("0"), "Initial badge should be 0 unread");

    // Click Bell to open Popover
    console.log("3. Opening Notifications Popover...");
    await bellBtn.click();
    await delay(400);

    // Verify popover panel opened
    const popoverPanel = await page.waitForSelector("#notifications-popover-panel", { timeout: 5000 });
    assert.ok(popoverPanel, "Notifications popover panel must open");

    // Wait for loading spinner to finish
    await page.waitForFunction(
      () => {
        const panel = document.querySelector("#notifications-popover-panel");
        return panel && !panel.innerText.includes("Loading notifications...");
      },
      { timeout: 10000 }
    );

    // Verify empty state text matching reference screenshot
    const popoverText = await page.evaluate((el) => el.innerText, popoverPanel);
    console.log("Empty popover text:\n", popoverText);
    assert.ok(popoverText.includes("Notifications"), "Must have 'Notifications' title");
    assert.ok(popoverText.includes("Mark all as read"), "Must have 'Mark all as read'");
    assert.ok(popoverText.includes("All"), "Must have 'All' filter");
    assert.ok(popoverText.includes("Unread"), "Must have 'Unread' filter");
    assert.ok(popoverText.includes("You're all caught up"), "Must display 'You\\'re all caught up'");
    assert.ok(popoverText.includes("New form activity will appear here."), "Must display subtitle");
    assert.ok(popoverText.includes("No new notifications"), "Must display 'No new notifications' note");

    // Capture Empty State screenshot (matching reference screenshot)
    const emptyScreenshot = path.join(ARTIFACT_DIR, "notifications_empty_state.png");
    await page.screenshot({ path: emptyScreenshot });
    console.log("✓ Empty state screenshot saved:", emptyScreenshot);

    // Test filter switching
    console.log("4. Testing filter pills (All / Unread)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("#notifications-popover-panel button"));
      const unreadBtn = btns.find((b) => b.textContent.trim().startsWith("Unread"));
      if (unreadBtn) unreadBtn.click();
    });
    await delay(300);

    // Popover must remain open after filter click
    const panelStillOpen = await page.$("#notifications-popover-panel");
    assert.ok(panelStillOpen, "Panel must stay open when switching filters");

    // Test Escape key closes popover
    console.log("5. Testing Escape key dismiss...");
    await page.keyboard.press("Escape");
    await delay(300);
    const panelClosed = await page.$("#notifications-popover-panel");
    assert.strictEqual(panelClosed, null, "Panel must close on Escape key");

    // -------------------------------------------------------------
    // 2. CREATE A FORM AND SUBMIT A REAL RESPONSE
    // -------------------------------------------------------------
    console.log("6. Creating a published form to test real response submission...");
    const createFormRes = await page.evaluate(async () => {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Customer Feedback Form" }),
      });
      return res.json();
    });

    assert.ok(createFormRes.form?.id, "Form must be created successfully");
    const formId = createFormRes.form.id;
    console.log("Created form ID:", formId);

    // Publish the form
    const pubResult = await page.evaluate(async (fId) => {
      const res = await fetch(`/api/v1/forms/${fId}/publish`, { method: "POST" });
      return { status: res.status, data: await res.json() };
    }, formId);
    console.log("Publish form result:", pubResult);

    // Submit a public response to this form (triggering transaction and createNotification)
    console.log("7. Submitting a real response to the form...");
    const submitResult = await page.evaluate(async (fId) => {
      const res = await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: { "q-feedback": "Formly works exceptionally well!" },
        }),
      });
      return res.json();
    }, formId);
    console.log("Submission result:", submitResult);
    assert.strictEqual(submitResult.success, true, "Form submission must succeed");
    assert.ok(submitResult.responseId, "Submission must return responseId");

    // -------------------------------------------------------------
    // 3. VERIFY NOTIFICATION RECEIVED & BADGE SHOWN
    // -------------------------------------------------------------
    console.log("8. Refocusing and verifying unread notification received...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1200);

    const updatedBellLabel = await page.$eval('button[aria-label*="Notifications"]', (el) =>
      el.getAttribute("aria-label")
    );
    console.log("Bell aria-label after response:", updatedBellLabel);
    assert.ok(updatedBellLabel.includes("1 unread"), "Badge must reflect 1 unread notification");

    // Open Popover to view populated list
    console.log("9. Opening Popover with populated notification...");
    await page.click('button[aria-label*="Notifications"]');
    await page.waitForSelector('[data-notification-id]', { timeout: 10000 });

    const populatedPanel = await page.waitForSelector("#notifications-popover-panel");
    const populatedText = await page.evaluate((el) => el.innerText, populatedPanel);
    console.log("Populated popover text:\n", populatedText);
    assert.ok(populatedText.includes("New Response Received"), "Must show 'New Response Received' title");
    assert.ok(populatedText.includes("Customer Feedback Form"), "Must mention form title in message");
    assert.ok(populatedText.includes("Just now") || populatedText.includes("m ago"), "Must have relative time");

    // Capture populated popover screenshot
    const populatedScreenshot = path.join(ARTIFACT_DIR, "notifications_populated_state.png");
    await page.screenshot({ path: populatedScreenshot });
    console.log("✓ Populated state screenshot saved:", populatedScreenshot);

    // -------------------------------------------------------------
    // 4. CLICK NOTIFICATION ITEM -> MARKS READ & NAVIGATES TO ROUTE
    // -------------------------------------------------------------
    console.log("10. Clicking notification item to test read persistence & routing...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      page.evaluate(() => {
        const item = document.querySelector('[data-notification-id]');
        if (item) item.click();
      }),
    ]);

    await delay(1000);
    const currentUrl = page.url();
    console.log("Navigated to destination:", currentUrl);
    assert.ok(currentUrl.includes("/responses"), "Must navigate to Responses page");
    assert.ok(currentUrl.includes(`formId=${formId}`), "Must pass formId in destination query");

    // Verify unread badge is now 0 after reading
    const readBellLabel = await page.$eval('button[aria-label*="Notifications"]', (el) =>
      el.getAttribute("aria-label")
    );
    console.log("Bell aria-label after reading item:", readBellLabel);
    assert.ok(readBellLabel.includes("no unread") || readBellLabel.includes("0"), "Badge must reset to 0");

    // -------------------------------------------------------------
    // 5. TEST MARK ALL AS READ WITH MULTIPLE NOTIFICATIONS
    // -------------------------------------------------------------
    console.log("11. Submitting 2 more responses to test 'Mark all as read'...");
    await page.evaluate(async (fId) => {
      await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { test: "A" } }),
      });
      await fetch(`/api/public/forms/${fId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { test: "B" } }),
      });
    }, formId);

    await page.reload({ waitUntil: "networkidle0" });
    await delay(1000);

    const multiBellLabel = await page.$eval('button[aria-label*="Notifications"]', (el) =>
      el.getAttribute("aria-label")
    );
    console.log("Bell aria-label with 2 unread:", multiBellLabel);
    assert.ok(multiBellLabel.includes("2 unread"), "Badge must reflect 2 unread");

    // Open and click "Mark all as read"
    console.log("12. Clicking 'Mark all as read'...");
    await page.click('button[aria-label*="Notifications"]');
    await delay(400);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("#notifications-popover-panel button"));
      const markAll = btns.find((b) => b.textContent.includes("Mark all as read"));
      if (markAll) markAll.click();
    });
    await delay(1800);

    const afterMarkAllLabel = await page.$eval('button[aria-label*="Notifications"]', (el) =>
      el.getAttribute("aria-label")
    );
    console.log("Bell aria-label after Mark all as read:", afterMarkAllLabel);
    assert.ok(
      afterMarkAllLabel.includes("no unread") || afterMarkAllLabel.includes("0"),
      "Badge must be 0 after Mark all as read"
    );

    // -------------------------------------------------------------
    // 6. TEST USER ISOLATION
    // -------------------------------------------------------------
    console.log("13. Registering User 2 to test user isolation...");
    const context2 = await browser.createBrowserContext();
    const page2 = await context2.newPage();
    await page2.setViewport({ width: 1280, height: 800 });

    const user2 = `notif_other_${Date.now().toString().slice(-6)}`;
    await page2.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page2.type("#reg-username-input", user2);
    await page2.type("#reg-password-input", "Password123456!");
    const regSubmit2 = await page2.$('button[type="submit"]');
    await Promise.all([
      page2.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regSubmit2.click(),
    ]);

    await page2.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    const user2Notifications = await page2.evaluate(async () => {
      const res = await fetch("/api/v1/notifications");
      return res.json();
    });
    console.log("User 2 notifications count:", user2Notifications.notifications?.length);
    assert.strictEqual(
      user2Notifications.notifications.length,
      0,
      "User 2 must NOT see any notifications from User 1"
    );

    console.log("\n=======================================================");
    console.log("🎉 ALL NOTIFICATIONS POPOVER TESTS PASSED PERFECTLY!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
