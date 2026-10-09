const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Form Settings End-to-End Verification ===");
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
  const testUser = `settings_user_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Register test user
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

    // 2. Go to dashboard and create Blank Form
    console.log("2. Navigating to /dashboard and creating Blank Form...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    await delay(1000);

    const blankClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("button, [role='button']"));
      const blank = cards.find((c) => c.innerText && c.innerText.includes("Blank Form"));
      if (blank) {
        blank.click();
        return true;
      }
      return false;
    });

    if (!blankClicked) {
      throw new Error("Could not click Blank Form on dashboard");
    }

    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 });
    const editorUrl = page.url();
    console.log("✓ Redirected to editor:", editorUrl);
    const formIdMatch = editorUrl.match(/\/forms\/([^\/]+)\/edit/);
    if (!formIdMatch) {
      throw new Error(`Expected /forms/[id]/edit URL, got ${editorUrl}`);
    }
    const formId = formIdMatch[1];
    console.log(`✓ Active form ID: ${formId}`);

    // 3. Switch to Settings tab
    console.log("3. Switching to 'Settings' tab...");
    const settingsTabClicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button[role='tab'], nav button"));
      const settingsTab = tabs.find((t) => t.innerText && t.innerText.includes("Settings"));
      if (settingsTab) {
        settingsTab.click();
        return true;
      }
      return false;
    });

    if (!settingsTabClicked) {
      throw new Error("Could not find or click Settings tab");
    }
    await delay(1000);

    // 4. Verify all Cards exist
    console.log("4. Verifying Settings Cards presence...");
    const cardsPresent = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h3")).map((h) => h.innerText);
      return {
        general: headings.some((h) => h.includes("General Settings")),
        access: headings.some((h) => h.includes("Form Access")),
        response: headings.some((h) => h.includes("Response Settings")),
        behavior: headings.some((h) => h.includes("Form Behavior")),
        confirmation: headings.some((h) => h.includes("Confirmation Message")),
        notifications: headings.some((h) => h.includes("Notifications")),
        advanced: headings.some((h) => h.includes("Advanced Settings")),
        danger: headings.some((h) => h.includes("Danger Zone")),
        preview: headings.some((h) => h.includes("Live Preview")),
      };
    });

    console.log("Cards check:", cardsPresent);
    for (const [card, present] of Object.entries(cardsPresent)) {
      if (!present) throw new Error(`Missing expected settings card: ${card}`);
    }
    console.log("✓ All 9 settings cards & panels verified!");

    // 5. Update General Settings
    console.log("5. Updating General Settings (Title, Description, Category, Language)...");
    await page.evaluate(() => {
      const setNativeValue = (element, value) => {
        const proto = element instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const valueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (valueSetter) {
          valueSetter.call(element, value);
        } else {
          element.value = value;
        }
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const titleInput = document.getElementById("settings-form-title");
      if (titleInput) setNativeValue(titleInput, "Student Registration");

      const descInput = document.getElementById("settings-form-description");
      if (descInput) setNativeValue(descInput, "Register for academic session 2025–2026.");

      const catSelect = document.getElementById("settings-form-category");
      if (catSelect) {
        catSelect.value = "Education";
        catSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const langSelect = document.getElementById("settings-form-language");
      if (langSelect) {
        langSelect.value = "English";
        langSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(500);

    // 6. Update Response Settings (Collect email addresses, Set response limit)
    console.log("6. Updating Response Settings toggles...");
    await page.click("#toggle-collect-emails");
    await delay(200);
    await page.click("#toggle-response-limit");
    await delay(400);

    await page.evaluate(() => {
      const numInput = document.querySelector("input[type='number']");
      if (numInput) {
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (valueSetter) valueSetter.call(numInput, "250");
        numInput.dispatchEvent(new Event("input", { bubbles: true }));
        numInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(400);

    // 7. Update Confirmation Message
    console.log("7. Updating Confirmation Message fields...");
    await page.evaluate(() => {
      const setNativeVal = (el, val) => {
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (valueSetter) valueSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const inputs = Array.from(document.querySelectorAll("input"));
      const titleInput = inputs.find((i) => i.placeholder === "Thank you!");
      if (titleInput) setNativeVal(titleInput, "Registration Confirmed!");

      const msgInput = inputs.find((i) => i.placeholder && i.placeholder.includes("submitted successfully"));
      if (msgInput) setNativeVal(msgInput, "See you at orientation session.");
    });
    await delay(2500); // Allow debounced autosave to persist

    // 8. Capture Desktop Screenshot
    const desktopScreenshot = path.join(ARTIFACT_DIR, "form_settings_desktop.png");
    await page.screenshot({ path: desktopScreenshot, fullPage: false });
    console.log("✓ Saved desktop settings screenshot:", desktopScreenshot);

    // 9. Test Live Preview device toggle (Mobile)
    console.log("9. Testing Live Preview Mobile device switcher...");
    await page.evaluate(() => {
      const mobileBtn = document.querySelector("button[aria-label='Mobile preview']");
      if (mobileBtn) mobileBtn.click();
    });
    await delay(600);

    const mobilePreviewScreenshot = path.join(ARTIFACT_DIR, "form_settings_mobile_preview.png");
    await page.screenshot({ path: mobilePreviewScreenshot, fullPage: false });
    console.log("✓ Saved mobile preview panel screenshot:", mobilePreviewScreenshot);

    // Switch back to desktop device
    await page.evaluate(() => {
      const desktopBtn = document.querySelector("button[aria-label='Desktop preview']");
      if (desktopBtn) desktopBtn.click();
    });
    await delay(400);

    // 10. Test Danger Zone confirmation dialog
    console.log("10. Testing Danger Zone Delete dialog...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const delBtn = btns.find((b) => b.innerText && b.innerText.includes("Delete Form"));
      if (delBtn) delBtn.click();
    });
    await delay(500);

    const dangerScreenshot = path.join(ARTIFACT_DIR, "form_settings_danger_dialog.png");
    await page.screenshot({ path: dangerScreenshot, fullPage: false });
    console.log("✓ Saved danger confirmation dialog screenshot:", dangerScreenshot);

    // Dismiss dialog
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("div[role='dialog'] button"));
      const cancelBtn = btns.find((b) => b.innerText && b.innerText.includes("Cancel"));
      if (cancelBtn) cancelBtn.click();
    });
    await delay(400);

    // 11. Test Tablet layout (768x1024)
    console.log("11. Testing Tablet layout (768x1024)...");
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
    await delay(500);
    const tabletScreenshot = path.join(ARTIFACT_DIR, "form_settings_tablet.png");
    await page.screenshot({ path: tabletScreenshot, fullPage: false });
    console.log("✓ Saved tablet settings screenshot:", tabletScreenshot);

    // 12. Verify Neon Database persistence
    console.log("12. Verifying Neon PostgreSQL persistence for settings...");
    const dbForm = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        description: true,
        definition: true,
        draftRevision: true,
      },
    });

    console.log("Persisted DB Form:", {
      id: dbForm.id,
      title: dbForm.title,
      description: dbForm.description,
      settings: dbForm.definition?.settings,
      draftRevision: dbForm.draftRevision,
    });

    if (dbForm.title !== "Student Registration") {
      throw new Error(`Expected title 'Student Registration', got '${dbForm.title}'`);
    }
    if (!dbForm.description?.includes("academic session 2025–2026")) {
      throw new Error(`Expected description with 'academic session 2025–2026', got '${dbForm.description}'`);
    }

    const settingsData = dbForm.definition?.settings;
    if (!settingsData) {
      throw new Error("Missing definition.settings in database");
    }
    if (settingsData.category !== "Education") {
      throw new Error(`Expected category 'Education', got '${settingsData.category}'`);
    }
    if (settingsData.collectEmailAddresses !== true) {
      throw new Error(`Expected collectEmailAddresses true, got '${settingsData.collectEmailAddresses}'`);
    }
    if (settingsData.setResponseLimit !== true || settingsData.responseLimit !== 250) {
      throw new Error(`Expected responseLimit 250, got '${settingsData.responseLimit}'`);
    }
    if (settingsData.confirmationTitle !== "Registration Confirmed!") {
      throw new Error(`Expected confirmationTitle 'Registration Confirmed!', got '${settingsData.confirmationTitle}'`);
    }

    console.log("✓ All settings validated directly from database!");
    console.log("\n=== ALL FORM SETTINGS VERIFICATIONS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
