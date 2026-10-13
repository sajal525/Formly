const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateSampleBannerFile(page) {
  const tmpPath = path.join(ARTIFACT_DIR, `sample_banner_${Date.now()}.png`);
  const base64Data = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 1200, 400);
    grad.addColorStop(0, "#329CF5");
    grad.addColorStop(0.5, "#563BFA");
    grad.addColorStop(1, "#ec4899");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 400);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("Formly Test Cover Banner", 300, 220);
    return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
  });
  fs.writeFileSync(tmpPath, Buffer.from(base64Data, "base64"));
  return tmpPath;
}

async function runTest() {
  console.log("=== Starting Profile Cover End-to-End Workflow Test ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  try {
    const testImagePath = await generateSampleBannerFile(page);
    console.log("Sample banner image prepared at:", testImagePath);

    // 1. Register a test user
    const testUsername = `user_cover_${Date.now().toString().slice(-6)}`;
    console.log(`1. Registering test user: ${testUsername}...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });

    await page.type("#reg-username-input", testUsername);
    await page.type("#reg-password-input", "Password123456!");
    const submitBtn = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      submitBtn.click(),
    ]);

    await delay(1000);

    // 2. Navigate to Profile page
    console.log("2. Navigating to /profile...");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    await delay(1000);

    // Verify Profile page elements
    const pageHeading = await page.$eval("h1", (el) => el.textContent);
    console.log("Page heading found:", pageHeading);
    assert.ok(pageHeading.includes("Profile"), "Must be on Profile page");

    // 3. Find and click "Change Cover" button
    console.log("3. Locating and clicking 'Change Cover' button...");
    const changeCoverBtn = await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent.includes("Change Cover"));
    }, { timeout: 8000 });
    assert.ok(changeCoverBtn, "'Change Cover' button must exist on profile banner");

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent.includes("Change Cover"));
      btn.click();
    });

    await delay(500);

    // 4. Verify Profile Cover Modal opens
    console.log("4. Verifying Cover Modal opened...");
    const modalTitle = await page.waitForSelector("#profile-cover-modal-title", { timeout: 5000 });
    const modalTitleText = await page.evaluate((el) => el.textContent, modalTitle);
    console.log("Modal title:", modalTitleText);
    assert.ok(
      modalTitleText.includes("Choose Profile Cover") || modalTitleText.includes("Adjust Profile Cover"),
      "Modal title should match profile cover flow"
    );

    // 5. Upload image via hidden input
    console.log("5. Uploading image to modal...");
    const fileInput = await page.waitForSelector('input[type="file"]');
    await fileInput.uploadFile(testImagePath);
    await delay(1500);

    // 6. Verify transition to Stage 2: Adjust Profile Cover
    console.log("6. Verifying transition to 'Adjust Profile Cover' stage...");
    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      return modal ? modal.innerText : "";
    });
    console.log("Modal contents after file upload:\n", modalText);

    const adjustTitle = await page.$eval("#profile-cover-modal-title", (el) => el.textContent);
    console.log("Adjust stage title:", adjustTitle);
    assert.ok(adjustTitle.includes("Adjust Profile Cover"), `Modal should enter adjustment stage. Current title: ${adjustTitle}`);

    // Verify all required adjustment controls are present
    console.log("7. Checking required controls: Replace Image, Reset, Cancel, Save Adjustments, Zoom, Angle, Pan...");
    const controlsExist = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasReplaceImage: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Replace Image")
        ),
        hasReset: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Reset")
        ),
        hasCancel: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Cancel")
        ),
        hasSaveAdjustments: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Save Adjustments")
        ),
        hasZoom: text.includes("Zoom"),
        hasAngle: text.includes("Angle"),
        hasRotateLeft: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Rotate Left")
        ),
        hasRotateRight: Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent.includes("Rotate Right")
        ),
      };
    });

    console.log("Controls status:", controlsExist);
    assert.ok(controlsExist.hasReplaceImage, "Must have 'Replace Image' button");
    assert.ok(controlsExist.hasReset, "Must have 'Reset' button");
    assert.ok(controlsExist.hasCancel, "Must have 'Cancel' button");
    assert.ok(controlsExist.hasSaveAdjustments, "Must have 'Save Adjustments' button");
    assert.ok(controlsExist.hasZoom, "Must have Zoom control");
    assert.ok(controlsExist.hasAngle, "Must have Angle control");
    assert.ok(controlsExist.hasRotateLeft, "Must have Rotate Left button");
    assert.ok(controlsExist.hasRotateRight, "Must have Rotate Right button");

    // 8. Test Rotation and Reset interactions
    console.log("8. Testing Rotate Right interaction...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Rotate Right")
      );
      if (btn) btn.click();
    });
    await delay(300);

    console.log("Testing Zoom slider interaction...");
    await page.evaluate(() => {
      const zoomInput = document.querySelector('input[aria-label="Cover zoom slider"]');
      if (zoomInput) {
        zoomInput.value = "1.5";
        zoomInput.dispatchEvent(new Event("input", { bubbles: true }));
        zoomInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(300);

    const zoomText = await page.evaluate(() => {
      return document.body.innerText.match(/150%/)?.[0] || "";
    });
    console.log("Zoom display value:", zoomText);

    // 9. Save Adjustments
    console.log("9. Clicking 'Save Adjustments'...");
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/v1/profile/cover") && res.request().method() === "POST",
        { timeout: 15000 }
      ),
      page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("button")).find((b) =>
          b.textContent.includes("Save Adjustments")
        );
        if (btn) btn.click();
      }),
    ]);

    const resJson = await response.json();
    console.log("Server response from POST /api/v1/profile/cover:", resJson);
    assert.strictEqual(response.status(), 200, "POST /api/v1/profile/cover must return 200 OK");
    assert.strictEqual(resJson.success, true, "Response must indicate success");
    assert.ok(resJson.coverUrl, "Response must include coverUrl");

    await delay(1000);

    // 10. Check that the banner immediately renders the cover image in DOM without refresh
    console.log("10. Verifying profile banner immediately displays cover image...");
    const coverImgSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="profile cover"]');
      return img ? img.getAttribute("src") : null;
    });
    console.log("Cover image src in DOM:", coverImgSrc);
    assert.ok(coverImgSrc && coverImgSrc.includes("/api/v1/profile/cover"), "Cover image must be visible in DOM immediately");

    // Take screenshot of live updated profile
    const liveScreenshotPath = path.join(ARTIFACT_DIR, "profile_cover_live_updated.png");
    await page.screenshot({ path: liveScreenshotPath });
    console.log("Live updated screenshot saved:", liveScreenshotPath);

    // 11. Test Persistence Across Page Reload
    console.log("11. Reloading page to test persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1000);

    const persistedCoverSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="profile cover"]');
      return img ? img.getAttribute("src") : null;
    });
    console.log("Persisted cover image src after reload:", persistedCoverSrc);
    assert.ok(
      persistedCoverSrc && persistedCoverSrc.includes("/api/v1/profile/cover"),
      "Cover image must persist across page refresh"
    );

    // 12. Test direct GET /api/v1/profile/cover
    console.log("12. Testing direct GET /api/v1/profile/cover endpoint...");
    const getRes = await page.goto("http://localhost:3000/api/v1/profile/cover");
    console.log("GET /api/v1/profile/cover status:", getRes.status(), "content-type:", getRes.headers()["content-type"]);
    assert.strictEqual(getRes.status(), 200, "Direct GET must return 200");
    assert.ok(
      getRes.headers()["content-type"]?.includes("image/jpeg") ||
      getRes.headers()["content-type"]?.includes("image/png"),
      "Must return image content-type"
    );

    // Take final screenshot
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    const finalScreenshotPath = path.join(ARTIFACT_DIR, "profile_cover_final_persisted.png");
    await page.screenshot({ path: finalScreenshotPath });
    console.log("Final persisted screenshot saved:", finalScreenshotPath);

    console.log("\n=======================================================");
    console.log("🎉 ALL PROFILE COVER WORKFLOW TESTS PASSED PERFECTLY!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
