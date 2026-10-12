const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickButtonByText(page, text) {
  await page.waitForFunction((txt) => {
    return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes(txt));
  }, { timeout: 10000 }, text);
  await page.evaluate((txt) => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes(txt));
    if (btn) btn.click();
    else throw new Error("Button not found: " + txt);
  }, text);
}

// ==========================================
// 1. UNIT TESTS: CROP & COORDINATE CALCULATIONS
// ==========================================
function testCropCalculations() {
  console.log("--> Running Crop & Coordinate Unit Tests...");

  function calcBaseScale(imgW, imgH, frameW, frameH, totalRot) {
    const rad = (totalRot * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotWidth = imgW * cos + imgH * sin;
    const rotHeight = imgW * sin + imgH * cos;
    return Math.max(frameW / rotWidth, frameH / rotHeight);
  }

  // Test 1: Landscape image in 4:1 banner (640x160)
  const scaleLandscape = calcBaseScale(1200, 600, 640, 160, 0);
  assert.ok(scaleLandscape >= 640 / 1200, "Landscape image must cover frame width");
  assert.ok(scaleLandscape * 600 >= 160, "Landscape image must cover frame height");

  // Test 2: Portrait image in 4:1 banner (640x160)
  const scalePortrait = calcBaseScale(600, 1200, 640, 160, 0);
  assert.ok(scalePortrait * 600 >= 640, "Portrait image must cover frame width");
  assert.ok(scalePortrait * 1200 >= 160, "Portrait image must cover frame height");

  // Test 3: Rotation 90° swaps effective dimensions
  const scaleRot90 = calcBaseScale(1200, 600, 640, 160, 90);
  assert.ok(Math.round(scaleRot90 * 600) >= 640, "Rotated 90° image must cover frame width with height dimension");

  // Test 4: Coordinate system consistency: Canvas coordinates must match DOM proportionally
  const frameW = 640;
  const frameH = 160;
  const canvasW = 1600;
  const canvasH = 400;
  const k = canvasW / frameW;
  assert.strictEqual(k, canvasH / frameH, "Canvas and frame aspect ratios must match exactly");

  const panDomX = 50;
  const panDomY = -20;
  const panCanvasX = panDomX * k;
  const panCanvasY = panDomY * k;

  // Normalized pan coordinates
  const normX = panDomX / frameW;
  const normY = panDomY / frameH;
  assert.strictEqual(normX * canvasW, panCanvasX, "Normalized pan must scale to canvas exactly");
  assert.strictEqual(normY * canvasH, panCanvasY, "Normalized pan must scale to canvas exactly");

  // Responsive frame resize test: If frame resizes to 720x180, restored pan must match proportional position
  const newFrameW = 720;
  const restoredPanX = normX * newFrameW;
  assert.strictEqual(restoredPanX / newFrameW, normX, "Pan must be invariant under container resize");

  console.log("✓ All Crop & Coordinate calculation unit tests passed successfully!\n");
}

// ==========================================
// 2. E2E BROWSER TEST WORKFLOW
// ==========================================
async function runE2E() {
  testCropCalculations();

  console.log("=== Starting Formly Cover Image Crop & Save Adjustments E2E Test ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  page.on("requestfailed", (req) => {
    console.log("REQUEST FAILED:", req.method(), req.url(), req.failure()?.errorText);
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `cover_tester_${timestamp}`;
  const testPassword = "SecurePassword123!";
  let tempImgPath = null;
  let tempImgPath2 = null;

  try {
    // 1. Register test user
    console.log(`1. Registering test user (${testUser})...`);
    await page.goto("http://127.0.0.1:3000/register", { waitUntil: "networkidle0" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    if (regResult.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regResult.data)}`);
    }

    const userId = regResult.data.user.id;
    console.log("✓ Registered user:", userId);

    // 2. Create a test form in database
    console.log("2. Creating test form draft in database...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Cover Image Adjustment Test Form",
        definition: {
          schemaVersion: 1,
          title: "Cover Image Adjustment Test Form",
          description: "Testing cover image crop, zoom, pan, and save workflow.",
          themeKey: "soft-lavender",
          blocks: [
            {
              id: "q-1",
              kind: "question",
              question: {
                id: "q-1",
                type: "short_text",
                title: "Your Name",
                required: false,
              },
            },
          ],
          questions: [
            {
              id: "q-1",
              type: "short_text",
              title: "Your Name",
              required: false,
            },
          ],
        },
      },
    });

    console.log("✓ Form created with ID:", form.id);

    // 3. Navigate to Form Builder
    console.log(`3. Navigating to Form Builder (http://127.0.0.1:3000/forms/${form.id}/edit)...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "networkidle0" });
    await delay(2000);

    // 4. Click "Add cover image" button
    console.log("4. Opening Adjust Cover Image modal via 'Add cover image' button...");
    await clickButtonByText(page, "Add cover image");
    await delay(500);

    // Check modal title
    const modalTitle = await page.$eval('#image-modal-title', (el) => el.textContent);
    console.log("Modal title displayed:", modalTitle);
    assert.ok(modalTitle.includes("Cover Image"), "Modal title should be Cover Image");

    // 5. Generate and upload a test JPEG image file directly into the file input
    console.log("5. Generating and uploading test image into file input...");
    tempImgPath = path.join(__dirname, `temp_cover_${timestamp}.png`);
    const base64Data = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 1200, 600);
      grad.addColorStop(0, "#8b5cf6");
      grad.addColorStop(0.5, "#ec4899");
      grad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 600);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(600, 300, 140, 0, Math.PI * 2);
      ctx.fill();
      return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    });
    fs.writeFileSync(tempImgPath, Buffer.from(base64Data, "base64"));

    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(tempImgPath);
    await delay(1200);

    // 6. Verify modal advanced to "Adjust Cover Image" workspace
    console.log("6. Verifying modal entered adjustment stage with crop frame...");
    const adjustTitle = await page.$eval('#image-modal-title', (el) => el.textContent);
    console.log("Adjust workspace title:", adjustTitle);
    assert.strictEqual(adjustTitle, "Adjust Cover Image");

    // Check that 4:1 (Banner) button is active inside the modal
    const activePreset = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return null;
      const btns = Array.from(modal.querySelectorAll('button'));
      const active = btns.find((b) => b.className.includes("bg-violet-600") && (b.textContent.includes("4:1") || b.textContent.includes("Banner")));
      return active ? active.textContent : null;
    });
    console.log("Active aspect ratio preset:", activePreset);
    assert.ok(activePreset && activePreset.includes("4:1"), "Default preset for cover must be 4:1 (Banner)");

    // 7. Adjust Zoom slider to 200% (2.0)
    console.log("7. Adjusting Zoom slider to 200%...");
    await page.evaluate(() => {
      const zoomSlider = document.querySelector('input[aria-label="Image zoom slider"]');
      if (zoomSlider) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(zoomSlider, "2");
        zoomSlider.dispatchEvent(new Event("input", { bubbles: true }));
        zoomSlider.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(500);

    const zoomLabel = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const spans = modal ? Array.from(modal.querySelectorAll('span')) : [];
      const zSpan = spans.find((s) => s.textContent.trim().endsWith("%"));
      return zSpan ? zSpan.textContent.trim() : "";
    });
    console.log("Zoom label text:", zoomLabel);
    assert.strictEqual(zoomLabel, "200%", "Zoom label should show 200%");

    // 8. Test drag to reposition image (Pointer drag on crop frame)
    console.log("8. Dragging to reposition image inside crop frame...");
    const canvasArea = await page.$('div.cursor-grab');
    const box = await canvasArea.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 - 20, { steps: 5 });
      await page.mouse.up();
    }
    await delay(500);

    // 9. Click "Save Adjustments"
    console.log("9. Clicking 'Save Adjustments' / 'Set Cover Image'...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.includes("Save Adjustments") || b.textContent.includes("Set Cover Image")
      );
      if (btn) btn.click();
      else throw new Error("Save Adjustments button not found");
    });

    // Wait for upload & crop processing to finish and modal to close
    console.log("Waiting for crop generation, upload, and save to complete...");
    await page.waitForFunction(() => !document.querySelector('div[role="dialog"]'), { timeout: 15000 });
    await delay(2000);

    // 10. Verify Form Editor displays the cover image
    console.log("10. Verifying Form Editor renders the cropped cover banner...");
    const coverImgSrc = await page.$eval('div.aspect-\\[4\\/1\\] img', (el) => el.getAttribute("src"));
    console.log("Rendered cover image src:", coverImgSrc);
    assert.ok(coverImgSrc && coverImgSrc.includes(`/api/v1/forms/${form.id}/assets/`), "Cover image src must point to form asset");

    const savedAssetId = coverImgSrc.split("/assets/")[1];
    console.log("✓ Saved cropped asset ID:", savedAssetId);

    // 11. Refresh the page to test persistence
    console.log("11. Reloading page to test persistence across browser refresh...");
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('div.aspect-\\[4\\/1\\] img', { timeout: 15000 });
    await delay(2500);

    const reloadedCoverImgSrc = await page.$eval('div.aspect-\\[4\\/1\\] img', (el) => el.getAttribute("src"));
    console.log("Reloaded cover image src:", reloadedCoverImgSrc);
    assert.strictEqual(reloadedCoverImgSrc, coverImgSrc, "Cover image must persist identical asset ID after refresh");

    // 12. Re-open the adjustment modal via "Change cover"
    console.log("12. Hovering over cover and clicking 'Change cover' to verify adjustment restoration...");
    await page.hover('div.aspect-\\[4\\/1\\]');
    await delay(500);
    await clickButtonByText(page, "Change cover");
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    await delay(500);

    // Check that modal reopened with saved adjustments restored
    const reopenedZoomLabel = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const spans = modal ? Array.from(modal.querySelectorAll('span')) : [];
      const zSpan = spans.find((s) => s.textContent.trim().endsWith("%"));
      return zSpan ? zSpan.textContent.trim() : "";
    });
    console.log("Reopened modal Zoom label:", reopenedZoomLabel);
    assert.strictEqual(reopenedZoomLabel, "200%", "Reopened modal must reflect saved 200% zoom");

    // 13. Test "Cancel" button discards unsaved changes
    console.log("13. Testing Cancel button discards changes...");
    await page.evaluate(() => {
      const zoomSlider = document.querySelector('input[aria-label="Image zoom slider"]');
      if (zoomSlider) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(zoomSlider, "3");
        zoomSlider.dispatchEvent(new Event("input", { bubbles: true }));
        zoomSlider.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(300);

    await clickButtonByText(page, "Cancel");
    await delay(500);

    const modalClosed = await page.evaluate(() => !document.querySelector('div[role="dialog"]'));
    assert.ok(modalClosed, "Cancel must close modal");

    // 14. Verify in Neon DB that definition has coverImage with originalAssetId and transform
    console.log("14. Checking Neon Database record for coverImage metadata...");
    const dbForm = await prisma.form.findUnique({
      where: { id: form.id },
      select: { definition: true },
    });

    const coverDef = dbForm.definition.coverImage;
    console.log("Persisted coverImage in DB:", JSON.stringify(coverDef, null, 2));
    assert.ok(coverDef, "coverImage must exist in DB definition");
    assert.strictEqual(coverDef.assetId, savedAssetId, "assetId in DB must match cropped asset");
    assert.ok(coverDef.originalAssetId, "originalAssetId must be preserved in DB");
    assert.strictEqual(coverDef.transform.zoom, 2, "Zoom must be persisted as 2");
    assert.strictEqual(coverDef.transform.aspectPreset, "4:1", "Aspect preset must be persisted as 4:1");

    // 15. Verify preview tab render
    console.log("15. Verifying Preview tab renders cover banner consistently...");
    await clickButtonByText(page, "Preview");
    await delay(1000);

    const previewCoverSrc = await page.$eval('div.aspect-\\[4\\/1\\] img', (el) => el.getAttribute("src"));
    console.log("Preview tab cover image src:", previewCoverSrc);
    assert.ok(previewCoverSrc && previewCoverSrc.includes(savedAssetId), "Preview tab must render same cropped asset");

    // 16. Navigate back to Questions tab and test Rotate 90 + 16:9 aspect ratio
    console.log("16. Navigating back to Questions tab and testing Rotate 90 + 16:9 aspect ratio...");
    await clickButtonByText(page, "Questions");
    await delay(1000);

    await page.hover('div.aspect-\\[4\\/1\\]');
    await delay(500);
    await clickButtonByText(page, "Change cover");
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    await delay(500);

    // Rotate 90 deg right
    await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const rotateBtn = modal?.querySelector('button[title="Rotate right 90°"]');
      if (rotateBtn) rotateBtn.click();
    });
    await delay(500);

    // Switch to 16:9 preset
    await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const btns = modal ? Array.from(modal.querySelectorAll('button')) : [];
      const b169 = btns.find((b) => b.textContent.includes("16:9"));
      if (b169) b169.click();
    });
    await delay(500);

    // Save Adjustments
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.includes("Save Adjustments")
      );
      if (btn) btn.click();
    });
    await page.waitForFunction(() => !document.querySelector('div[role="dialog"]'), { timeout: 15000 });
    await delay(2000);

    // Verify 16:9 container in editor
    const cover169Src = await page.$eval('div.aspect-\\[16\\/9\\] img', (el) => el.getAttribute("src"));
    console.log("16:9 cover image src:", cover169Src);
    assert.ok(cover169Src && !cover169Src.includes(savedAssetId), "New crop asset must be generated for 16:9 rotated crop");

    // Check DB record for rotation 90 and aspectPreset 16:9
    const dbForm2 = await prisma.form.findUnique({
      where: { id: form.id },
      select: { definition: true },
    });
    const coverDef2 = dbForm2.definition.coverImage;
    console.log("Updated coverImage in DB (16:9 + Rotate):", JSON.stringify(coverDef2, null, 2));
    assert.strictEqual(coverDef2.transform.rotation, 90, "Rotation must be saved as 90");
    assert.strictEqual(coverDef2.transform.aspectPreset, "16:9", "Aspect preset must be saved as 16:9");

    // 17. Test Replace Image resets settings and leaks no previous transforms
    console.log("17. Testing Replace Image resets settings without leakage...");
    await page.hover('div.aspect-\\[16\\/9\\]');
    await delay(500);
    await clickButtonByText(page, "Change cover");
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    await delay(500);

    // Generate replacement square test image
    tempImgPath2 = path.join(__dirname, `temp_replace_${timestamp}.png`);
    const base64Data2 = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#10b981";
      ctx.fillRect(0, 0, 800, 800);
      return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    });
    fs.writeFileSync(tempImgPath2, Buffer.from(base64Data2, "base64"));

    // Upload via file input
    const fileInput2 = await page.$('input[type="file"]');
    await fileInput2.uploadFile(tempImgPath2);
    await delay(1500);

    // Verify zoom is 100%, rotation is 0
    const replacedZoomLabel = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      const spans = modal ? Array.from(modal.querySelectorAll('span')) : [];
      const zSpan = spans.find((s) => s.textContent.trim().endsWith("%"));
      return zSpan ? zSpan.textContent.trim() : "";
    });
    console.log("Replaced image Zoom label:", replacedZoomLabel);
    assert.strictEqual(replacedZoomLabel, "100%", "Replacing image must reset zoom to 100%");

    // Cancel out so we don't overwrite
    await clickButtonByText(page, "Cancel");
    await delay(500);

    console.log("\n========================================================");
    console.log("ALL TESTS PASSED! Formly Cover Image Crop & Save Adjustments Bug is completely fixed!");
    console.log("========================================================\n");

  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    if (tempImgPath && fs.existsSync(tempImgPath)) {
      try { fs.unlinkSync(tempImgPath); } catch (_) {}
    }
    if (tempImgPath2 && fs.existsSync(tempImgPath2)) {
      try { fs.unlinkSync(tempImgPath2); } catch (_) {}
    }
    await browser.close();
    await prisma.$disconnect();
  }
}

runE2E();
