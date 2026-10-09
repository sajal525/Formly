const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\c6e573bc-5209-46f2-81e2-2bd317c90bc2";

async function run() {
  console.log("Launching Chrome for Part 3 Dashboard verification...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // Test credentials for User A
  const userA = `creator_${Date.now().toString().slice(-5)}`;
  const userAPassword = "StrongPassword456!";

  // Test credentials for User B (to test data scoping)
  const userB = `other_${Date.now().toString().slice(-5)}`;
  const userBPassword = "StrongPassword456!";

  console.log(`User A credentials: ${userA} / ${userAPassword}`);

  // 1. Unauthenticated redirect check
  console.log("Checking unauthenticated redirect from /dashboard to /login...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  console.log("Current URL after unauthenticated visit:", page.url());
  if (!page.url().includes("/login")) {
    throw new Error(`Expected redirect to /login, got: ${page.url()}`);
  }

  // 2. Register User A
  console.log("Registering User A on /register...");
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", userA);
  await page.type("#reg-password-input", userAPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log("Current URL after User A registration:", page.url());
  if (!page.url().includes("/dashboard")) {
    throw new Error(`Expected redirect to /dashboard, got: ${page.url()}`);
  }

  // 3. Desktop Empty State Layout & Screenshots
  console.log("Capturing Dashboard empty state at 1440x900...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_desktop_light_empty.png") });

  console.log("Capturing Dashboard empty state dark mode...");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_desktop_dark_empty.png") });

  // 4. Tablet & Mobile Responsive screenshots
  console.log("Capturing Tablet responsive layout (1024x768)...");
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_tablet_dark.png") });

  console.log("Capturing Mobile responsive layout (375x812)...");
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_mobile_light.png") });

  // 5. Create First Draft Form ("Customer Feedback Form")
  console.log("Creating first draft form...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Click "+ Create Form" or "Create your first form"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Create Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Type title into modal
  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  await page.type("#form-title-input", "Customer Feedback Survey");
  await page.type("#form-desc-input", "Quarterly product feedback from active users");
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 1500));
  console.log("Form created! Reloading dashboard to confirm persistence...");
  await page.reload({ waitUntil: "networkidle0" });

  // Verify form title is in recent forms
  const hasFirstForm = await page.evaluate(() => {
    return document.body.innerText.includes("Customer Feedback Survey");
  });
  console.log("Dashboard contains 'Customer Feedback Survey':", hasFirstForm);
  if (!hasFirstForm) {
    throw new Error("Created form not found on dashboard!");
  }

  // 6. Capture Populated Dashboard Screenshots
  console.log("Capturing populated dashboard screenshots...");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_desktop_light_populated.png") });

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_desktop_dark_populated.png") });

  // 7. Create Second Form using "Blank Form" Quick Start Card
  console.log("Creating second blank form with default title...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const blankCard = btns.find((b) => b.textContent && b.textContent.includes("Blank Form"));
    if (blankCard) blankCard.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  // Leave empty for default "Untitled form"
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1500));
  await page.reload({ waitUntil: "networkidle0" });

  const hasUntitledForm = await page.evaluate(() => {
    return document.body.innerText.includes("Untitled form");
  });
  console.log("Dashboard contains 'Untitled form':", hasUntitledForm);
  if (!hasUntitledForm) {
    throw new Error("Default untitled form not found!");
  }

  // 8. Sign Out User A
  console.log("Signing out User A...");
  await page.evaluate(() => {
    // Open user dropdown
    const avatarBtn = document.querySelector('header button[aria-haspopup="true"]');
    if (avatarBtn) avatarBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const signOutBtn = btns.find((b) => b.textContent && b.textContent.includes("Sign out"));
      if (signOutBtn) signOutBtn.click();
    }),
  ]);
  console.log("Current URL after sign out:", page.url());

  // 9. Register User B and verify Owner Scoping (User B must NOT see User A's forms!)
  console.log("Registering User B to verify data isolation...");
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", userB);
  await page.type("#reg-password-input", userBPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log("User B on dashboard. Checking forms isolation...");
  const userBHasUserAForms = await page.evaluate(() => {
    return (
      document.body.innerText.includes("Customer Feedback Survey") ||
      document.body.innerText.includes("Untitled form")
    );
  });
  console.log("User B can see User A's forms:", userBHasUserAForms);
  if (userBHasUserAForms) {
    throw new Error("SECURITY VIOLATION: User B can see User A's forms!");
  }

  // Verify User B sees empty state
  const userBSeesEmpty = await page.evaluate(() => {
    return document.body.innerText.includes("No forms created yet");
  });
  console.log("User B correctly sees empty state:", userBSeesEmpty);
  if (!userBSeesEmpty) {
    throw new Error("User B did not see empty state!");
  }

  console.log("ALL PART 3 DASHBOARD TESTS PASSED SUCCESSFULLY!");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
