const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const timestamp = Date.now().toString().slice(-5);
  const testUser = `capt_${timestamp}`;
  const testPassword = "SecurePassword123!";

  // Register
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUser);
  await page.type("#reg-password-input", testPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('button[type="submit"]'),
  ]);

  // Navigate to templates
  await page.goto("http://localhost:3000/templates", { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });

  // Ensure light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("formly-theme", "light");
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "templates_desktop_light.png"),
    fullPage: false,
  });
  console.log("Captured templates_desktop_light.png");

  // Open Preview dialog in light mode
  await page.evaluate(() => {
    const previewBtns = Array.from(document.querySelectorAll("button")).filter(
      (b) => b.textContent && b.textContent.trim() === "Preview"
    );
    if (previewBtns.length > 0) previewBtns[0].click();
  });
  await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
  await page.waitForFunction(() => !document.body.textContent.includes("Loading form questions..."), { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "templates_preview_dialog_light.png"),
    fullPage: false,
  });
  console.log("Captured templates_preview_dialog_light.png");

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close preview"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Switch to Dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("formly-theme", "dark");
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "templates_desktop_dark.png"),
    fullPage: false,
  });
  console.log("Captured templates_desktop_dark.png");

  await browser.close();
}

capture().catch(console.error);
