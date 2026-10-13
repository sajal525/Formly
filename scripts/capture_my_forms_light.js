const puppeteer = require("puppeteer-core");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureLightMode() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `light_user_${timestamp}`;
  const testPassword = "Password123!";

  await page.goto("http://127.0.0.1:3000/register", { waitUntil: "domcontentloaded" });
  await page.evaluate(async (username, password) => {
    await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  }, testUser, testPassword);

  await page.goto("http://127.0.0.1:3000/my-forms", { waitUntil: "domcontentloaded" });
  await delay(1500);

  // Switch to light theme if dark
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await delay(300);

  // Hover over Drafts tab
  const buttons = await page.$$('div[role="tablist"] button[role="tab"]');
  if (buttons[1]) {
    await buttons[1].hover();
    await delay(350);
  }

  const screenshotPath = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981\\my_forms_icon_filters_light.png";
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log("Light screenshot saved to:", screenshotPath);

  await browser.close();
}

captureLightMode();
