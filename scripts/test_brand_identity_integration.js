const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const ROOT_DIR = "c:\\Users\\sajal\\Downloads\\Flash";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("=== Starting Formly Brand Icon & Logo Integration Test Suite ===");

  // 1. Verify physical assets existence and integrity
  const requiredAssets = [
    "public/brand/formly-mark-light.svg",
    "public/brand/formly-mark-dark.svg",
    "public/brand/formly-logo-light.svg",
    "public/brand/formly-logo-dark.svg",
    "public/brand/formly-app-icon-light.svg",
    "public/brand/formly-app-icon-dark.svg",
    "public/brand/formly-app-icon-light.png",
    "public/brand/formly-app-icon-dark.png",
    "public/brand/formly-logo-light.png",
    "public/brand/formly-logo-dark.png",
    "public/brand/icons/app-icon-light-512.png",
    "public/brand/icons/app-icon-light-256.png",
    "public/brand/icons/app-icon-light-128.png",
    "public/brand/icons/app-icon-light-64.png",
    "public/brand/icons/app-icon-light-32.png",
    "public/brand/icons/app-icon-dark-512.png",
    "public/brand/icons/app-icon-dark-256.png",
    "public/brand/icons/app-icon-dark-128.png",
    "public/brand/icons/app-icon-dark-64.png",
    "public/brand/icons/app-icon-dark-32.png",
    "public/brand/icons/favicon-32.png",
    "public/brand/icons/favicon-16.png",
    "public/brand/icons/apple-touch-icon.png",
    "public/favicon.ico",
    "src/app/icon.svg",
    "src/app/apple-icon.png",
  ];

  console.log("Checking required brand assets on filesystem...");
  for (const rel of requiredAssets) {
    const full = path.join(ROOT_DIR, rel);
    assert.ok(fs.existsSync(full), `Asset missing: ${rel}`);
    const stat = fs.statSync(full);
    assert.ok(stat.size > 100, `Asset ${rel} is suspiciously small: ${stat.size} bytes`);
    console.log(`  ✓ ${rel} (${stat.size} bytes)`);
  }

  // 2. Launch browser for in-app integration testing
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  try {
    // 3. Test Login Page (Light & Dark)
    console.log("\n2. Testing /login page branding...");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });

    // Set Light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await delay(300);

    // Verify logo presence in header and form
    const lightHeaderLogo = await page.$('header a[aria-label="Formly home"] svg');
    assert.ok(lightHeaderLogo, "Login header must contain Formly logo SVG");

    const lightScreenshot = path.join(ARTIFACT_DIR, "login_branding_light.png");
    await page.screenshot({ path: lightScreenshot });
    console.log("✓ Saved Light Mode login screenshot:", lightScreenshot);

    // Toggle Dark theme
    console.log("Toggling dark mode on /login...");
    const themeBtn = await page.$('header button[aria-label*="dark mode"], header button[aria-label*="light mode"]');
    if (themeBtn) {
      await themeBtn.click();
      await delay(400);
    } else {
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await delay(300);
    }

    const darkScreenshot = path.join(ARTIFACT_DIR, "login_branding_dark.png");
    await page.screenshot({ path: darkScreenshot });
    console.log("✓ Saved Dark Mode login screenshot:", darkScreenshot);

    // 4. Test Registration Page Branding
    console.log("\n3. Testing /register page branding...");
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    const regHeaderLogo = await page.$('header a[aria-label="Formly home"] svg');
    assert.ok(regHeaderLogo, "Registration header must contain Formly logo SVG");

    // Register user to access dashboard & my-forms
    const username = `brand_tester_${Date.now().toString().slice(-6)}`;
    await page.type("#reg-username-input", username);
    await page.type("#reg-password-input", "Password123456!");
    const regBtn = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regBtn.click(),
    ]);
    await delay(800);

    // 5. Test Dashboard Page Branding (Sidebar, Right Rail)
    console.log("\n4. Testing /dashboard page branding in Light Mode...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    });
    await delay(300);

    // Check sidebar logo
    const sidebarLogo = await page.$('aside a[aria-label="Formly home"]');
    assert.ok(sidebarLogo, "Sidebar must contain Formly home logo link");

    const dashLightScreenshot = path.join(ARTIFACT_DIR, "dashboard_branding_light.png");
    await page.screenshot({ path: dashLightScreenshot });
    console.log("✓ Saved Light Mode dashboard screenshot:", dashLightScreenshot);

    // Switch to dark mode on dashboard
    console.log("Switching to Dark Mode on dashboard...");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await delay(300);

    const dashDarkScreenshot = path.join(ARTIFACT_DIR, "dashboard_branding_dark.png");
    await page.screenshot({ path: dashDarkScreenshot });
    console.log("✓ Saved Dark Mode dashboard screenshot:", dashDarkScreenshot);

    // 6. Test Mobile Viewport and Drawer Navigation
    console.log("\n5. Testing Mobile Viewport (375x667)...");
    await page.setViewport({ width: 375, height: 667 });
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(400);

    // Open mobile menu
    const menuBtn = await page.$('header button[aria-label="Open mobile navigation"]');
    if (menuBtn) {
      await menuBtn.click();
      await delay(400);
      const mobileDrawerLogo = await page.$('.fixed aside a[aria-label="Formly home"]');
      assert.ok(mobileDrawerLogo, "Mobile drawer must contain Formly home logo");
    }

    const mobileScreenshot = path.join(ARTIFACT_DIR, "mobile_drawer_branding.png");
    await page.screenshot({ path: mobileScreenshot });
    console.log("✓ Saved Mobile Drawer screenshot:", mobileScreenshot);

    console.log("\n=======================================================");
    console.log("🎉 ALL FORMLY BRAND ICON & LOGO INTEGRATION TESTS PASSED!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
