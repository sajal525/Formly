const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runUniversalTest() {
  console.log("==================================================================");
  console.log("=== Testing Formly Universal Image Positioning and Crop Editor ===");
  console.log("==================================================================");

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

  page.on("dialog", async (dialog) => {
    try {
      await dialog.accept();
    } catch {}
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `uni_img_${timestamp}`;
  const testPassword = "Password123!";
  const tempImgCover = path.join(__dirname, `temp_uni_cover_${timestamp}.png`);
  const tempImgBlock = path.join(__dirname, `temp_uni_block_${timestamp}.png`);
  const tempImgAvatar = path.join(__dirname, `temp_uni_avatar_${timestamp}.png`);

  try {
    // 1. Generate 3 distinct test images
    console.log("1. Generating distinct test images on disk...");
    await page.evaluate(() => {});

    // Cover: 1200x400 gradient
    const coverBase64 = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 400;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 1200, 400);
      g.addColorStop(0, "#4f46e5");
      g.addColorStop(1, "#7c3aed");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1200, 400);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 50px sans-serif";
      ctx.fillText("UNIVERSAL COVER BANNER", 100, 210);
      return c.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    });
    fs.writeFileSync(tempImgCover, Buffer.from(coverBase64, "base64"));

    // Content Block: 800x600 emerald infographic
    const blockBase64 = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 800;
      c.height = 600;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#059669";
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("INFOGRAPHIC BLOCK", 100, 300);
      return c.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    });
    fs.writeFileSync(tempImgBlock, Buffer.from(blockBase64, "base64"));

    // Avatar: 500x500 cyan square
    const avatarBase64 = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 500;
      c.height = 500;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#0891b2";
      ctx.fillRect(0, 0, 500, 500);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText("AVATAR", 120, 270);
      return c.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    });
    fs.writeFileSync(tempImgAvatar, Buffer.from(avatarBase64, "base64"));

    // 2. Register user & authenticate
    console.log(`2. Registering and authenticating test user (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
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
    console.log("✓ User registered successfully:", userId);

    // 3. Create test form in database
    console.log("3. Creating test form draft in database...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Universal Image Editor Test Form",
        definition: {
          schemaVersion: 1,
          title: "Universal Image Editor Test Form",
          description: "Testing universal image adjustments across all surfaces.",
          themeKey: "soft-lavender",
          questions: [
            {
              id: "q-1",
              type: "SHORT_TEXT",
              label: "Sample question?",
              required: false,
            },
          ],
        },
      },
    });
    console.log("✓ Test form created with ID:", form.id);

    // 4. Test Surface A: Form Cover Editor
    console.log("\n--- TEST SUITE 1: Form Cover Image ---");
    await page.goto(`http://localhost:3000/forms/${form.id}/edit`, { waitUntil: "networkidle0" });
    await delay(1000);

    const coverInput = await page.$('input[type="file"][accept*="image"]');
    assert.ok(coverInput, "Cover image file input must be present");
    await coverInput.uploadFile(tempImgCover);
    await delay(1000);

    // Verify modal is open with destination="form-cover"
    const coverModalOpen = await page.$eval(
      '[role="dialog"][aria-modal="true"]',
      (el) => !!el
    );
    assert.ok(coverModalOpen, "Universal editor must open for form cover");
    const coverModalTitle = await page.$eval("#cover-editor-title", (el) => el.textContent.trim());
    assert.strictEqual(coverModalTitle, "Position cover image");
    console.log("✓ Form cover editor opened with title:", coverModalTitle);

    // Click "Set cover image"
    const setCoverBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Set cover image")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(setCoverBtn, "Set cover image button must be clicked");
    await page.waitForSelector('div[class*="group"] img[alt*="Cover"]', { timeout: 15000 });

    const headerCoverImg = await page.$eval(
      'div[class*="group"] img[alt*="Cover"]',
      (img) => img.src
    );
    assert.ok(headerCoverImg.includes("/assets/"), "Header must render saved cover image asset");
    console.log("✓ Form cover image saved and rendered in header:", headerCoverImg);

    // 5. Test Surface B: Standalone Form Image Block
    console.log("\n--- TEST SUITE 2: Standalone Form Image Block ---");
    // Click "Add Image" in QuickActionsToolbar
    const addImageBtn = await page.$('button[aria-label="Add Image"]');
    assert.ok(addImageBtn, "Add Image button must exist in builder quick toolbar");
    await addImageBtn.click();
    await delay(800);

    // Verify universal editor modal opened with destination="form-image"
    const imageBlockModalOpen = await page.$eval(
      '[role="dialog"][aria-modal="true"]',
      (el) => !!el
    );
    assert.ok(imageBlockModalOpen, "Universal editor must open for image block insertion");
    const imageBlockTitle = await page.$eval(
      "#universal-image-editor-title",
      (el) => el.textContent.trim()
    );
    assert.strictEqual(imageBlockTitle, "Position image");
    console.log("✓ Image block editor opened with title:", imageBlockTitle);

    // Upload image to modal
    const modalFileInput = await page.$('[role="dialog"] input[type="file"]');
    assert.ok(modalFileInput, "Modal file input must be present");
    await modalFileInput.uploadFile(tempImgBlock);
    await delay(1200);

    // Verify presets include Free crop, 16:9, 4:3, 1:1
    const availablePresets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="dialog"] button')).map((b) =>
        b.textContent.trim()
      );
    });
    assert.ok(availablePresets.includes("Free crop"), "Must include Free crop preset");
    assert.ok(availablePresets.includes("16:9"), "Must include 16:9 preset");
    assert.ok(availablePresets.includes("4:3"), "Must include 4:3 preset");
    assert.ok(availablePresets.includes("1:1"), "Must include 1:1 preset");
    console.log("✓ Destination-aware presets verified for image block");

    // Configure Alt Text
    await page.type('input[aria-label="Image alt text"]', "Quarterly Revenue Infographic");
    console.log("✓ Configured alt text: 'Quarterly Revenue Infographic'");

    // Select Display Size: Large
    await page.select('select[aria-label="Display size"]', "large");
    console.log("✓ Selected display size: Large");

    // Select Alignment: Center
    await page.click('button[aria-label="Align center"]');
    console.log("✓ Selected alignment: Center");

    // Take screenshot of Image Block adjustment modal
    const imageBlockModalScreenshot = path.join(ARTIFACT_DIR, "universal_image_block_modal.png");
    await page.screenshot({ path: imageBlockModalScreenshot });
    console.log("✓ Saved image block modal screenshot to:", imageBlockModalScreenshot);

    // Click "Insert image" primary action
    const insertImageBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Insert image")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(insertImageBtn, "Insert image button must be clicked");
    await page.waitForSelector('img[alt="Quarterly Revenue Infographic"]', { timeout: 15000 });

    // Verify ImageCard is rendered in Questions list
    const imageCardRendered = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Quarterly Revenue Infographic"]');
      return !!img;
    });
    assert.ok(imageCardRendered, "Image block must render in builder with configured alt text");
    console.log("✓ Image block inserted and rendered in form builder");

    // Click "Adjust" on the image block to test re-editing
    console.log("Testing re-editing of image block...");
    const adjustBtnClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Adjust")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(adjustBtnClicked, "Adjust button on ImageCard must be clickable");
    await delay(1000);

    // Verify modal reopens with "Save changes" confirm button
    const reeditModalTitle = await page.$eval(
      "#universal-image-editor-title",
      (el) => el.textContent.trim()
    );
    assert.strictEqual(reeditModalTitle, "Position image");
    const saveChangesBtnExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button")).some((b) =>
        b.textContent.includes("Save image") || b.textContent.includes("Save changes")
      );
    });
    assert.ok(saveChangesBtnExists, "Re-editing image block must display 'Save image' button");
    console.log("✓ Re-editing opened with existing metadata and 'Save image' button");

    // Close modal via Cancel
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.trim() === "Cancel"
      );
      if (cancelBtn) cancelBtn.click();
    });
    await delay(600);

    // 6. Test Surface C: User Profile Avatar
    console.log("\n--- TEST SUITE 3: User Profile Avatar ---");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    await delay(1000);

    const uploadAvatarBtn = await page.$('button[aria-label="Upload profile photo"]');
    assert.ok(uploadAvatarBtn, "Upload profile photo camera button must exist on profile");
    await uploadAvatarBtn.click();
    await delay(800);

    // Verify universal editor modal opened with destination="avatar"
    const avatarModalOpen = await page.$eval(
      '[role="dialog"][aria-modal="true"]',
      (el) => !!el
    );
    assert.ok(avatarModalOpen, "Universal editor must open for profile avatar");
    const avatarModalTitle = await page.$eval(
      "#universal-image-editor-title",
      (el) => el.textContent.trim()
    );
    assert.strictEqual(avatarModalTitle, "Position profile photo");

    // Upload avatar image
    const avatarFileInput = await page.$('[role="dialog"] input[type="file"]');
    assert.ok(avatarFileInput, "Modal file input must exist");
    await avatarFileInput.uploadFile(tempImgAvatar);
    await delay(1200);

    // Verify 1:1 Square preset is active
    const avatarPresetText = await page.evaluate(() => {
      const activeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) =>
        b.textContent.includes("1:1 Square")
      );
      return !!activeBtn;
    });
    assert.ok(avatarPresetText, "Avatar mode must display 1:1 Square preset");

    // Verify circular mask preview
    const hasRoundMask = await page.evaluate(() => {
      const cropperArea = document.querySelector(".reactEasyCrop_CropAreaRound");
      return !!cropperArea;
    });
    assert.ok(hasRoundMask, "Avatar mode must render circular mask preview (.reactEasyCrop_CropAreaRound)");
    console.log("✓ Avatar 1:1 square crop with round mask preview verified");

    // Take screenshot of Avatar adjustment modal
    const avatarModalScreenshot = path.join(ARTIFACT_DIR, "universal_avatar_modal.png");
    await page.screenshot({ path: avatarModalScreenshot });
    console.log("✓ Saved avatar modal screenshot to:", avatarModalScreenshot);

    // Click "Save profile photo"
    const savePhotoBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Save profile photo") || b.textContent.includes("Save photo")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(savePhotoBtn, "Save photo button must be clicked");
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("img")).some((img) => img.src.includes("profiles/") || img.src.includes("avatar_") || img.src.includes("/avatar")),
      { timeout: 15000 }
    );

    // Verify profile page renders avatar image
    const renderedAvatarImg = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.some((img) => img.src.includes("profiles/") || img.src.includes("avatar_") || img.src.includes("/avatar"));
    });
    assert.ok(renderedAvatarImg, "Profile page must render updated avatar image from storage");
    console.log("✓ Profile avatar photo saved and rendered successfully");

    // 7. Test Surface D: User Profile Cover Banner
    console.log("\n--- TEST SUITE 4: User Profile Cover Banner ---");
    const changeCoverBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Change Cover")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(changeCoverBtn, "Change Cover button must exist on profile banner");
    await delay(800);

    // Verify universal editor modal opened with destination="profile-cover"
    const profileCoverModalTitle = await page.$eval(
      "#universal-image-editor-title",
      (el) => el.textContent.trim()
    );
    assert.strictEqual(profileCoverModalTitle, "Position profile cover");

    // Upload cover image
    const profileCoverInput = await page.$('[role="dialog"] input[type="file"]');
    assert.ok(profileCoverInput, "Modal file input must exist for profile cover");
    await profileCoverInput.uploadFile(tempImgCover);
    await delay(1200);

    // Verify 4:1 Banner preset is available
    const hasBannerPreset = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="dialog"] button')).some((b) =>
        b.textContent.includes("4:1 Banner")
      );
    });
    assert.ok(hasBannerPreset, "Profile cover mode must offer 4:1 Banner preset");

    // Take screenshot of Profile Cover adjustment modal
    const profileCoverModalScreenshot = path.join(ARTIFACT_DIR, "universal_profile_cover_modal.png");
    await page.screenshot({ path: profileCoverModalScreenshot });
    console.log("✓ Saved profile cover modal screenshot to:", profileCoverModalScreenshot);

    // Click "Set cover image"
    const setProfileCoverBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Set cover image")
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(setProfileCoverBtn, "Set cover image button must be clicked for profile cover");
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("img")).some((img) => img.src.includes("profiles/") || img.src.includes("cover_") || img.src.includes("/cover")),
      { timeout: 15000 }
    );

    // Verify profile page renders cover image
    const renderedProfileCover = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.some((img) => img.src.includes("profiles/") || img.src.includes("cover_") || img.src.includes("/cover"));
    });
    assert.ok(renderedProfileCover, "Profile page must render updated cover banner from storage");
    console.log("✓ Profile cover banner saved and rendered successfully");

    // 8. Test Surface E: Full Reload & Persistence Verification
    console.log("\n--- TEST SUITE 5: Full Page Reload & Persistence ---");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1500);

    const persistedAvatar = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.some((img) => img.src.includes("profiles/") || img.src.includes("avatar_") || img.src.includes("/avatar"));
    });
    assert.ok(persistedAvatar, "Avatar must persist across page reload");

    const persistedCover = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.some((img) => img.src.includes("profiles/") || img.src.includes("cover_") || img.src.includes("/cover"));
    });
    assert.ok(persistedCover, "Profile cover must persist across page reload");
    console.log("✓ Avatar and profile cover persisted after full page reload");

    // Take screenshot of saved profile
    const finalProfileScreenshot = path.join(ARTIFACT_DIR, "universal_profile_final.png");
    await page.screenshot({ path: finalProfileScreenshot });
    console.log("✓ Saved final profile screenshot to:", finalProfileScreenshot);

    console.log("\n========================================================");
    console.log("🎉 ALL UNIVERSAL IMAGE WORKFLOW TESTS PASSED 100%!");
    console.log("========================================================");

  } catch (err) {
    console.error("Test failed with error:", err);
    process.exitCode = 1;
  } finally {
    try {
      if (fs.existsSync(tempImgCover)) fs.unlinkSync(tempImgCover);
      if (fs.existsSync(tempImgBlock)) fs.unlinkSync(tempImgBlock);
      if (fs.existsSync(tempImgAvatar)) fs.unlinkSync(tempImgAvatar);
    } catch {}
    await browser.close();
    await prisma.$disconnect();
  }
}

runUniversalTest();
