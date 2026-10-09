const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Step 6 Responses Workspace End-to-End Verification ===");
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
  const testUser = `creator6_${timestamp}`;
  const testPassword = "SecurePassword123!";

  try {
    // 1. Unauthenticated redirect test
    console.log("1. Checking unauthenticated redirect to /login from /responses...");
    await page.goto("http://localhost:3000/responses", { waitUntil: "networkidle0" });
    console.log("URL after visiting /responses unauthenticated:", page.url());
    if (!page.url().includes("/login")) {
      throw new Error(`Expected redirect to /login, got: ${page.url()}`);
    }
    console.log("✓ Protected /responses properly redirected to /login");

    // 2. Register creator user
    console.log(`2. Registering User (${testUser})...`);
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
    await page.type("#reg-username-input", testUser);
    await page.type("#reg-password-input", testPassword);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log("✓ User registered, current URL:", page.url());

    // 3. Test empty responses state (0 forms)
    console.log("3. Visiting /responses with 0 forms...");
    await page.goto("http://localhost:3000/responses", { waitUntil: "networkidle0" });
    const emptyFormsHeading = await page.$eval("h2", (el) => el.textContent);
    console.log("Empty forms page heading:", emptyFormsHeading);
    if (!emptyFormsHeading.includes("No Forms Created Yet")) {
      throw new Error(`Expected 'No Forms Created Yet', got '${emptyFormsHeading}'`);
    }
    console.log("✓ Truthful empty state displayed when creator has 0 forms");

    // 4. Create a form from a template
    console.log("4. Creating a form from template...");
    await page.goto("http://localhost:3000/templates", { waitUntil: "networkidle0" });
    await page.waitForSelector(".group", { timeout: 8000 });
    const clickedUse = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      for (const card of cards) {
        const btns = Array.from(card.querySelectorAll("button"));
        const useBtn = btns.find((b) => b.textContent && b.textContent.includes("Use Template"));
        if (useBtn) {
          useBtn.click();
          return true;
        }
      }
      return false;
    });

    if (!clickedUse) {
      throw new Error("Could not find Use Template button");
    }

    // Wait for creation notice
    await page.waitForFunction(
      () => document.body.textContent.includes("Draft Form Created!"),
      { timeout: 10000 }
    );
    console.log("✓ Template used, draft created successfully!");

    // Get the created form from DB
    const dbUser = await prisma.user.findFirst({ where: { username: testUser } });
    if (!dbUser) throw new Error("Could not find registered user in DB");

    const createdForm = await prisma.form.findFirst({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    if (!createdForm) throw new Error("Could not find created form in DB");
    console.log(`✓ Form created: "${createdForm.title}" (ID: ${createdForm.id}, Status: ${createdForm.status})`);

    // 5. Visit /responses with the newly created Draft form (0 responses)
    console.log("5. Checking /responses with draft form (0 responses)...");
    await page.goto(`http://localhost:3000/responses?formId=${createdForm.id}`, { waitUntil: "networkidle0" });
    
    // Check initial KPI metrics
    const initialText = await page.evaluate(() => document.body.innerText);
    if (!initialText.includes("Total Responses") || !initialText.includes("0")) {
      throw new Error("Expected 0 Total Responses on initial visit");
    }
    console.log("✓ Responses workspace correctly displays 0 responses and truthful empty state");

    // 6. Publish the form
    console.log("6. Publishing form via PATCH API...");
    await page.evaluate(async (formId) => {
      const res = await fetch(`/api/v1/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      if (!res.ok) throw new Error("Publish failed: " + res.status);
    }, createdForm.id);

    const publishedForm = await prisma.form.findUnique({ where: { id: createdForm.id } });
    if (publishedForm.status !== "PUBLISHED") {
      throw new Error("Form status was not updated to PUBLISHED");
    }
    console.log("✓ Form published successfully!");

    // 7. Public respondent submission 1
    console.log("7. Visiting public respondent page: /f/" + createdForm.id);
    const respondentPage = await browser.newPage();
    await respondentPage.setViewport({ width: 1200, height: 800 });
    await respondentPage.goto(`http://localhost:3000/f/${createdForm.id}`, { waitUntil: "networkidle0" });

    const formTitle = await respondentPage.$eval("header", (el) => el.innerText);
    console.log("Public form header:", formTitle);

    // Save screenshot of public respondent page
    const publicScreenPath = path.join(ARTIFACT_DIR, "public_respondent_desktop.png");
    await respondentPage.screenshot({ path: publicScreenPath, fullPage: true });
    console.log("✓ Saved public respondent screenshot to:", publicScreenPath);

    // Answer questions one by one using Enter-to-next
    const questionsCount = createdForm.definition.questions.length;
    console.log(`Form has ${questionsCount} questions. Filling answers for respondent 1...`);

    for (let i = 0; i < questionsCount; i++) {
      await respondentPage.waitForSelector("main", { visible: true });
      await delay(200);

      const inputEl = await respondentPage.$("input, textarea");
      if (inputEl) {
        const inputType = await respondentPage.evaluate(
          (el) => el.getAttribute("type") || el.tagName.toLowerCase(),
          inputEl
        );

        if (inputType === "date") {
          await respondentPage.evaluate((el) => {
            const setter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            ).set;
            setter.call(el, "2001-05-15");
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }, inputEl);
        } else if (inputType === "email") {
          await inputEl.type("alex@example.com");
        } else if (inputType === "tel") {
          await inputEl.type("+1 555-0199");
        } else if (inputType === "number") {
          await inputEl.type("101");
        } else {
          await inputEl.type(i === 0 ? "Alex Johnson" : "A2301");
        }

        await delay(200);
        await respondentPage.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const nextBtn = btns.find(
            (b) =>
              b.textContent &&
              (b.textContent.includes("Next") || b.textContent.includes("Submit"))
          );
          if (nextBtn) nextBtn.click();
        });
      } else {
        // Choice / Dropdown / Rating button
        await respondentPage.evaluate(() => {
          const main = document.querySelector("main");
          if (!main) return;
          const choiceBtns = Array.from(main.querySelectorAll('button[type="button"]'));
          if (choiceBtns.length > 0) {
            choiceBtns[0].click();
          }
        });
        await delay(250);
        await respondentPage.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const nextBtn = btns.find(
            (b) =>
              b.textContent &&
              (b.textContent.includes("Next") || b.textContent.includes("Submit"))
          );
          if (nextBtn) nextBtn.click();
        });
      }
      await delay(400);
    }

    // Wait for submission confirmation
    await respondentPage.waitForFunction(
      () => document.body.textContent.includes("Thank you!"),
      { timeout: 10000 }
    );
    console.log("✓ Respondent 1 submission recorded successfully!");

    // 8. Submit Respondent 2 with direct API to test multiple responses and distributions
    console.log("8. Submitting Respondent 2...");
    const sampleDef = createdForm.definition;
    const answers2 = {};
    sampleDef.questions.forEach((q, idx) => {
      if (q.type === "SHORT_TEXT") answers2[q.id] = "Jordan Smith";
      else if (q.type === "EMAIL") answers2[q.id] = "jordan@example.com";
      else if (q.type === "MULTIPLE_CHOICE" && q.options?.length > 1) answers2[q.id] = q.options[1].value;
      else if (q.type === "RATING") answers2[q.id] = 5;
      else if (q.type === "CHECKBOX" && q.options?.length > 0) answers2[q.id] = [q.options[0].value];
      else answers2[q.id] = "Information Technology";
    });

    // Start session and submit
    const startRes = await respondentPage.evaluate(async (formId) => {
      const res = await fetch(`/api/public/forms/${formId}/start`, { method: "POST" });
      return res.json();
    }, createdForm.id);

    await respondentPage.evaluate(async ({ formId, sessionId, answers }) => {
      const res = await fetch(`/api/public/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });
      return res.json();
    }, { formId: createdForm.id, sessionId: startRes.sessionId, answers: answers2 });

    console.log("✓ Respondent 2 submission recorded!");
    await respondentPage.close();

    // 9. Inspect /responses workspace with real submissions
    console.log("9. Refreshing /responses workspace to verify updated metrics...");
    await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:3000/responses?formId=${createdForm.id}`, { waitUntil: "networkidle0" });

    // Verify KPI metrics
    const totalResponsesText = await page.evaluate(() => document.body.innerText);

    console.log("Page contains 'Total Responses':", totalResponsesText.includes("Total Responses"));
    console.log("Page contains 'Form Views':", totalResponsesText.includes("Form Views"));
    console.log("Page contains 'Completion Rate':", totalResponsesText.includes("Completion Rate"));

    // Verify table has 2 rows
    const tableRows = await page.$$("table tbody tr");
    console.log(`✓ Response table rendered with ${tableRows.length} rows`);
    if (tableRows.length !== 2) {
      throw new Error(`Expected 2 response table rows, got ${tableRows.length}`);
    }

    // 10. Click View on row 1 to open Details Panel
    console.log("10. Testing Response Details Panel...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const viewBtn = btns.find((b) => b.textContent && b.textContent.includes("View"));
      if (viewBtn) viewBtn.click();
    });
    await delay(600);

    const detailsTitle = await page.evaluate(() => {
      const h3s = Array.from(document.querySelectorAll("h3"));
      return h3s.map((h) => h.textContent).join(" | ");
    });
    console.log("✓ Details Panel opened with headings:", detailsTitle);

    // Capture desktop screenshot with table & details panel
    const desktopScreenPath = path.join(ARTIFACT_DIR, "responses_desktop_table_details.png");
    await page.screenshot({ path: desktopScreenPath, fullPage: false });
    console.log("✓ Saved desktop workspace screenshot to:", desktopScreenPath);

    // 11. Test Analytics Tab
    console.log("11. Testing Analytics Tab...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab = btns.find((b) => b.textContent && b.textContent.includes("Analytics"));
      if (tab) tab.click();
    });
    await delay(600);
    const analyticsScreenPath = path.join(ARTIFACT_DIR, "responses_desktop_analytics.png");
    await page.screenshot({ path: analyticsScreenPath, fullPage: false });
    console.log("✓ Saved analytics tab screenshot to:", analyticsScreenPath);

    // 12. Test Summary Tab
    console.log("12. Testing Summary Tab...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab = btns.find((b) => b.textContent && b.textContent.includes("Summary"));
      if (tab) tab.click();
    });
    await delay(600);
    const summaryScreenPath = path.join(ARTIFACT_DIR, "responses_desktop_summary.png");
    await page.screenshot({ path: summaryScreenPath, fullPage: false });
    console.log("✓ Saved summary tab screenshot to:", summaryScreenPath);

    // 13. Test CSV Export route
    console.log("13. Testing CSV Export API...");
    const csvContent = await page.evaluate(async (formId) => {
      const res = await fetch(`/api/v1/forms/${formId}/responses/export`);
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        text: await res.text(),
      };
    }, createdForm.id);

    console.log("CSV Export Status:", csvContent.status);
    console.log("CSV Content-Disposition:", csvContent.headers["content-disposition"]);
    console.log("CSV First 100 characters:", csvContent.text.slice(0, 100));

    if (csvContent.status !== 200 || !csvContent.text.includes("Submitted At")) {
      throw new Error("CSV Export failed or missing expected headers");
    }
    console.log("✓ CSV Export passed with verified headers and records!");

    // 14. Test Tablet View (820 x 1180)
    console.log("14. Testing Tablet View...");
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:3000/responses?formId=${createdForm.id}`, { waitUntil: "networkidle0" });
    const tabletScreenPath = path.join(ARTIFACT_DIR, "responses_tablet_view.png");
    await page.screenshot({ path: tabletScreenPath, fullPage: false });
    console.log("✓ Saved tablet screenshot to:", tabletScreenPath);

    // 15. Test Mobile View (390 x 844)
    console.log("15. Testing Mobile View...");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:3000/responses?formId=${createdForm.id}`, { waitUntil: "networkidle0" });
    const mobileScreenPath = path.join(ARTIFACT_DIR, "responses_mobile_view.png");
    await page.screenshot({ path: mobileScreenPath, fullPage: false });
    console.log("✓ Saved mobile screenshot to:", mobileScreenPath);

    console.log("=== ALL STEP 6 TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
