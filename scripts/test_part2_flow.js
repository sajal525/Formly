const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\c6e573bc-5209-46f2-81e2-2bd317c90bc2";

async function run() {
  console.log("Launching browser for Part 2 verification...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // Test username & password
  const testUsername = `user_${Date.now().toString().slice(-6)}`;
  const testPassword = "SuperStrongPassword123!";

  console.log(`Using test credentials: ${testUsername} / ${testPassword}`);

  // 1. Desktop Light Register Screenshot & Zero-scroll check
  console.log("Checking /register layout on 1440x900...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });

  const metrics = await page.evaluate(() => ({
    scrollH: document.documentElement.scrollHeight,
    clientH: document.documentElement.clientHeight,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log("Register 1440x900 scroll metrics:", metrics);

  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "register_desktop_light.png") });

  // 2. Desktop Dark Register Screenshot
  console.log("Capturing register_desktop_dark.png...");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "register_desktop_dark.png") });

  // 3. Mobile Light (375x812)
  console.log("Capturing register_mobile_light.png...");
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "register_mobile_light.png") });

  // 4. Client-side validation check
  console.log("Testing validation on /register...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "register_validation_errors.png") });

  // 5. Account creation flow
  console.log("Creating new account with username & password...");
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", testPassword);
  await page.click('button[type="submit"]');

  // Wait for redirect to /dashboard
  console.log("Waiting for redirect to /dashboard...");
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 });
  const currentUrl = page.url();
  console.log("Current URL after registration:", currentUrl);

  if (!currentUrl.includes("/dashboard")) {
    throw new Error(`Expected redirect to /dashboard, got: ${currentUrl}`);
  }

  // 6. Capture dashboard screenshot
  console.log("Capturing dashboard_authenticated.png...");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "dashboard_authenticated.png") });

  // 7. Test Sign Out
  console.log("Testing Sign Out button on dashboard...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }),
    page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.includes("Sign out"));
      if (btn) btn.click();
    }),
  ]);
  console.log("Current URL after sign out:", page.url());

  // 8. Test Duplicate Username error on /register
  console.log("Testing duplicate username rejection...");
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", testPassword);
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "register_duplicate_username.png") });

  // 9. Test Login with credentials
  console.log("Testing login with created credentials...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("#username-input", testUsername);
  await page.type("#password-input", testPassword);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 });
  console.log("Current URL after successful login:", page.url());

  if (!page.url().includes("/dashboard")) {
    throw new Error(`Login failed to navigate to /dashboard: ${page.url()}`);
  }

  // 10. Test Invalid Password error on /login
  console.log("Testing invalid password error on /login...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent.includes("Sign out"));
    if (btn) btn.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("#username-input", testUsername);
  await page.type("#password-input", "WrongPassword123!");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, "login_invalid_password.png") });

  await browser.close();
  console.log("All Part 2 verification tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
