const puppeteer = require("puppeteer-core");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

async function runSuite() {
  console.log("=== Formly Cover Image Fitting & Crop Consistency Comprehensive Test Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `cover_fit_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log("1. Registering test user...");
    await page.goto("http://localhost:3000/register", { waitUntil: "domcontentloaded" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);
    assert.strictEqual(regResult.status, 201, "Registration failed");
    const userId = regResult.data.user.id;

    // 2. Test Form with 4:1 Cover Banner
    console.log("\n2. Testing Form with 4:1 Banner in Preview (Desktop, Tablet, Mobile) and Published form...");
    const formId = "cmv86arkm0001fookn6xgr83o";
    await prisma.form.update({
      where: { id: formId },
      data: {
        ownerId: userId,
        status: "PUBLISHED",
        themeKey: "nothing",
        definition: {
          schemaVersion: 1,
          title: "Cover Fitting Test Form",
          description: "Verifying edge-to-edge cover fitting without gaps or stretching.",
          themeKey: "nothing",
          coverImage: {
            assetId: "cmv86aylr002vfoe4ggtr3s1s",
            originalAssetId: "cmv86axkg002tfoe4n5hyzvi5",
            altText: "Test Cover Banner",
            transform: {
              crop: {
                x: 10,
                y: 20,
                width: 80,
                height: 20,
                aspectRatio: 4,
              },
              aspectPreset: "4:1",
              rotation: 0,
              zoom: 1,
            },
          },
          questions: [
            {
              id: "q-1",
              type: "SHORT_TEXT",
              label: "What is your primary feedback?",
              required: true,
            },
          ],
        },
      },
    });

    // 2a. Open Builder & Switch to Preview Tab
    await page.goto(`http://localhost:3000/forms/${formId}/edit`, {
      waitUntil: "domcontentloaded",
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.waitForSelector('nav[aria-label="Editor tabs"] button');
    const tabs = await page.$$('nav[aria-label="Editor tabs"] button');
    await tabs[3].click(); // Click Preview tab
    await page.waitForSelector('div[aria-label*="Desktop preview"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Measure Desktop Preview
    const desktopMetrics = await page.evaluate(() => {
      const desktopFrame = document.querySelector('div[aria-label*="Desktop preview"]');
      const img = desktopFrame ? desktopFrame.querySelector('img[alt*="Cover"]') : null;
      const imgContainer = img ? img.parentElement : null;
      const card = imgContainer ? imgContainer.parentElement : null;
      if (!img || !imgContainer || !card) return null;

      const cardRect = card.getBoundingClientRect();
      const imgRect = imgContainer.getBoundingClientRect();
      const gapLeft = Math.abs(imgRect.left - cardRect.left - 1); // 1px border
      const gapRight = Math.abs(cardRect.right - imgRect.right - 1);
      const computedRatio = imgRect.width / imgRect.height;

      return {
        cardWidth: cardRect.width,
        imgWidth: imgRect.width,
        imgHeight: imgRect.height,
        gapLeft,
        gapRight,
        computedRatio,
      };
    });

    console.log("Desktop Preview Metrics:", desktopMetrics);
    assert.ok(desktopMetrics, "Desktop preview cover image must be found in DOM");
    assert.ok(desktopMetrics.gapLeft <= 1.5, `Left gap must be <= 1.5px, got: ${desktopMetrics.gapLeft}`);
    assert.ok(desktopMetrics.gapRight <= 1.5, `Right gap must be <= 1.5px, got: ${desktopMetrics.gapRight}`);
    assert.ok(
      Math.abs(desktopMetrics.computedRatio - 4) < 0.1,
      `Aspect ratio must be ~4:1, got: ${desktopMetrics.computedRatio}`
    );
    console.log("✓ Desktop Preview has perfect flush edge-to-edge alignment and 4:1 ratio!");

    // 2b. Test Tablet Preview
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tabletBtn = btns.find((b) => b.textContent && b.textContent.includes("Tablet"));
      if (tabletBtn) tabletBtn.click();
    });
    await page.waitForSelector('div[aria-label*="Tablet preview"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const tabletMetrics = await page.evaluate(() => {
      const tabletFrame = document.querySelector('div[aria-label*="Tablet preview"]');
      const img = tabletFrame ? tabletFrame.querySelector('img[alt*="Cover"]') : null;
      const imgContainer = img ? img.parentElement : null;
      const card = imgContainer ? imgContainer.parentElement : null;
      if (!img || !imgContainer || !card) return null;

      const cardRect = card.getBoundingClientRect();
      const imgRect = imgContainer.getBoundingClientRect();
      const gapLeft = Math.abs(imgRect.left - cardRect.left - 1);
      const gapRight = Math.abs(cardRect.right - imgRect.right - 1);
      const computedRatio = imgRect.width / imgRect.height;

      return {
        cardWidth: cardRect.width,
        imgWidth: imgRect.width,
        imgHeight: imgRect.height,
        gapLeft,
        gapRight,
        computedRatio,
      };
    });

    console.log("Tablet Preview Metrics:", tabletMetrics);
    assert.ok(tabletMetrics, "Tablet preview cover image must be found in DOM");
    assert.ok(tabletMetrics.gapLeft <= 1.5, `Tablet left gap must be <= 1.5px, got: ${tabletMetrics.gapLeft}`);
    assert.ok(tabletMetrics.gapRight <= 1.5, `Tablet right gap must be <= 1.5px, got: ${tabletMetrics.gapRight}`);
    assert.ok(
      Math.abs(tabletMetrics.computedRatio - 4) < 0.1,
      `Tablet ratio must be ~4:1, got: ${tabletMetrics.computedRatio}`
    );
    console.log("✓ Tablet Preview preserves edge-to-edge alignment and 4:1 ratio!");

    // 2c. Test Mobile Preview
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const mobileBtn = btns.find((b) => b.textContent && b.textContent.includes("Mobile"));
      if (mobileBtn) mobileBtn.click();
    });
    await page.waitForSelector('div[aria-label*="Mobile preview"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    const mobileMetrics = await page.evaluate(() => {
      const mobileFrame = document.querySelector('div[aria-label*="Mobile preview"]');
      const img = mobileFrame ? mobileFrame.querySelector('img[alt*="Cover"]') : null;
      const imgContainer = img ? img.parentElement : null;
      const card = imgContainer ? imgContainer.parentElement : null;
      if (!img || !imgContainer || !card) return null;

      const cardRect = card.getBoundingClientRect();
      const imgRect = imgContainer.getBoundingClientRect();
      const gapLeft = Math.abs(imgRect.left - cardRect.left - 1);
      const gapRight = Math.abs(cardRect.right - imgRect.right - 1);
      const computedRatio = imgRect.width / imgRect.height;

      return {
        cardWidth: cardRect.width,
        imgWidth: imgRect.width,
        imgHeight: imgRect.height,
        gapLeft,
        gapRight,
        computedRatio,
      };
    });

    console.log("Mobile Preview Metrics:", mobileMetrics);
    assert.ok(mobileMetrics, "Mobile preview cover image must be found in DOM");
    assert.ok(mobileMetrics.gapLeft <= 1.5, `Mobile left gap must be <= 1.5px, got: ${mobileMetrics.gapLeft}`);
    assert.ok(mobileMetrics.gapRight <= 1.5, `Mobile right gap must be <= 1.5px, got: ${mobileMetrics.gapRight}`);
    assert.ok(
      Math.abs(mobileMetrics.computedRatio - 4) < 0.1,
      `Mobile ratio must be ~4:1 without distortion, got: ${mobileMetrics.computedRatio}`
    );
    console.log("✓ Mobile Preview scales responsively without distortion or side clipping!");

    // 2d. Test Published Respondent View
    console.log("\nTesting Published Respondent View (/f/[formId])...");
    await prisma.form.update({
      where: { id: formId },
      data: { status: "PUBLISHED" },
    });
    await page.goto(`http://localhost:3000/f/${formId}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt*="Cover"]');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 10000 });

    const publishedMetrics = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Cover"]');
      const imgContainer = img ? img.parentElement : null;
      const card = imgContainer ? imgContainer.parentElement : null;
      if (!img || !imgContainer || !card) return null;

      const cardRect = card.getBoundingClientRect();
      const imgRect = imgContainer.getBoundingClientRect();
      const gapLeft = Math.abs(imgRect.left - cardRect.left - 1);
      const gapRight = Math.abs(cardRect.right - imgRect.right - 1);
      const computedRatio = imgRect.width / imgRect.height;

      return {
        imgFound: true,
        imgLoaded: img.complete && img.naturalWidth > 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        gapLeft,
        gapRight,
        computedRatio,
      };
    });

    console.log("Published Metrics:", publishedMetrics);
    assert.ok(publishedMetrics, "Published form cover image must be found");
    assert.ok(publishedMetrics.imgLoaded, "Cover image must be fully loaded");
    assert.ok(publishedMetrics.gapLeft <= 1.5, `Published left gap <= 1.5px, got: ${publishedMetrics.gapLeft}`);
    assert.ok(publishedMetrics.gapRight <= 1.5, `Published right gap <= 1.5px, got: ${publishedMetrics.gapRight}`);
    assert.ok(
      Math.abs(publishedMetrics.computedRatio - 4) < 0.1,
      `Published ratio must be ~4:1, got: ${publishedMetrics.computedRatio}`
    );
    console.log("✓ Published Respondent form matches Preview canvas identically!");

    // 3. Test Form WITHOUT Cover Image
    console.log("\n3. Testing Form without Cover Image (empty cover fallback)...");
    const formNoCover = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "PUBLISHED",
        title: "No Cover Form",
        themeKey: "soft-lavender",
        definition: {
          schemaVersion: 1,
          title: "No Cover Form",
          description: "Form without a cover image.",
          themeKey: "soft-lavender",
          questions: [
            {
              id: "q-1",
              type: "SHORT_TEXT",
              label: "Question without cover?",
              required: false,
            },
          ],
        },
      },
    });

    await page.goto(`http://localhost:3000/forms/${formNoCover.id}/edit`, {
      waitUntil: "domcontentloaded",
    });
    console.log("Navigated to formNoCover, current URL:", page.url());
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Current URL after 2s wait:", page.url());
    await page.waitForSelector('nav[aria-label="Editor tabs"] button');
    await page.waitForFunction(() => {
      const tabs = Array.from(document.querySelectorAll("nav[aria-label='Editor tabs'] button"));
      const previewTab = tabs.find((t) => t.textContent && t.textContent.includes("Preview"));
      if (previewTab) {
        previewTab.click();
        return !!document.querySelector('div[aria-label*="Desktop preview"]');
      }
      return false;
    }, { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));

    const noCoverPreview = await page.evaluate(() => {
      const desktopFrame = document.querySelector('div[aria-label*="Desktop preview"]');
      const img = desktopFrame ? desktopFrame.querySelector('img[alt*="Cover"]') : null;
      const titleH1 = desktopFrame ? desktopFrame.querySelector("h1") : null;
      const card = titleH1 ? titleH1.closest("div.overflow-hidden") : null;
      const style = card ? window.getComputedStyle(card) : null;
      const cardPaddingTop = style ? style.paddingTop : null;
      const cardPaddingLeft = style ? style.paddingLeft : null;
      return {
        hasCoverImg: !!img,
        titleFound: !!titleH1,
        titleText: titleH1 ? titleH1.textContent : null,
        cardFound: !!card,
        cardClasses: card ? card.className : null,
        cardPaddingTop,
        cardPaddingLeft,
      };
    });

    console.log("No Cover Form Metrics:", noCoverPreview);
    assert.strictEqual(noCoverPreview.hasCoverImg, false, "No cover img should exist");
    assert.ok(noCoverPreview.cardFound, "Header card must be found in desktop preview");
    assert.ok(
      noCoverPreview.cardPaddingTop && noCoverPreview.cardPaddingTop !== "0px",
      "Empty cover card retains natural header padding"
    );
    console.log("✓ Form without cover preserves existing padded layout and presentation!");

    console.log("\n=== ALL COVER IMAGE FITTING VERIFICATION TESTS PASSED! ===");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
