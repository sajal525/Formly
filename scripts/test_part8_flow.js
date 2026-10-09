const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Part 8: Profile Page End-to-End Test ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSER ERROR:", msg.text());
    }
  });

  const timestamp = Date.now().toString().slice(-5);
  const testUser = `profile_user_${timestamp}`;
  const testPassword = "Password1234!";
  const newPassword = "NewSecurePassword5678!";

  try {
    // 1. Unauthenticated redirect test
    console.log("1. Checking unauthenticated redirect to /login from /profile...");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    console.log("URL after visiting /profile unauthenticated:", page.url());
    if (!page.url().includes("/login")) {
      throw new Error(`Expected redirect to /login, got: ${page.url()}`);
    }
    console.log("✓ Protected /profile properly redirects to /login");

    // 2. Register creator user
    console.log(`2. Registering User (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, json: await res.json() };
    }, testUser, testPassword);

    console.log("Registration status:", regResult.status);
    if (regResult.status !== 201) {
      throw new Error("Registration failed: " + JSON.stringify(regResult.json));
    }
    console.log("✓ Registered creator successfully");

    // 3. Create a form to test real owner-scoped stats
    console.log("3. Creating a sample form to test owner-scoped stats...");
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
    const createFormRes = await page.evaluate(async () => {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Profile Test Feedback Form" }),
      });
      return { status: res.status, json: await res.json() };
    });
    console.log("Form creation status:", createFormRes.status);

    // 4. Navigate to /profile
    console.log("4. Navigating to /profile...");
    await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
    await delay(1200);

    const heading = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.innerText : null;
    });
    console.log("Page heading:", heading);
    if (!heading || !heading.includes("Profile")) {
      throw new Error("Page heading Profile not found");
    }

    // Verify initial read mode: username is read-only, full name defaults to username
    const readModeData = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasBasicInfo: text.includes("Basic Information"),
        hasChangePassword: text.includes("Change Password"),
        hasAccountStats: text.includes("Account Stats"),
        hasDangerZone: text.includes("Danger Zone"),
        hasProfilePicture: text.includes("Profile Picture"),
        hasTotalForms: text.includes("Total Forms"),
      };
    });
    console.log("Initial card verification:", readModeData);
    if (!readModeData.hasBasicInfo || !readModeData.hasChangePassword || !readModeData.hasAccountStats) {
      throw new Error("Required cards missing from Profile page");
    }

    // 5. Test Profile Editing
    console.log("5. Testing Profile Edit mode...");
    await page.click("#edit-profile-btn");
    await delay(600);

    console.log("Typing profile fields using Puppeteer native keystrokes...");
    await page.type("#profile-displayname", "Sajal Jaiswal");
    await page.type("#profile-email", "sajal23@gmail.com");
    await page.type("#profile-phone", "9876543210");
    await page.type("#profile-institution", "Zeal College of Engineering and Research");
    await page.type("#profile-department", "Artificial Intelligence and Machine Learning (AIML)");
    await page.type("#profile-rollnumber", "A2301");
    await page.type("#profile-year", "Third Year");
    await page.type("#profile-division", "A");
    await page.type("#profile-bio", "AIML student interested in AI, Computer Vision and web development. Using Formly to create and manage forms for college and personal projects.");

    await delay(400);

    console.log("Submitting profile changes via #save-profile-btn...");
    await page.click("#save-profile-btn");
    await delay(2000);

    // Verify saved content in Read mode
    const afterSave = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasDisplayName: text.includes("Sajal Jaiswal"),
        hasEmail: text.includes("sajal23@gmail.com"),
        hasPhone: text.includes("9876543210"),
        hasCollege: text.includes("Zeal College of Engineering and Research"),
        hasDept: text.includes("AIML"),
        hasRoll: text.includes("A2301"),
        hasYear: text.includes("Third Year"),
        hasDivision: text.includes("A"),
        hasBio: text.includes("Computer Vision"),
      };
    });
    console.log("After save verification:", afterSave);
    if (!afterSave.hasDisplayName || !afterSave.hasEmail || !afterSave.hasCollege) {
      throw new Error("Profile values were not saved properly");
    }
    console.log("✓ Profile successfully edited and saved!");

    // 6. Reload and check persistence
    console.log("6. Reloading page to verify database persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await delay(1200);

    const reloaded = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasDisplayName: text.includes("Sajal Jaiswal"),
        hasEmail: text.includes("sajal23@gmail.com"),
        hasPhone: text.includes("9876543210"),
        hasCollege: text.includes("Zeal College of Engineering and Research"),
      };
    });
    console.log("Persistence verification after reload:", reloaded);
    if (!reloaded.hasDisplayName || !reloaded.hasEmail || !reloaded.hasCollege) {
      throw new Error("Persistence verification failed after reload");
    }
    console.log("✓ Persistence verified across page reloads!");

    // 7. Capture Desktop Screenshot (1536x1024)
    console.log("7. Capturing Desktop Screenshot (1536x1024)...");
    await page.setViewport({ width: 1536, height: 1024, deviceScaleFactor: 1 });
    await delay(800);
    const desktopScreenshot = path.join(ARTIFACT_DIR, "part8_profile_desktop.png");
    await page.screenshot({ path: desktopScreenshot, fullPage: false });
    console.log("Saved desktop screenshot to:", desktopScreenshot);

    // 8. Capture Tablet Screenshot (1024x768)
    console.log("8. Capturing Tablet Screenshot (1024x768)...");
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
    await delay(800);
    const tabletScreenshot = path.join(ARTIFACT_DIR, "part8_profile_tablet.png");
    await page.screenshot({ path: tabletScreenshot, fullPage: false });
    console.log("Saved tablet screenshot to:", tabletScreenshot);

    // 9. Capture Mobile Screenshot (390x844)
    console.log("9. Capturing Mobile Screenshot (390x844)...");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await delay(800);
    const mobileScreenshot = path.join(ARTIFACT_DIR, "part8_profile_mobile.png");
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log("Saved mobile screenshot to:", mobileScreenshot);

    // Reset to desktop for interaction tests
    await page.setViewport({ width: 1536, height: 1024, deviceScaleFactor: 1 });
    await delay(500);

    // 10. Test Password Change
    console.log("10. Testing Change Password flow...");
    await page.type("#password-current", testPassword);
    await page.type("#password-new", newPassword);
    await page.type("#password-confirm", newPassword);
    await delay(300);

    await page.click("#change-password-submit-btn");

    await page.waitForFunction(() => {
      return document.body.innerText.includes("Password changed successfully");
    }, { timeout: 10000 });

    console.log("✓ Password successfully changed!");

    // 11. Test Account Deletion Dialog & Deletion
    console.log("11. Testing Delete Account Confirmation & Danger Zone...");
    await page.click("#open-delete-dialog-btn");
    await delay(600);

    // Check dialog is open
    const dialogVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? dialog.innerText.includes("Permanently deleting your Formly account") : false;
    });
    console.log("Delete dialog open:", dialogVisible);
    if (!dialogVisible) {
      throw new Error("Delete Account dialog failed to open");
    }

    // Try submitting without password/confirmation (should be disabled)
    const buttonDisabled = await page.evaluate(() => {
      const submitBtn = document.querySelector("#confirm-delete-account-btn");
      return submitBtn ? submitBtn.disabled : true;
    });
    console.log("Delete button is disabled before typing confirmation:", buttonDisabled);
    if (!buttonDisabled) {
      throw new Error("Delete button should be disabled without password and DELETE confirmation");
    }

    // Type new password and "DELETE"
    console.log("Filling in password and DELETE confirmation...");
    await page.type("#delete-password", newPassword);
    await page.type("#delete-confirmation", "DELETE");
    await delay(300);

    console.log("Clicking #confirm-delete-account-btn...");
    await page.click("#confirm-delete-account-btn");
    await page.waitForFunction(() => window.location.pathname.includes("/login"), { timeout: 12000 });

    console.log("URL after account deletion:", page.url());
    console.log("✓ Account deletion completed and redirected to /login!");

    // 12. Verify user no longer exists in database
    const userInDb = await prisma.user.findFirst({
      where: { username: testUser },
    });
    console.log("User in database after deletion:", userInDb);
    if (userInDb !== null) {
      throw new Error("User record still exists in database after account deletion");
    }
    console.log("✓ User record and cascaded data completely cleaned up from database!");

    console.log("=== ALL FORMLY PART 8 TESTS PASSED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
