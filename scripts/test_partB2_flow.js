const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Part B2 Theme Customizer End-to-End Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `theme_user_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Register test creator
    console.log(`1. Registering creator user (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    console.log("Registration status:", regResult.status);
    if (regResult.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regResult.data)}`);
    }
    console.log("✓ Creator registered and session active");

    // 2. Visit Dashboard and click Blank Form
    console.log("2. Navigating to /dashboard and creating Blank Form...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    const blankBtnClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("button, [role='button']"));
      const blank = cards.find((c) => c.innerText && c.innerText.includes("Blank Form"));
      if (blank) {
        blank.click();
        return true;
      }
      return false;
    });

    if (!blankBtnClicked) {
      throw new Error("Could not find or click 'Blank Form' card on Dashboard");
    }

    // Wait for redirect to /forms/[formId]/edit
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 });
    const editorUrl = page.url();
    console.log("✓ Redirected to editor:", editorUrl);
    const formIdMatch = editorUrl.match(/\/forms\/([^\/]+)\/edit/);
    if (!formIdMatch) {
      throw new Error(`Expected /forms/[id]/edit URL, got ${editorUrl}`);
    }
    const formId = formIdMatch[1];
    console.log(`✓ Active form ID: ${formId}`);

    // Set custom form title
    console.log("3. Updating form title to 'Product Feedback Survey'...");
    await page.evaluate(() => {
      const titleInput = document.querySelector("input[aria-label='Form title'], input[placeholder='Untitled form']");
      if (titleInput) {
        titleInput.value = "Product Feedback Survey";
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
        titleInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(1500); // Wait for debounced autosave

    // 4. Click the Theme tab
    console.log("4. Switching to 'Theme' tab in builder...");
    const themeTabClicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button[role='tab'], nav button"));
      const themeTab = tabs.find((t) => t.innerText && t.innerText.includes("Theme"));
      if (themeTab) {
        themeTab.click();
        return true;
      }
      return false;
    });

    if (!themeTabClicked) {
      throw new Error("Could not click Theme tab");
    }
    await delay(800);

    // Verify Theme Gallery header and elements
    const galleryHeading = await page.evaluate(() => {
      const h2 = document.querySelector("h2");
      return h2 ? h2.innerText : null;
    });
    console.log("Gallery heading:", galleryHeading);
    if (!galleryHeading || !galleryHeading.includes("Choose a Theme")) {
      throw new Error(`Expected 'Choose a Theme' heading, got '${galleryHeading}'`);
    }
    console.log("✓ 'Choose a Theme' workspace verified");

    // 5. Test Category filter pills
    console.log("5. Testing category filters (Dark category)...");
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll("button[role='tab']"));
      const darkPill = pills.find((p) => p.innerText && p.innerText.includes("Dark"));
      if (darkPill) darkPill.click();
    });
    await delay(400);

    const darkThemesCount = await page.evaluate(() => {
      const cards = document.querySelectorAll("div[aria-label='Available themes'] button[role='radio']");
      return cards.length;
    });
    console.log(`Found ${darkThemesCount} themes in 'Dark' category (expecting 2: Tech, Space)`);

    // Switch back to "All" category
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll("button[role='tab']"));
      const allPill = pills.find((p) => p.innerText && p.innerText.includes("All"));
      if (allPill) allPill.click();
    });
    await delay(400);

    const allThemesCount = await page.evaluate(() => {
      const cards = document.querySelectorAll("div[aria-label='Available themes'] button[role='radio']");
      return cards.length;
    });
    console.log(`Found ${allThemesCount} themes in 'All' category (expecting 12)`);
    if (allThemesCount !== 12) {
      throw new Error(`Expected 12 presets in 'All' category, found ${allThemesCount}`);
    }
    console.log("✓ All 12 presets verified");

    // 6. Select "Classic Royal" preset
    console.log("6. Selecting 'Classic Royal' theme preset...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div[aria-label='Available themes'] button[role='radio']"));
      const royal = cards.find((c) => c.innerText && c.innerText.includes("Classic Royal"));
      if (royal) royal.click();
    });
    await delay(1500); // Wait for autosave

    // 7. Verify Theme Customization controls
    console.log("7. Customizing theme: Pink accent swatch...");
    await page.evaluate(() => {
      // Find Pink accent swatch button
      const swatches = Array.from(document.querySelectorAll("div[aria-label='Primary accent color swatches'] button[role='radio']"));
      const pink = swatches.find((s) => s.getAttribute("aria-label")?.includes("Pink") || s.getAttribute("title")?.includes("Pink"));
      if (pink) pink.click();
    });
    await delay(500);

    console.log("Customizing theme: Card style -> Glass...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const glass = btns.find((b) => b.innerText && b.innerText.includes("Glass"));
      if (glass) glass.click();
    });
    await delay(500);

    console.log("Customizing theme: Typography -> Classic Serif...");
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll("button"));
      const fontTab = tabBtns.find((b) => b.innerText && b.innerText.trim() === "Fonts");
      if (fontTab) fontTab.click();
    });
    await delay(400);
    await page.evaluate(() => {
      const fontBtns = Array.from(document.querySelectorAll("button"));
      const serif = fontBtns.find((b) => b.innerText && b.innerText.includes("Classic Serif"));
      if (serif) serif.click();
    });
    await delay(500);

    console.log("Customizing theme: Header -> Centered alignment...");
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll("button"));
      const headerTab = tabBtns.find((b) => b.innerText && b.innerText.trim() === "Header");
      if (headerTab) headerTab.click();
    });
    await delay(400);
    await page.evaluate(() => {
      const alignBtns = Array.from(document.querySelectorAll("button"));
      const centered = alignBtns.find((b) => b.innerText && b.innerText.includes("Centered"));
      if (centered) centered.click();
    });
    await delay(2000); // Allow debounced autosave to complete

    // 8. Capture Desktop Screenshot
    const desktopScreenshot = path.join(ARTIFACT_DIR, "b2_theme_tab_desktop.png");
    await page.screenshot({ path: desktopScreenshot, fullPage: false });
    console.log("✓ Saved desktop screenshot:", desktopScreenshot);

    // 9. Verify Neon database persistence
    console.log("9. Verifying theme and overrides persisted in database...");
    const dbForm = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        themeKey: true,
        definition: true,
        draftRevision: true,
      },
    });

    console.log("DB Form Record:", {
      id: dbForm.id,
      title: dbForm.title,
      themeKey: dbForm.themeKey,
      draftRevision: dbForm.draftRevision,
      themeOverrides: dbForm.definition.themeOverrides,
    });

    if (dbForm.themeKey !== "classic-royal") {
      throw new Error(`Expected themeKey 'classic-royal', got '${dbForm.themeKey}'`);
    }

    const overrides = dbForm.definition.themeOverrides;
    if (!overrides) {
      throw new Error("themeOverrides missing in canonical form definition");
    }
    if (overrides.primaryColorKey !== "pink") {
      throw new Error(`Expected primaryColorKey 'pink', got '${overrides.primaryColorKey}'`);
    }
    if (overrides.cardStyle !== "glass") {
      throw new Error(`Expected cardStyle 'glass', got '${overrides.cardStyle}'`);
    }
    if (overrides.fontPairKey !== "serif") {
      throw new Error(`Expected fontPairKey 'serif', got '${overrides.fontPairKey}'`);
    }
    if (overrides.header?.layout !== "centered") {
      throw new Error(`Expected header layout 'centered', got '${overrides.header?.layout}'`);
    }
    console.log("✓ Canonical database persistence validated with all overrides!");

    // 10. Switch to 'Preview' tab in builder to verify respondent preview
    console.log("10. Testing full Respondent Preview tab...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button[role='tab'], nav button"));
      const previewTab = tabs.find((t) => t.innerText && t.innerText.includes("Preview"));
      if (previewTab) previewTab.click();
    });
    await delay(1000);

    const previewScreenshot = path.join(ARTIFACT_DIR, "b2_theme_full_preview.png");
    await page.screenshot({ path: previewScreenshot, fullPage: false });
    console.log("✓ Saved full preview tab screenshot:", previewScreenshot);

    // 11. Test Tablet & Mobile Responsive Views
    console.log("11. Testing Tablet (768x1024) and Mobile (375x812) viewports...");
    // Return to Theme tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button[role='tab'], nav button"));
      const themeTab = tabs.find((t) => t.innerText && t.innerText.includes("Theme"));
      if (themeTab) themeTab.click();
    });
    await delay(600);

    // Tablet
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
    await delay(500);
    const tabletScreenshot = path.join(ARTIFACT_DIR, "b2_theme_tablet.png");
    await page.screenshot({ path: tabletScreenshot, fullPage: false });
    console.log("✓ Saved tablet screenshot:", tabletScreenshot);

    // Mobile Gallery
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
    await delay(500);
    const mobileScreenshot = path.join(ARTIFACT_DIR, "b2_theme_mobile.png");
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log("✓ Saved mobile gallery screenshot:", mobileScreenshot);

    // Mobile Customize Tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const customizeBtn = btns.find((b) => b.innerText && b.innerText.includes("Preview & Customize"));
      if (customizeBtn) customizeBtn.click();
    });
    await delay(600);
    const mobileCustomizeScreenshot = path.join(ARTIFACT_DIR, "b2_theme_mobile_customize.png");
    await page.screenshot({ path: mobileCustomizeScreenshot, fullPage: false });
    console.log("✓ Saved mobile customize screenshot:", mobileCustomizeScreenshot);

    console.log("\n=== ALL PART B2 THEME TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
