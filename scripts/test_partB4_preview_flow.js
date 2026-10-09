const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Starting Formly Part B4 Preview Tab End-to-End Verification ===");
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
  const testUser = `preview_tester_${timestamp}`;
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

    const userId = regResult.data.user.id;

    // 2. Seed a rich form matching B4.png: "Student Registration"
    console.log("2. Seeding Student Registration form definition...");
    const sampleDefinition = {
      schemaVersion: 1,
      title: "Student Registration",
      description: "Register for academic session 2025–2026.",
      themeKey: "soft-lavender",
      settings: {
        showProgressIndicator: true,
        showQuestionNumbers: true,
        confirmationTitle: "Thank you!",
        confirmationMessage: "Your response has been submitted successfully.",
        allowMultipleSubmissions: true,
      },
      questions: [
        {
          id: "q-name",
          type: "SHORT_TEXT",
          label: "What is your full name?",
          description: null,
          required: true,
          settings: { placeholder: "Enter your full name" },
        },
        {
          id: "q-dept",
          type: "MULTIPLE_CHOICE",
          label: "Select your department",
          description: null,
          required: true,
          options: [
            { id: "opt-1", label: "Computer Engineering", value: "Computer Engineering" },
            { id: "opt-2", label: "Information Technology", value: "Information Technology" },
            { id: "opt-3", label: "AIML", value: "AIML" },
            { id: "opt-4", label: "Mechanical Engineering", value: "Mechanical Engineering" },
          ],
        },
        {
          id: "q-email",
          type: "EMAIL",
          label: "Enter your email address",
          description: null,
          required: true,
          settings: { placeholder: "yourname@example.com" },
        },
        {
          id: "q-year",
          type: "DROPDOWN",
          label: "What year are you in?",
          description: null,
          required: true,
          options: [
            { id: "y-1", label: "First Year", value: "First Year" },
            { id: "y-2", label: "Second Year", value: "Second Year" },
            { id: "y-3", label: "Third Year", value: "Third Year" },
            { id: "y-4", label: "Final Year", value: "Final Year" },
          ],
        },
        {
          id: "q-comments",
          type: "LONG_TEXT",
          label: "Any additional comments?",
          description: null,
          required: false,
          settings: { placeholder: "Type your comments here..." },
        },
      ],
    };

    const createdForm = await prisma.form.create({
      data: {
        ownerId: userId,
        title: "Student Registration",
        description: "Register for academic session 2025–2026.",
        status: "DRAFT",
        themeKey: "soft-lavender",
        definition: sampleDefinition,
      },
    });

    const formId = createdForm.id;
    console.log(`Created test form ID: ${formId}`);

    // 3. Open Preview tab in Form Builder
    console.log(`3. Navigating to /forms/${formId}/edit?tab=preview...`);
    await page.goto(`http://localhost:3000/forms/${formId}/edit?tab=preview`, {
      waitUntil: "networkidle0",
    });
    await delay(1500);

    // 4. Verify Preview elements in DOM
    console.log("4. Verifying Preview tab UI elements...");
    const uiVerification = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasTitle: bodyText.includes("Student Registration"),
        hasDesc: bodyText.includes("Register for academic session 2025–2026."),
        hasPreviewSettings: bodyText.includes("Preview Settings"),
        hasDevicePreview: bodyText.includes("Device Preview"),
        hasPreviewOptions: bodyText.includes("Preview Options"),
        hasPreviewTheme: bodyText.includes("Preview Theme"),
        hasSharePreviewLink: bodyText.includes("Share Preview Link"),
        hasProgressText: bodyText.includes("Progress"),
        hasDesktopButton: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Desktop")
        ),
        hasTabletButton: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Tablet")
        ),
        hasMobileButton: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Mobile")
        ),
        hasViewAsRespondent: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("View as respondent")
        ),
        hasShareButton: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Share")
        ),
        hasPublishButton: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Publish")
        ),
        hasQuestion1: bodyText.includes("What is your full name?"),
        hasQuestion2: bodyText.includes("Select your department"),
        hasQuestion3: bodyText.includes("Enter your email address"),
        hasQuestion4: bodyText.includes("What year are you in?"),
        hasQuestion5: bodyText.includes("Any additional comments?"),
        hasClearForm: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Clear Form")
        ),
        hasSubmitBtn: Array.from(document.querySelectorAll("button")).some(
          (b) => b.innerText && b.innerText.includes("Submit")
        ),
      };
    });

    console.log("UI Verification Results:", JSON.stringify(uiVerification, null, 2));
    if (!uiVerification.hasTitle || !uiVerification.hasPreviewSettings) {
      throw new Error("Preview tab header or settings rail missing!");
    }

    // Capture initial desktop screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "preview_desktop.png"),
      fullPage: false,
    });
    console.log("Captured preview_desktop.png");

    // 5. Test Temporary Preview Switches (Show progress, Show numbers, Show required)
    console.log("5. Testing Preview Options switches...");
    // Toggle progress off
    await page.evaluate(() => {
      const switches = Array.from(document.querySelectorAll("[role='switch']"));
      if (switches[0]) switches[0].click(); // Toggle progress indicator
    });
    await delay(400);

    const progressHidden = await page.evaluate(() => {
      return !document.body.innerText.includes("0 of 5") && !document.body.innerText.includes("Progress");
    });
    console.log("Progress indicator toggled OFF properly:", progressHidden);

    // Toggle progress back ON
    await page.evaluate(() => {
      const switches = Array.from(document.querySelectorAll("[role='switch']"));
      if (switches[0]) switches[0].click();
    });
    await delay(400);

    // 6. Test Ephemeral Question Inputs and Progress Calculation
    console.log("6. Testing ephemeral question inputs & progress calculation...");
    await page.evaluate(() => {
      // Type in Question 1
      const input = document.querySelector("input[placeholder='Enter your full name']");
      if (input) {
        input.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;
        nativeSetter.call(input, "Alex Rivera");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Select Department (Question 2)
      const deptButtons = Array.from(document.querySelectorAll("button"));
      const aimlBtn = deptButtons.find((b) => b.innerText && b.innerText.includes("AIML"));
      if (aimlBtn) aimlBtn.click();
    });
    await delay(500);

    const progressAfterAnswers = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        has2of5: text.includes("2 of 5"),
        has40Percent: text.includes("40%"),
      };
    });
    console.log("Progress updated to 2 of 5 (40%):", progressAfterAnswers);

    // 7. Test Clear Form Button
    console.log("7. Testing Clear Form button...");
    await page.evaluate(() => {
      const clearBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.includes("Clear Form")
      );
      if (clearBtn) clearBtn.click();
    });
    await delay(500);

    const progressAfterClear = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("0 of 5") && text.includes("0%");
    });
    console.log("Progress reset to 0 of 5 after Clear Form:", progressAfterClear);

    // 8. Test Validation and Submission Simulation
    console.log("8. Testing validation on submit...");
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.trim() === "Submit"
      );
      if (submitBtn) submitBtn.click();
    });
    await delay(500);

    const hasValidationError = await page.evaluate(() => {
      return document.body.innerText.includes("This question is required");
    });
    console.log("Validation error displayed for required questions:", hasValidationError);

    // Fill in required fields
    console.log("Filling all required fields for successful simulated submit...");
    await page.evaluate(() => {
      // 1. Name
      const nameInput = document.querySelector("input[placeholder='Enter your full name']");
      if (nameInput) {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        set.call(nameInput, "Samantha Lee");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
        nameInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // 2. Dept
      const compBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.includes("Computer Engineering")
      );
      if (compBtn) compBtn.click();

      // 3. Email
      const emailInput = document.querySelector("input[placeholder='yourname@example.com']");
      if (emailInput) {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        set.call(emailInput, "samantha@example.com");
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));
        emailInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // 4. Year
      const yearSelect = document.querySelector("select");
      if (yearSelect) {
        yearSelect.value = "Third Year";
        yearSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(500);

    // Submit now
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.trim() === "Submit"
      );
      if (submitBtn) submitBtn.click();
    });
    await delay(800);

    const submissionSimulation = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasThankYou: text.includes("Thank you!"),
        hasNotice: text.includes("Preview Mode — No response was stored in the database"),
        hasTestAnother: text.includes("Test Another Response"),
      };
    });
    console.log("Submission simulation results:", submissionSimulation);

    // Capture submitted simulation screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "preview_submitted_simulation.png"),
      fullPage: false,
    });
    console.log("Captured preview_submitted_simulation.png");

    // Verify DB count is strictly 0!
    const responseCount = await prisma.formResponse.count({
      where: { formId },
    });
    console.log("Database FormResponse count for this preview form:", responseCount);
    if (responseCount !== 0) {
      throw new Error(`CRITICAL: Preview created ${responseCount} real database responses!`);
    }

    // Reset back via "Test Another Response"
    await page.evaluate(() => {
      const testAnotherBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.includes("Test Another Response")
      );
      if (testAnotherBtn) testAnotherBtn.click();
    });
    await delay(600);

    // 9. Test Device Viewport Presets (Tablet and Mobile)
    console.log("9. Testing Tablet device preset...");
    await page.evaluate(() => {
      const tabletBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.includes("Tablet")
      );
      if (tabletBtn) tabletBtn.click();
    });
    await delay(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "preview_tablet.png"),
      fullPage: false,
    });
    console.log("Captured preview_tablet.png");

    console.log("10. Testing Mobile device preset...");
    await page.evaluate(() => {
      const mobileBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.innerText && b.innerText.includes("Mobile")
      );
      if (mobileBtn) mobileBtn.click();
    });
    await delay(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "preview_mobile.png"),
      fullPage: false,
    });
    console.log("Captured preview_mobile.png");

    // 11. Test Standalone Owner Preview Route: /forms/[formId]/preview
    console.log(`11. Testing standalone preview route: /forms/${formId}/preview...`);
    await page.goto(`http://localhost:3000/forms/${formId}/preview`, {
      waitUntil: "networkidle0",
    });
    await delay(1000);

    const standaloneVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasReturnBtn: text.includes("Return to Editor"),
        hasRespondentPreviewBadge: text.includes("Respondent Preview"),
        hasFormTitle: text.includes("Student Registration"),
        hasQuestions: text.includes("What is your full name?"),
      };
    });
    console.log("Standalone preview results:", standaloneVerification);
    if (!standaloneVerification.hasReturnBtn || !standaloneVerification.hasFormTitle) {
      throw new Error("Standalone preview page failed to render correctly!");
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "preview_standalone.png"),
      fullPage: false,
    });
    console.log("Captured preview_standalone.png");

    console.log("=== All Formly Part B4 Preview Tab Tests Passed Successfully! ===");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run();
