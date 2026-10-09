const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

async function run() {
  console.log("=== Starting Step 4 My Forms Verification ===");
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
  const userA = `creator4_${timestamp}`;
  const userAPassword = "SecurePassword123!";
  const userB = `other4_${timestamp}`;
  const userBPassword = "SecurePassword123!";

  // 1. Test unauthenticated redirect
  console.log("1. Checking unauthenticated redirect to /login from /my-forms...");
  await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
  console.log("URL after visiting /my-forms unauthenticated:", page.url());
  if (!page.url().includes("/login")) {
    throw new Error(`Expected redirect to /login, got: ${page.url()}`);
  }

  // 2. Register User A
  console.log(`2. Registering User A (${userA})...`);
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", userA);
  await page.type("#reg-password-input", userAPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  // 3. Navigate to /my-forms via sidebar
  console.log("3. Navigating to /my-forms via sidebar...");
  await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
  const myFormsSidebarLink = await page.$('a[href="/my-forms"]');
  if (!myFormsSidebarLink) {
    throw new Error("My Forms sidebar link not found!");
  }
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    myFormsSidebarLink.click(),
  ]);
  console.log("Arrived at:", page.url());
  if (!page.url().includes("/my-forms")) {
    throw new Error(`Expected /my-forms, got: ${page.url()}`);
  }

  // 4. Check initial empty state
  console.log("4. Verifying empty state...");
  const hasEmptyState = await page.evaluate(() => {
    return (
      document.body.innerText.includes("No forms yet") &&
      document.body.innerText.includes("Create your first form")
    );
  });
  console.log("Has initial empty state:", hasEmptyState);
  if (!hasEmptyState) {
    throw new Error("Initial empty state not rendered!");
  }

  // 5. Create First Form using "+ Create Form" -> "Blank Form"
  console.log("5. Creating Form 1: Student Registration...");
  // Click Create Form dropdown button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Create Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Click "Blank Form" option inside dropdown
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Blank Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  await page.type("#form-title-input", "Student Registration");
  await page.type("#form-desc-input", "Registration form for new students in AIML");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector("#form-title-input"), { timeout: 10000 });
  await page.waitForFunction(() => document.body.innerText.includes("Student Registration"), { timeout: 10000 });

  // Verify Form 1 is now displayed in the list
  const hasForm1 = await page.evaluate(() => {
    return document.body.innerText.includes("Student Registration");
  });
  console.log("Form 1 displayed:", hasForm1);
  if (!hasForm1) {
    throw new Error("Form 1 not found in list!");
  }

  // 6. Create Form 2: Event Feedback
  console.log("6. Creating Form 2: Event Feedback...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Create Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Blank Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  await page.type("#form-title-input", "Event Feedback");
  await page.type("#form-desc-input", "Feedback form for annual tech symposium");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector("#form-title-input"), { timeout: 10000 });
  await page.waitForFunction(() => document.body.innerText.includes("Event Feedback"), { timeout: 10000 });

  // 7. Create Form 3: Class Survey
  console.log("7. Creating Form 3: Class Survey...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Create Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Blank Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  await page.type("#form-title-input", "Class Survey");
  await page.type("#form-desc-input", "Quick weekly feedback survey for class");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector("#form-title-input"), { timeout: 10000 });
  await page.waitForFunction(() => document.body.innerText.includes("Class Survey"), { timeout: 10000 });

  // 8. Create Form 4: Hackathon Registration
  console.log("8. Creating Form 4: Hackathon Registration...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Create Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent && b.textContent.includes("Blank Form"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.waitForSelector("#form-title-input", { timeout: 5000 });
  await page.type("#form-title-input", "Hackathon Registration");
  await page.type("#form-desc-input", "Team registration for hackathon");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector("#form-title-input"), { timeout: 10000 });
  await page.waitForFunction(() => document.body.innerText.includes("Hackathon Registration"), { timeout: 10000 });

  // Check counts
  const badgeCounts = await page.evaluate(() => {
    const allTab = document.querySelector('button[role="tab"]');
    return document.body.innerText.includes("All") && document.body.innerText.includes("Drafts");
  });
  console.log("Status tabs rendered:", badgeCounts);

  // 9. Search Functionality
  console.log("9. Testing search for 'Hackathon'...");
  const searchInput = await page.$('input[placeholder="Search forms..."]');
  await searchInput.type("Hackathon");
  await page.waitForFunction(
    () =>
      document.body.innerText.includes("Hackathon Registration") &&
      !document.body.innerText.includes("Student Registration"),
    { timeout: 10000 }
  );

  const searchResultsMatch = await page.evaluate(() => {
    const text = document.body.innerText;
    return (
      text.includes("Hackathon Registration") &&
      !text.includes("Student Registration") &&
      !text.includes("Event Feedback")
    );
  });
  console.log("Search matches only 'Hackathon Registration':", searchResultsMatch);
  if (!searchResultsMatch) {
    throw new Error("Search filter failed!");
  }

  // Clear search
  console.log("Clearing search input...");
  await page.evaluate(() => {
    const clearBtn = document.querySelector('button[aria-label="Clear search"]');
    if (clearBtn) {
      clearBtn.click();
    } else {
      const input = document.querySelector('input[placeholder="Search forms..."]');
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  });
  await page.waitForFunction(() => document.body.innerText.includes("Student Registration"), { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 500));

  // 10. Test View Details Dialog
  console.log("10. Testing View Details modal on Student Registration...");
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const studentRow = rows.find((r) => r.innerText.includes("Student Registration"));
    if (studentRow) {
      const viewBtn = studentRow.querySelector('button[title="View form details"]') || studentRow.querySelector("button");
      if (viewBtn) viewBtn.click();
    }
  });
  await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });

  const modalDetails = await page.evaluate(() => {
    const modal = document.querySelector('div[role="dialog"]');
    if (!modal) return null;
    return {
      title: modal.innerText.includes("Form Details"),
      hasStudent: modal.innerText.includes("Student Registration"),
      hasDesc: modal.innerText.includes("Registration form for new students in AIML"),
      hasTruthfulMetrics: modal.innerText.includes("Not tracked yet"),
    };
  });
  console.log("Details modal verification:", modalDetails);
  if (!modalDetails || !modalDetails.title || !modalDetails.hasStudent) {
    throw new Error("Details modal failed!");
  }

  // Close details dialog
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // 11. Test Rename Action
  console.log("11. Testing Rename action on 'Class Survey' -> 'Class Survey 2026'...");
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const targetRow = rows.find((r) => r.innerText.includes("Class Survey"));
    if (targetRow) {
      const moreBtn = targetRow.querySelector('button[aria-label="More options"]');
      if (moreBtn) moreBtn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  // Click Rename in menu
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const renameBtn = btns.find((b) => b.textContent && b.textContent.includes("Rename"));
    if (renameBtn) renameBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.waitForSelector("#rename-input", { timeout: 5000 });
  await page.evaluate(() => {
    const input = document.querySelector("#rename-input");
    if (input) {
      input.value = "";
    }
  });
  await page.type("#rename-input", "Class Survey 2026");
  await page.evaluate(() => {
    const modal = document.querySelector('div[role="dialog"]');
    const submitBtn = modal ? modal.querySelector('button[type="submit"]') : document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  // Wait for dialog to close
  await page.waitForFunction(() => !document.querySelector('#rename-input'), { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  const hasRenamed = await page.evaluate(() => {
    return document.body.innerText.includes("Class Survey 2026");
  });
  console.log("Table has 'Class Survey 2026':", hasRenamed);
  if (!hasRenamed) {
    throw new Error("Rename failed!");
  }

  // 12. Test Archive & Restore Action
  console.log("12. Testing Archive on 'Class Survey 2026'...");
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const targetRow = rows.find((r) => r.innerText.includes("Class Survey 2026"));
    if (targetRow) {
      const moreBtn = targetRow.querySelector('button[aria-label="More options"]');
      if (moreBtn) moreBtn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const archiveBtn = btns.find((b) => b.textContent && b.textContent.includes("Archive form"));
    if (archiveBtn) archiveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Check Archived Tab
  console.log("Clicking 'Archived' tab...");
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    const archTab = tabs.find((t) => t.textContent && t.textContent.includes("Archived"));
    if (archTab) archTab.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const hasArchivedItem = await page.evaluate(() => {
    return document.body.innerText.includes("Class Survey 2026");
  });
  console.log("Archived tab shows 'Class Survey 2026':", hasArchivedItem);
  if (!hasArchivedItem) {
    throw new Error("Archived tab does not show archived form!");
  }

  // Restore the archived form
  console.log("Restoring 'Class Survey 2026'...");
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const targetRow = rows.find((r) => r.innerText.includes("Class Survey 2026"));
    if (targetRow) {
      const moreBtn = targetRow.querySelector('button[aria-label="More options"]');
      if (moreBtn) moreBtn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const restoreBtn = btns.find((b) => b.textContent && b.textContent.includes("Restore form"));
    if (restoreBtn) restoreBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Go back to All tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    const allTab = tabs.find((t) => t.textContent && t.textContent.includes("All"));
    if (allTab) allTab.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("Student Registration"), { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));

  // 13. Test Grid View Toggle
  console.log("13. Testing Grid view toggle...");
  await page.evaluate(() => {
    const gridBtn = document.querySelector('button[title="Grid view"]');
    if (gridBtn) gridBtn.click();
  });
  await page.waitForSelector('.grid', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 500));

  // 14. Screenshots for Desktop (Light & Dark), Tablet, Mobile
  console.log("14. Capturing visual artifacts for verification...");
  
  // Desktop Light Grid
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "my_forms_desktop_light_grid.png") });

  // Toggle back to List
  await page.evaluate(() => {
    const listBtn = document.querySelector('button[title="List view"]');
    if (listBtn) listBtn.click();
  });
  await page.waitForSelector('table', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 500));

  // Desktop Light List
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "my_forms_desktop_light_list.png") });

  // Desktop Dark List
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "my_forms_desktop_dark_list.png") });

  // Tablet (1024x768)
  console.log("Capturing Tablet layout (1024x768)...");
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "my_forms_tablet_light.png") });

  // Mobile (375x812)
  console.log("Capturing Mobile layout (375x812)...");
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "my_forms_mobile_light.png") });

  // 15. Sign Out User A and register User B to verify strictly owner-scoped data
  console.log("15. Verifying user isolation and privacy with User B...");
  await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
  // Sign out User A
  await page.evaluate(() => {
    const avatarBtn = document.querySelector('header button[aria-haspopup="true"]');
    if (avatarBtn) avatarBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const signOutBtn = btns.find((b) => b.textContent && b.textContent.includes("Sign out"));
      if (signOutBtn) signOutBtn.click();
    }),
  ]);

  // Register User B
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", userB);
  await page.type("#reg-password-input", userBPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  // User B goes to /my-forms
  await page.goto("http://localhost:3000/my-forms", { waitUntil: "networkidle0" });
  const userBSeesUserAForms = await page.evaluate(() => {
    const text = document.body.innerText;
    return (
      text.includes("Student Registration") ||
      text.includes("Event Feedback") ||
      text.includes("Class Survey 2026") ||
      text.includes("Hackathon Registration")
    );
  });
  console.log("User B sees User A's forms:", userBSeesUserAForms);
  if (userBSeesUserAForms) {
    throw new Error("CRITICAL SECURITY ERROR: User B can see User A's forms!");
  }

  const userBHasCleanEmptyState = await page.evaluate(() => {
    return document.body.innerText.includes("No forms yet");
  });
  console.log("User B has clean zero forms empty state:", userBHasCleanEmptyState);
  if (!userBHasCleanEmptyState) {
    throw new Error("User B did not see empty state!");
  }

  console.log("=== ALL STEP 4 TESTS PASSED FLAWLESSLY! ===");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
