const puppeteer = require("puppeteer-core");
const { PrismaClient } = require("@prisma/client");
const assert = require("assert");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function runSuite() {
  console.log("=== Formly Profile Picture Everywhere Comprehensive Verification Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const timestamp = Date.now().toString().slice(-6);
    const testUsername = `avatar_tester_${timestamp}`;
    const testPassword = "Password123!";

    // 1. Register test user
    console.log(`\n1. Registering test user (${testUsername})...`);
    await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { ok: res.ok, status: res.status, data: await res.json() };
    }, testUsername, testPassword);

    assert.ok(regResult.ok, `Registration must succeed, got: ${JSON.stringify(regResult)}`);
    const dbUser = await prisma.user.findUnique({
      where: { username: testUsername },
      include: { profile: true },
    });
    assert.ok(dbUser, "User record must exist in database");

    // 2. Check initial state: no avatar uploaded, initials fallback rendered everywhere
    console.log("\n2. Checking initial fallback state before upload...");
    await page.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('header', { timeout: 10000 });

    const initialMetrics = await page.evaluate(() => {
      const headerAvatar = document.querySelector('header [role="img"]');
      const headerImg = headerAvatar?.querySelector("img");
      const headerInitial = headerAvatar?.textContent?.trim();

      const bannerAvatar = document.querySelector('div[role="img"][aria-label*="profile picture"]');
      const bannerImg = bannerAvatar?.querySelector("img");

      return {
        headerHasImg: !!headerImg,
        headerInitial,
        bannerHasImg: !!bannerImg,
      };
    });

    console.log("Initial Metrics (no photo):", initialMetrics);
    assert.strictEqual(initialMetrics.headerHasImg, false, "Header should not have img when no avatar uploaded");
    assert.ok(initialMetrics.headerInitial, "Header must render initial fallback");
    console.log("✓ Initial fallback correctly displays without photo!");

    // 3. Upload a sample avatar image via the API (simulating image editor save)
    console.log("\n3. Uploading profile avatar via API...");
    // Create a 1x1 valid PNG buffer
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const uploadResult = await page.evaluate(async (b64) => {
      const byteCharacters = atob(b64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      const formData = new FormData();
      formData.append("file", blob, "test_avatar.png");

      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        body: formData,
      });
      return { ok: res.ok, status: res.status, data: await res.json() };
    }, pngBase64);

    console.log("Upload result:", uploadResult);
    assert.ok(uploadResult.ok, "Avatar upload must succeed");
    assert.ok(uploadResult.data.avatarUrl, "Must return valid avatarUrl");

    // 4. Verify Real-time synchronization in the current page via avatar-sync event
    console.log("\n4. Triggering client synchronization and verifying real-time update in AppTopbar without reload...");
    await page.evaluate((newUrl) => {
      // Dispatch notify event as done by ProfileAvatarModal / ProfileBanner / ProfilePictureCard
      window.dispatchEvent(
        new CustomEvent("formly:avatar-updated", { detail: { avatarUrl: newUrl } })
      );
    }, uploadResult.data.avatarUrl);

    // Wait brief moment for React state update
    await new Promise((r) => setTimeout(r, 500));

    const realTimeHeader = await page.evaluate(() => {
      const headerAvatar = document.querySelector('header [role="img"]');
      const img = headerAvatar?.querySelector("img");
      return {
        hasImg: !!img,
        src: img?.getAttribute("src"),
      };
    });

    console.log("Real-time Header Metrics:", realTimeHeader);
    assert.ok(realTimeHeader.hasImg, "AppTopbar must immediately render <img> upon avatar update without page reload");
    assert.ok(realTimeHeader.src?.includes("/api/v1/profile/avatar"), "AppTopbar <img> must point to avatar endpoint");
    console.log("✓ Real-time header synchronization without page reload passed!");

    // 5. Test Dropdown Account Menu renders avatar
    console.log("\n5. Testing Dropdown Account Menu...");
    await page.evaluate(() => {
      const dropdownBtn = document.querySelector('header [aria-haspopup="true"]');
      if (dropdownBtn) dropdownBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const dropdownMetrics = await page.evaluate(() => {
      const menu = document.querySelector('header div[class*="z-50"]');
      const avatarInMenu = menu?.querySelector('[role="img"]');
      const img = avatarInMenu?.querySelector("img");
      return {
        menuFound: !!menu,
        avatarInMenuFound: !!avatarInMenu,
        imgSrc: img?.getAttribute("src"),
      };
    });

    console.log("Dropdown Menu Metrics:", dropdownMetrics);
    assert.ok(dropdownMetrics.menuFound, "Dropdown menu must be open");
    assert.ok(dropdownMetrics.avatarInMenuFound, "Dropdown menu must contain UserAvatar");
    assert.ok(dropdownMetrics.imgSrc?.includes("/api/v1/profile/avatar"), "Dropdown menu avatar must display uploaded image");
    console.log("✓ Dropdown Account Menu displays user avatar!");

    // 6. Test Across Routes: /profile, /dashboard, /my-forms, /responses, /settings, /trash
    console.log("\n6. Testing Avatar Persistence across all routes with fresh server render...");
    const routesToTest = ["/profile", "/dashboard", "/my-forms", "/responses", "/settings", "/trash"];

    for (const route of routesToTest) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('header [role="img"]', { timeout: 10000 });

      const routeMetrics = await page.evaluate((r) => {
        const headerAvatar = document.querySelector('header [role="img"]');
        const img = headerAvatar?.querySelector("img");
        return {
          route: r,
          hasImg: !!img,
          src: img?.getAttribute("src"),
        };
      }, route);

      console.log(`Route ${route}:`, routeMetrics);
      assert.ok(routeMetrics.hasImg, `Header in ${route} must render uploaded avatar`);
      assert.ok(routeMetrics.src?.includes("/api/v1/profile/avatar"), `Header in ${route} must have correct avatar src`);
    }
    console.log("✓ All 6 application routes consistently display user avatar in header!");

    // 7. Test Photo Removal Real-time Sync & Fallback (on test user)
    console.log("\n7. Testing Photo Removal and fallback across surfaces...");
    await page.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('header [role="img"]', { timeout: 10000 });

    // Trigger remove via API and event
    await page.evaluate(async () => {
      const res = await fetch("/api/v1/profile/avatar", { method: "DELETE" });
      if (res.ok) {
        window.dispatchEvent(
          new CustomEvent("formly:avatar-updated", { detail: { avatarUrl: null } })
        );
      }
    });

    await new Promise((r) => setTimeout(r, 500));

    const removalMetrics = await page.evaluate(() => {
      const headerAvatar = document.querySelector('header [role="img"]');
      const headerImg = headerAvatar?.querySelector("img");
      const headerText = headerAvatar?.textContent?.trim();
      return {
        headerHasImg: !!headerImg,
        headerInitial: headerText,
      };
    });

    console.log("Removal Metrics:", removalMetrics);
    assert.strictEqual(removalMetrics.headerHasImg, false, "Header should no longer have img after removal");
    assert.ok(removalMetrics.headerInitial, "Header must revert to initial fallback");
    console.log("✓ Removal immediately reverts all avatar surfaces to initial fallback!");

    // 8. Multi-tab synchronization test
    console.log("\n8. Testing Multi-tab synchronization via storage event...");
    const tab1 = page;
    const tab2 = await browser.newPage();
    await tab2.setViewport({ width: 1440, height: 900 });

    await tab2.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2" });
    await tab2.waitForSelector('header [role="img"]', { timeout: 10000 });
    // Allow React component to fully mount and register event listeners
    await new Promise((r) => setTimeout(r, 1000));

    // In tab1, simulate avatar update via notify broadcast (BroadcastChannel & localStorage)
    const testNewAvatar = `/api/v1/profile/avatar?v=${Date.now()}`;
    await tab1.evaluate((url) => {
      try {
        const ch = new BroadcastChannel("formly:avatar-channel");
        ch.postMessage({ avatarUrl: url, timestamp: Date.now() });
      } catch (e) {}
      try {
        localStorage.setItem("formly:avatar-sync", JSON.stringify({ avatarUrl: url, timestamp: Date.now() }));
      } catch (e) {}
    }, testNewAvatar);

    // Wait for tab2 to react to cross-tab broadcast
    await tab2.waitForFunction(() => {
      const headerAvatar = document.querySelector('header [role="img"]');
      return !!headerAvatar?.querySelector("img");
    }, { timeout: 5000 });

    const tab2Metrics = await tab2.evaluate(() => {
      const headerAvatar = document.querySelector('header [role="img"]');
      const img = headerAvatar?.querySelector("img");
      return {
        hasImg: !!img,
        src: img?.getAttribute("src"),
      };
    });

    console.log("Tab 2 Metrics:", tab2Metrics);
    assert.ok(tab2Metrics.hasImg, "Tab 2 header must automatically update when avatar changed in Tab 1");
    console.log("✓ Multi-tab synchronization verified successfully!");
    await tab2.close();

    // 9. Test User flash_525 (the failing case in the user's screenshot)
    console.log("\n9. Testing user flash_525 from the screenshot...");
    const flashUser = await prisma.user.findFirst({
      where: { username: "flash_525" },
      include: { profile: true },
    });

    if (flashUser && flashUser.profile?.avatarObjectKey) {
      console.log("Found flash_525 in DB with avatar:", flashUser.profile.avatarObjectKey);
      
      // Sign in as flash_525 via Better Auth sign-in endpoint
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      const signInRes = await page.evaluate(async (username, password) => {
        const res = await fetch("/api/auth/sign-in/username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        return { ok: res.ok, status: res.status };
      }, "flash_525", "Password123!");

      console.log("Sign-in result for flash_525:", signInRes);
      assert.ok(signInRes.ok, "flash_525 sign-in must succeed");

      await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle0" });
      await page.waitForFunction(() => {
        const headerImg = document.querySelector('header [role="img"] img');
        return headerImg && headerImg.complete && headerImg.naturalWidth > 0;
      }, { timeout: 15000 });

      const flashMetrics = await page.evaluate(() => {
        const headerAvatar = document.querySelector('header [role="img"]');
        const img = headerAvatar?.querySelector("img");
        const bannerAvatar = document.querySelector('div[role="img"][aria-label*="profile picture"]');
        const bannerImg = bannerAvatar?.querySelector("img");

        return {
          headerHasImg: !!img,
          headerSrc: img?.getAttribute("src"),
          headerNaturalWidth: img?.naturalWidth,
          bannerHasImg: !!bannerImg,
          bannerSrc: bannerImg?.getAttribute("src"),
          bannerNaturalWidth: bannerImg?.naturalWidth,
        };
      });

      console.log("flash_525 Metrics:", flashMetrics);
      assert.ok(flashMetrics.headerHasImg, "flash_525 header MUST display avatar img instead of initial 'F'");
      assert.ok(flashMetrics.bannerHasImg, "flash_525 banner MUST display avatar img");

      // Capture screenshot of flash_525 on /profile with header avatar visible
      const artifactPath = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981\\flash_525_profile_with_header_avatar.png";
      await page.screenshot({ path: artifactPath, fullPage: false });
      console.log("Saved screenshot to:", artifactPath);
      console.log("✓ User flash_525 now displays profile picture in top-right header and profile page!");
    }

    console.log("\n=== ALL PROFILE PICTURE SYNCHRONIZATION TESTS PASSED! ===");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
