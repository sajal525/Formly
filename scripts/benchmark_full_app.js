const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Formly End-to-End Click & API Benchmark ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const metrics = [];

  function record(action, type, durationMs, details = "") {
    metrics.push({ action, type, durationMs, details });
    console.log(`[${type}] ${action}: ${durationMs.toFixed(1)}ms ${details}`);
  }

  // Intercept requests to measure API response times
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/api/")) {
      const timing = res.timing();
      const status = res.status();
      const duration = timing ? timing.responseEnd : 0;
      // We can also track from request
    }
  });

  const ts = Date.now().toString().slice(-6);
  const username = `perf_user_${ts}`;
  const password = "PerfPassword123!";

  try {
    // 1. Register & warm session
    console.log("\n--- Phase 1: Authentication & Initial Page Loads ---");
    let t0 = performance.now();
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    record("Initial /register load (cold)", "PAGE_LOAD", performance.now() - t0);

    await delay(500);
    t0 = performance.now();
    const regRes = await page.evaluate(async (u, p) => {
      const r = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      return { status: r.status };
    }, username, password);
    record("POST /api/v1/auth/register", "API_WRITE", performance.now() - t0, `status ${regRes.status}`);

    // Dashboard load
    t0 = performance.now();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    record("Navigate to /dashboard (authenticated)", "PAGE_LOAD", performance.now() - t0);

    // 2. Navigation across all core sidebar routes
    console.log("\n--- Phase 2: Navigation Clicks Across All Pages ---");
    const routes = [
      { name: "My Forms", path: "/my-forms" },
      { name: "Templates", path: "/templates" },
      { name: "Responses", path: "/responses" },
      { name: "Analytics", path: "/analytics" },
      { name: "Profile", path: "/profile" },
      { name: "Settings", path: "/settings" },
      { name: "Trash", path: "/trash" },
      { name: "Dashboard", path: "/dashboard" },
    ];

    for (const r of routes) {
      t0 = performance.now();
      await page.goto(`http://localhost:3000${r.path}`, { waitUntil: "domcontentloaded" });
      record(`Navigate to ${r.name} (${r.path})`, "NAVIGATION", performance.now() - t0);
    }

    // 3. My Forms Interactions
    console.log("\n--- Phase 3: My Forms Interactions ---");
    await page.goto("http://localhost:3000/my-forms", { waitUntil: "domcontentloaded" });
    await delay(500);

    // Click Grid / List view toggle
    t0 = performance.now();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const gridBtn = btns.find((b) => b.getAttribute("aria-label")?.includes("Grid") || b.title?.includes("Grid") || b.innerHTML.includes("LayoutGrid"));
      if (gridBtn) gridBtn.click();
    });
    // Wait for DOM update
    await delay(300);
    record("Click Grid View Toggle", "LOCAL_CLICK", performance.now() - t0);

    // 4. Form Creation & Builder Interactions
    console.log("\n--- Phase 4: Form Builder Clicks & Actions ---");
    await delay(500);
    t0 = performance.now();
    const createRes = await page.evaluate(async () => {
      const r = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Perf Test Form" }),
      });
      return await r.json();
    });
    const formId = createRes.form?.id;
    record("POST /api/v1/forms (Blank Form Creation)", "API_WRITE", performance.now() - t0, `formId: ${formId}`);

    t0 = performance.now();
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, { waitUntil: "domcontentloaded" });
    record("Load Form Builder (/forms/[id]/edit)", "PAGE_LOAD", performance.now() - t0);

    // Click tab "Theme"
    t0 = performance.now();
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const themeTab = tabs.find((t) => t.innerText.includes("Theme"));
      if (themeTab) themeTab.click();
    });
    await page.waitForSelector("div", { timeout: 1000 }).catch(() => {});
    record("Click Tab: Theme", "LOCAL_TAB_SWITCH", performance.now() - t0);

    // Click tab "Settings"
    t0 = performance.now();
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const sTab = tabs.find((t) => t.innerText.includes("Settings"));
      if (sTab) sTab.click();
    });
    record("Click Tab: Settings", "LOCAL_TAB_SWITCH", performance.now() - t0);

    // Click tab "Preview"
    t0 = performance.now();
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const pTab = tabs.find((t) => t.innerText.includes("Preview"));
      if (pTab) pTab.click();
    });
    record("Click Tab: Preview", "LOCAL_TAB_SWITCH", performance.now() - t0);

    // Click tab "Questions"
    t0 = performance.now();
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const qTab = tabs.find((t) => t.innerText.includes("Questions"));
      if (qTab) qTab.click();
    });
    record("Click Tab: Questions", "LOCAL_TAB_SWITCH", performance.now() - t0);

    // Click "+ Add Question" via canvas bottom button
    t0 = performance.now();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find((b) => b.innerText.trim() === "Add question");
      if (addBtn) addBtn.click();
    });
    await page.waitForFunction(
      () => document.querySelectorAll("input[aria-label='Question title']").length >= 2,
      { timeout: 2000 }
    ).catch(() => {});
    record("Click Add Question (Canvas)", "LOCAL_MUTATION", performance.now() - t0);

    // Direct Draft Autosave PATCH API Call
    t0 = performance.now();
    const saveRes = await page.evaluate(async (fId) => {
      const r = await fetch(`/api/v1/forms/${fId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: 1,
          definition: {
            schemaVersion: 1,
            title: "Perf Test Form",
            settings: {},
            questions: [
              { id: "q1", type: "SHORT_TEXT", label: "Question 1", required: false },
              { id: "q2", type: "RATING", label: "Question 2", required: false },
            ],
          },
        }),
      });
      return { status: r.status, data: await r.json() };
    }, formId);
    record("PATCH /api/v1/forms/[id]/draft (Autosave API)", "API_WRITE", performance.now() - t0, `status ${saveRes.status}`);

    console.log("\n=============================================");
    console.log("Benchmark Summary Table:");
    console.table(metrics);
    console.log("=============================================");
  } catch (err) {
    console.error("Benchmark error:", err);
  } finally {
    await browser.close();
  }
}

run();
