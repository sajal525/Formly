const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("=== Starting My Forms Icon Filters & No-Scrollbar E2E Test ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  try {
    // 1. Register test user
    const username = `filter_tester_${Date.now().toString().slice(-6)}`;
    console.log(`1. Registering test user (${username})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", username);
    await page.type("#reg-password-input", "Password123456!");
    const regBtn = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regBtn.click(),
    ]);

    // 2. Test across multiple viewports matching the user screenshot
    const viewports = [
      { name: "desktop_1280", width: 1280, height: 800 },
      { name: "desktop_1440", width: 1440, height: 900 },
      { name: "tablet_768", width: 768, height: 1024 },
      { name: "mobile_375", width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      console.log(`\n2. Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
      await delay(800);

      // Force Light mode first (as shown in user screenshot)
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      });
      await delay(300);

      // Inspect tablist container
      const containerMetrics = await page.evaluate(() => {
        const tablist = document.querySelector('div[role="tablist"]');
        if (!tablist) return null;
        const style = window.getComputedStyle(tablist);
        return {
          clientWidth: tablist.clientWidth,
          scrollWidth: tablist.scrollWidth,
          clientHeight: tablist.clientHeight,
          scrollHeight: tablist.scrollHeight,
          overflowX: style.overflowX,
          scrollbarWidth: style.scrollbarWidth,
        };
      });

      console.log(`Container metrics (${vp.name}):`, containerMetrics);
      assert.ok(containerMetrics, "Tablist container must exist");

      // Verify no scrollbar overflow on desktop/tablet
      if (vp.width >= 768) {
        assert.ok(
          containerMetrics.scrollWidth <= containerMetrics.clientWidth + 2,
          "Container must not overflow horizontally on desktop/tablet"
        );
      }

      // 3. Test Hover on each filter button
      const buttons = await page.$$('div[role="tablist"] button[role="tab"]');
      assert.strictEqual(buttons.length, 5, "Must render exactly 5 filter buttons (All, Drafts, Published, Closed, Archived)");

      // Hover over 'Drafts' (index 1)
      console.log(`Hovering over Drafts tab on ${vp.name}...`);
      await buttons[1].hover();
      await delay(400);

      // Verify expansion of the label and count
      const isExpanded = await page.evaluate((btn) => {
        const labelDiv = btn.querySelector("div:not([role='tooltip'])");
        return labelDiv ? labelDiv.clientWidth > 0 : false;
      }, buttons[1]);
      console.log("Drafts tab expanded on hover:", isExpanded);
      assert.ok(isExpanded, "Button label must expand on hover");

      // Capture screenshot in light mode matching user screenshot
      if (vp.name === "desktop_1280") {
        const lightScreenshot = path.join(ARTIFACT_DIR, "my_forms_no_scrollbar_light.png");
        await page.screenshot({ path: lightScreenshot });
        console.log("✓ Saved Light Mode screenshot:", lightScreenshot);
      }

      // Hover over 'Published' (index 2)
      await buttons[2].hover();
      await delay(300);

      // 4. Test clicking to filter
      console.log("Clicking 'Published' filter button...");
      await buttons[2].click();
      await page.waitForFunction(
        () => window.location.search.includes("status=published") || document.querySelector('button[role="tab"][aria-selected="true"]')?.getAttribute("title")?.startsWith("Published"),
        { timeout: 8000 }
      );
      console.log("✓ Published filter active");

      // Test Dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await delay(300);

      if (vp.name === "desktop_1280") {
        const darkScreenshot = path.join(ARTIFACT_DIR, "my_forms_no_scrollbar_dark.png");
        await page.screenshot({ path: darkScreenshot });
        console.log("✓ Saved Dark Mode screenshot:", darkScreenshot);
      }
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL MY FORMS ICON FILTERS & NO-SCROLLBAR TESTS PASSED!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
