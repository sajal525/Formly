const puppeteer = require("puppeteer-core");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureDashboard() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `dash_view_${timestamp}`;
  const testPassword = "Password123!";

  await page.goto("http://127.0.0.1:3000/register", { waitUntil: "domcontentloaded" });
  await page.evaluate(async (username, password) => {
    await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  }, testUser, testPassword);

  await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "domcontentloaded" });
  await delay(2000);

  const screenshotPath = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981\\dashboard_templates_removed.png";
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log("Screenshot saved to:", screenshotPath);

  await browser.close();
}

captureDashboard();
