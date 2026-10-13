const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateSampleImages(page) {
  const bannerPath = path.join(ARTIFACT_DIR, `test_cover_${Date.now()}.png`);
  const avatarPath = path.join(ARTIFACT_DIR, `test_avatar_${Date.now()}.png`);

  const { bannerData, avatarData } = await page.evaluate(() => {
    // 1. Banner
    const bCanvas = document.createElement("canvas");
    bCanvas.width = 1200;
    bCanvas.height = 400;
    const bCtx = bCanvas.getContext("2d");
    const bGrad = bCtx.createLinearGradient(0, 0, 1200, 400);
    bGrad.addColorStop(0, "#329CF5");
    bGrad.addColorStop(0.5, "#563BFA");
    bGrad.addColorStop(1, "#8B5CF6");
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, 0, 1200, 400);
    bCtx.fillStyle = "#ffffff";
    bCtx.font = "bold 44px sans-serif";
    bCtx.fillText("Formly Test Cover Image", 340, 210);

    // 2. Avatar
    const aCanvas = document.createElement("canvas");
    aCanvas.width = 512;
    aCanvas.height = 512;
    const aCtx = aCanvas.getContext("2d");
    aCtx.fillStyle = "#1e1b4b";
    aCtx.fillRect(0, 0, 512, 512);
    aCtx.beginPath();
    aCtx.arc(256, 256, 200, 0, Math.PI * 2);
    aCtx.fillStyle = "#563BFA";
    aCtx.fill();
    aCtx.fillStyle = "#ffffff";
    aCtx.font = "bold 160px sans-serif";
    aCtx.textAlign = "center";
    aCtx.textBaseline = "middle";
    aCtx.fillText("⚡", 256, 260);

    return {
      bannerData: bCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""),
      avatarData: aCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""),
    };
  });

  fs.writeFileSync(bannerPath, Buffer.from(bannerData, "base64"));
  fs.writeFileSync(avatarPath, Buffer.from(avatarData, "base64"));

  return { bannerPath, avatarPath };
}

async function runTest() {
  console.log("=== Starting Profile Uploads Full Workflow Test ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  try {
    // 0. Generate test images
    const { bannerPath, avatarPath } = await generateSampleImages(page);
    console.log("✓ Sample banner generated at:", bannerPath);
    console.log("✓ Sample avatar generated at:", avatarPath);

    // 1. Register test user
    const username = `upload_tester_${Date.now().toString().slice(-6)}`;
    console.log(`1. Registering test user: ${username}...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", username);
    await page.type("#reg-password-input", "Password123456!");
    const regBtn = await page.$('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
      regBtn.click(),
    ]);

    // 2. Navigate to Profile page
    console.log("2. Navigating to /profile...");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    await delay(1000);

    // 3. Verify that "Storage not configured" and "Image uploads are not ready yet" alerts are NOT present
    console.log("3. Checking for misleading warning alerts...");
    const pageText = await page.evaluate(() => document.body.innerText);
    assert.ok(
      !pageText.includes("Storage not configured: Cloudflare R2 credentials"),
      "Storage not configured alert must NOT be displayed"
    );
    assert.ok(
      !pageText.includes("Image uploads are not ready yet: Secure Cloudflare R2"),
      "Image uploads are not ready yet banner must NOT be displayed"
    );
    console.log("✓ No false storage warnings found!");

    // 4. Test "Upload New Photo" in ProfilePictureCard
    console.log("4. Testing 'Upload New Photo' in ProfilePictureCard...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const uploadBtn = btns.find((b) => b.textContent.includes("Upload New Photo"));
      if (uploadBtn) uploadBtn.click();
    });
    await delay(600);

    // Verify avatar modal opened
    const modalTitle = await page.waitForSelector("#avatar-modal-title", { timeout: 5000 });
    const modalTitleText = await page.evaluate((el) => el.textContent, modalTitle);
    console.log("Avatar modal title:", modalTitleText);
    assert.ok(modalTitleText.includes("Profile Picture"), "Avatar modal must be open");

    // Select file in avatar modal
    console.log("5. Uploading avatar file into modal...");
    const fileInput = await page.$('input[type="file"][accept*="image"]');
    assert.ok(fileInput, "File input must exist in modal");
    await fileInput.uploadFile(avatarPath);
    await delay(1000);

    // Verify modal is now in "adjust" stage
    const adjustTitle = await page.evaluate(() => document.querySelector("#avatar-modal-title")?.textContent);
    console.log("Modal adjusted stage title:", adjustTitle);
    assert.ok(adjustTitle.includes("Adjust Profile Picture"), "Must advance to Adjust stage");

    // Click "Zoom In" and adjust
    await page.evaluate(() => {
      const zoomInBtn = document.querySelector('button[title="Zoom In"]');
      if (zoomInBtn) zoomInBtn.click();
    });
    await delay(300);

    // Click "Save Photo"
    console.log("6. Saving avatar adjustments...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const saveBtn = btns.find((b) => b.textContent.includes("Save Photo"));
      if (saveBtn) saveBtn.click();
    });

    // Wait for modal to close and avatar image to appear in DOM
    await page.waitForFunction(() => {
      return !document.querySelector("#avatar-modal-title");
    }, { timeout: 15000 });
    await delay(1000);

    // Verify avatar image is rendered in ProfilePictureCard and ProfileBanner
    const avatarImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt*="profile picture"]'));
      return imgs.map((i) => i.src);
    });
    console.log("Rendered avatar images:", avatarImages);
    assert.ok(avatarImages.length >= 2, "Avatar image must be rendered in both Banner and Picture Card");
    assert.ok(avatarImages[0].includes("/api/v1/profile/avatar"), "Avatar src must point to avatar API");

    // 7. Verify persistence across page reload
    console.log("7. Testing persistence across page reload...");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1000);

    const reloadedAvatars = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt*="profile picture"]'));
      return imgs.map((i) => i.src);
    });
    console.log("Reloaded avatar images:", reloadedAvatars);
    assert.ok(reloadedAvatars.length >= 2, "Avatar image must persist after page refresh");
    assert.ok(reloadedAvatars[0].includes("/api/v1/profile/avatar"), "Avatar src must persist across refresh");

    // 8. Test Banner Camera icon button opens modal
    console.log("8. Testing Camera button on ProfileBanner...");
    await page.click('button[aria-label="Upload profile photo"]');
    await delay(500);
    const cameraModalTitle = await page.waitForSelector("#avatar-modal-title", { timeout: 5000 });
    assert.ok(cameraModalTitle, "Camera button must open avatar modal");

    // Cancel modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cancelBtn = btns.find((b) => b.textContent.includes("Cancel"));
      if (cancelBtn) cancelBtn.click();
    });
    await delay(500);

    // 9. Test "Change Cover" button
    console.log("9. Testing 'Change Cover' button on ProfileBanner...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const coverBtn = btns.find((b) => b.textContent.includes("Change Cover"));
      if (coverBtn) coverBtn.click();
    });
    await delay(600);

    // Upload banner image
    const coverFileInput = await page.$('input[type="file"][accept*="image"]');
    assert.ok(coverFileInput, "Cover file input must exist in modal");
    await coverFileInput.uploadFile(bannerPath);
    await delay(1000);

    // Save cover adjustments
    console.log("10. Saving cover adjustments...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const saveBtn = btns.find((b) => b.textContent.includes("Save Adjustments"));
      if (saveBtn) saveBtn.click();
    });

    await page.waitForFunction(() => {
      return !document.querySelector("#profile-cover-modal-title");
    }, { timeout: 15000 });
    await delay(1000);

    // Verify cover image rendered on banner
    const coverSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="profile cover"]');
      return img?.src;
    });
    console.log("Rendered cover image src:", coverSrc);
    assert.ok(coverSrc && coverSrc.includes("/api/v1/profile/cover"), "Cover image must be rendered on banner");

    // 11. Test "Remove Photo" in ProfilePictureCard
    console.log("11. Testing 'Remove Photo' button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const removeBtn = btns.find((b) => b.textContent.includes("Remove Photo"));
      if (removeBtn) removeBtn.click();
    });
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt*="profile picture"]'));
      return imgs.length === 0;
    }, { timeout: 10000 });

    // Verify avatar images are gone and initials are restored
    const afterRemoveImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt*="profile picture"]'));
      return imgs.length;
    });
    console.log("Avatar images after remove:", afterRemoveImgs);
    assert.strictEqual(afterRemoveImgs, 0, "Custom avatar images must be removed");

    // Verify persistence of removal after reload
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1000);
    const afterReloadRemoveImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt*="profile picture"]'));
      return imgs.length;
    });
    assert.strictEqual(afterReloadRemoveImgs, 0, "Removal must persist after reload");

    // Capture clean profile screenshot
    const profileScreenshot = path.join(ARTIFACT_DIR, "profile_uploads_verified.png");
    await page.screenshot({ path: profileScreenshot });
    console.log("✓ Profile screenshot saved to:", profileScreenshot);

    console.log("\n=======================================================");
    console.log("🎉 ALL PROFILE UPLOAD AND STORAGE TESTS PASSED PERFECTLY!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
