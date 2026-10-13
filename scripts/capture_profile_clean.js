const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyProfileLayout() {
  console.log("=== Verifying Profile Layout without Title/Subtitle ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Register / log in
  const testUsername = `user_layout_${Date.now().toString().slice(-6)}`;
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", "Password123456!");
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    submitBtn.click(),
  ]);

  // Navigate to /profile
  await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
  await delay(1200);

  // Check DOM text
  const domCheck = await page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return { found: false };
    const headings = Array.from(main.querySelectorAll("h1")).map((h) => h.textContent.trim());
    const hasSubtitle = main.innerText.includes("Manage your account information, profile details and preferences.");
    const hasChangeCover = Array.from(main.querySelectorAll("button")).some((b) => b.textContent.includes("Change Cover"));
    const hasBasicInfo = main.innerText.includes("Basic Information");
    const hasProfilePicture = main.innerText.includes("Profile Picture");
    const hasAccountStats = main.innerText.includes("Account Stats");

    return {
      found: true,
      headings,
      hasSubtitle,
      hasChangeCover,
      hasBasicInfo,
      hasProfilePicture,
      hasAccountStats,
    };
  });

  console.log("DOM Verification results:", domCheck);
  // Heading for user display name inside banner is h1:
  assert.ok(
    !domCheck.headings.includes("Profile"),
    "The standalone 'Profile' page heading must NOT exist"
  );
  assert.strictEqual(
    domCheck.hasSubtitle,
    false,
    "The subtitle 'Manage your account information, profile details and preferences.' must NOT exist"
  );
  assert.strictEqual(domCheck.hasChangeCover, true, "Change Cover button must be preserved");
  assert.strictEqual(domCheck.hasBasicInfo, true, "Basic Information card must be preserved");
  assert.strictEqual(domCheck.hasProfilePicture, true, "Profile Picture card must be preserved");
  assert.strictEqual(domCheck.hasAccountStats, true, "Account Stats card must be preserved");

  // Capture screenshot (Dark mode - default)
  const darkScreenshot = path.join(ARTIFACT_DIR, "profile_clean_dark.png");
  await page.screenshot({ path: darkScreenshot });
  console.log("Dark mode screenshot saved:", darkScreenshot);

  // Toggle to Light mode if theme button exists
  const themeToggled = await page.evaluate(() => {
    // Look for theme toggle button
    const themeBtn = document.querySelector('button[aria-label*="theme" i]') ||
                     document.querySelector('button[title*="theme" i]') ||
                     Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-sun') || b.querySelector('svg.lucide-moon'));
    if (themeBtn) {
      themeBtn.click();
      return true;
    }
    // Alternatively remove 'dark' class from html
    document.documentElement.classList.remove('dark');
    return true;
  });

  await delay(600);
  const lightScreenshot = path.join(ARTIFACT_DIR, "profile_clean_light.png");
  await page.screenshot({ path: lightScreenshot });
  console.log("Light mode screenshot saved:", lightScreenshot);

  await browser.close();
  console.log("✓ Layout verification succeeded perfectly!");
}

verifyProfileLayout().catch((err) => {
  console.error("Layout verification failed:", err);
  process.exit(1);
});
