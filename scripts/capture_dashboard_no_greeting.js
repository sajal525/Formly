const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyDashboard() {
  console.log("=== Verifying Dashboard Layout without Greeting ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Register a test user
  const testUsername = `user_dash_${Date.now().toString().slice(-6)}`;
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", "Password123456!");
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    submitBtn.click(),
  ]);

  // Navigate to Dashboard
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await delay(1200);

  // Check DOM text
  const domCheck = await page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return { found: false };
    const innerText = main.innerText;
    const hasGreeting =
      innerText.includes("Good afternoon") ||
      innerText.includes("Good morning") ||
      innerText.includes("Good evening") ||
      innerText.includes("Good day");
    const hasSubtitle = innerText.includes("Create, share and collect responses with Formly.");
    const hasCreateFormBtn = Array.from(main.querySelectorAll("button")).some((b) =>
      b.textContent.includes("Create Form")
    );
    const hasBlankFormCard = innerText.includes("Blank Form");
    const hasImportAiCard = innerText.includes("Import with AI");
    const hasUploadFileCard = innerText.includes("Upload File");
    const hasRecentForms = innerText.includes("Recent Forms");

    return {
      found: true,
      hasGreeting,
      hasSubtitle,
      hasCreateFormBtn,
      hasBlankFormCard,
      hasImportAiCard,
      hasUploadFileCard,
      hasRecentForms,
    };
  });

  console.log("DOM Verification results:", domCheck);
  assert.strictEqual(domCheck.hasGreeting, false, "Greeting heading must NOT exist");
  assert.strictEqual(domCheck.hasSubtitle, false, "Greeting subtitle must NOT exist");
  assert.strictEqual(domCheck.hasCreateFormBtn, true, "Create Form button must exist");
  assert.strictEqual(domCheck.hasBlankFormCard, true, "Blank Form card must exist");
  assert.strictEqual(domCheck.hasImportAiCard, true, "Import with AI card must exist");
  assert.strictEqual(domCheck.hasUploadFileCard, true, "Upload File card must exist");
  assert.strictEqual(domCheck.hasRecentForms, true, "Recent Forms section must exist");

  // Capture Dark mode screenshot
  const darkScreenshot = path.join(ARTIFACT_DIR, "dashboard_no_greeting_dark.png");
  await page.screenshot({ path: darkScreenshot });
  console.log("Dark mode screenshot saved:", darkScreenshot);

  // Test Create Form dropdown opens
  console.log("Testing Create Form dropdown...");
  await page.evaluate(() => {
    const chevronBtn = document.querySelector('button[aria-label="More creation options"]');
    if (chevronBtn) chevronBtn.click();
  });
  await delay(400);

  const dropdownOpened = await page.evaluate(() => {
    return document.body.innerText.includes("Start from scratch");
  });
  console.log("Dropdown menu opened:", dropdownOpened);
  assert.strictEqual(dropdownOpened, true, "Dropdown menu must open when clicking chevron");

  // Close dropdown
  await page.evaluate(() => {
    const chevronBtn = document.querySelector('button[aria-label="More creation options"]');
    if (chevronBtn) chevronBtn.click();
  });
  await delay(300);

  // Toggle to Light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await delay(500);

  const lightScreenshot = path.join(ARTIFACT_DIR, "dashboard_no_greeting_light.png");
  await page.screenshot({ path: lightScreenshot });
  console.log("Light mode screenshot saved:", lightScreenshot);

  await browser.close();
  console.log("\n✓ Dashboard verification passed successfully!");
}

verifyDashboard().catch((err) => {
  console.error("Dashboard verification failed:", err);
  process.exit(1);
});
