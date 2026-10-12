const puppeteer = require("puppeteer-core");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTextEditingTestSuite() {
  console.log("=== Formly Direct Text Editing & Selection Verification Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `text_tester_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log("1. Registering test user...");
    await page.goto("http://127.0.0.1:3000/register", { waitUntil: "domcontentloaded" });
    const regResult = await page.evaluate(async (username, password) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return { status: res.status, data: await res.json() };
    }, testUser, testPassword);

    assert.strictEqual(regResult.status, 201, "Registration must succeed");
    const userId = regResult.data.user.id;

    // 2. Create test draft form with title, description, questions, and options
    console.log("2. Creating test form draft in Neon DB...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Untitled form",
        definition: {
          schemaVersion: 1,
          title: "Untitled form",
          description: "Add a description (optional)",
          themeKey: "soft-lavender",
          blocks: [
            {
              id: "q-1",
              kind: "question",
              question: {
                id: "q-1",
                type: "MULTIPLE_CHOICE",
                label: "Untitled question",
                description: "Helper text for this question",
                required: false,
                options: [
                  { id: "opt-1", label: "Option 1", value: "option_1" },
                  { id: "opt-2", label: "Option 2", value: "option_2" },
                ],
              },
            },
          ],
          questions: [
            {
              id: "q-1",
              type: "MULTIPLE_CHOICE",
              label: "Untitled question",
              description: "Helper text for this question",
              required: false,
              options: [
                { id: "opt-1", label: "Option 1", value: "option_1" },
                { id: "opt-2", label: "Option 2", value: "option_2" },
              ],
            },
          ],
        },
      },
    });

    // 3. Open Form Builder
    console.log(`3. Navigating to Form Builder (http://127.0.0.1:3000/forms/${form.id}/edit)...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[aria-label="Form title"]', { timeout: 15000 });
    await delay(2000);

    const titleInput = await page.$('input[aria-label="Form title"]');
    assert.ok(titleInput, "Form title input must exist");

    // TEST 1: Clicking untouched "Untitled form" automatically selects all text
    console.log("Test 1: Auto-select all text on clicking untouched 'Untitled form'...");
    const box = await titleInput.boundingBox();
    await page.mouse.click(box.x + 60, box.y + box.height / 2);
    await delay(200);

    let sel = await page.evaluate((el) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
      value: el.value,
    }), titleInput);
    console.log("Caret position after click at x+60:", sel);
    assert.strictEqual(sel.start, 0, "Selection must start at 0");
    assert.strictEqual(sel.end, 13, "Selection must cover entire 'Untitled form'");
    console.log("✓ Entire untouched default title auto-selected on click");

    // TEST 2: Ctrl + A selects the complete title
    console.log("Test 2: Ctrl + A selection...");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await delay(150);

    sel = await page.evaluate((el) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
      value: el.value,
    }), titleInput);
    console.log("Selection after Ctrl + A:", sel);
    assert.strictEqual(sel.start, 0, "Selection must start at 0");
    assert.strictEqual(sel.end, sel.value.length, "Selection must cover entire string");
    console.log("✓ Ctrl + A selected all", sel.end, "characters");

    // TEST 3: Typing after selection replaces the title rather than appending to it
    console.log("Test 3: Typing replaces selected title...");
    await page.keyboard.type("Customer Satisfaction Survey");
    await delay(300);

    sel = await page.evaluate((el) => ({
      start: el.selectionStart,
      end: el.selectionEnd,
      value: el.value,
    }), titleInput);
    console.log("Value after replacement typing:", sel.value);
    assert.strictEqual(sel.value, "Customer Satisfaction Survey", "Value must be replaced, not appended");
    console.log("✓ Title successfully replaced without appending");

    // TEST 4: Selecting and replacing only one word works
    console.log("Test 4: Selecting and replacing only one word...");
    // Double-click "Satisfaction" in "Customer Satisfaction Survey"
    // "Customer " has length 9. Click around middle of Satisfaction
    await page.evaluate((el) => {
      // Find "Satisfaction" range and select it
      const start = el.value.indexOf("Satisfaction");
      const end = start + "Satisfaction".length;
      el.focus();
      el.setSelectionRange(start, end);
    }, titleInput);
    await delay(150);

    let wordSel = await page.evaluate((el) => el.value.substring(el.selectionStart, el.selectionEnd), titleInput);
    console.log("Selected word:", wordSel);
    assert.strictEqual(wordSel, "Satisfaction", "Word Satisfaction should be selected");

    // Type "Feedback" to replace only "Satisfaction"
    await page.keyboard.type("Feedback");
    await delay(300);

    const updatedTitle = await page.evaluate((el) => el.value, titleInput);
    console.log("Updated title with single word replaced:", updatedTitle);
    assert.strictEqual(updatedTitle, "Customer Feedback Survey", "Only Satisfaction must be replaced with Feedback");
    console.log("✓ Single word replaced cleanly");

    // TEST 5: Form description direct editing
    console.log("Test 5: Form description editing...");
    const descArea = await page.$('textarea[aria-label="Form description"]');
    assert.ok(descArea, "Description textarea must exist");

    await descArea.focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("Please help us improve our services by answering these quick questions.");
    await delay(300);

    const descVal = await page.evaluate((el) => el.value, descArea);
    console.log("Updated description:", descVal);
    assert.ok(descVal.includes("Please help us improve"), "Description must be updated");
    console.log("✓ Form description edited successfully");

    // TEST 6: Question Title editing & replacing
    console.log("Test 6: Question Title editing & replacing...");
    const qTitleInput = await page.$('input[aria-label="Question title"]');
    assert.ok(qTitleInput, "Question title input must exist");

    await qTitleInput.focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("How would you rate our platform?");
    await delay(300);

    const qTitleVal = await page.evaluate((el) => el.value, qTitleInput);
    console.log("Updated question title:", qTitleVal);
    assert.strictEqual(qTitleVal, "How would you rate our platform?", "Question title must be replaced");
    console.log("✓ Question title replaced successfully");

    // TEST 7: Question Options direct editing
    console.log("Test 7: Option label editing...");
    const optionInputs = await page.$$('div.space-y-2 input[placeholder^="Option"]');
    assert.ok(optionInputs.length >= 2, "Must find at least 2 option inputs");

    // Edit Option 1
    await optionInputs[0].focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("Extremely Satisfied");
    await delay(200);

    // Edit Option 2
    await optionInputs[1].focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("Somewhat Satisfied");
    await delay(200);

    const opt1Val = await page.evaluate((el) => el.value, optionInputs[0]);
    const opt2Val = await page.evaluate((el) => el.value, optionInputs[1]);
    console.log("Updated Option 1:", opt1Val);
    console.log("Updated Option 2:", opt2Val);
    assert.strictEqual(opt1Val, "Extremely Satisfied", "Option 1 must match replaced text");
    assert.strictEqual(opt2Val, "Somewhat Satisfied", "Option 2 must match replaced text");
    console.log("✓ Option labels edited and replaced successfully");

    // TEST 8: Fast typing stability (no cursor jumps or character dropping)
    console.log("Test 8: Fast typing test on question title...");
    await qTitleInput.focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");

    const fastSentence = "The quick brown fox jumps over the lazy dog 1234567890";
    await page.keyboard.type(fastSentence, { delay: 15 });
    await delay(500);

    const fastVal = await page.evaluate((el) => el.value, qTitleInput);
    console.log("Fast typing result:", fastVal);
    assert.strictEqual(fastVal, fastSentence, "Fast typing must produce identical string without dropped characters");
    console.log("✓ Fast typing stable and complete");

    // Restore clean question title
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("Overall Rating");
    await delay(200);

    // Wait for debounced autosave to trigger and settle
    console.log("Waiting for autosave to persist changes to Neon DB...");
    await delay(3500);

    // TEST 9: Changes persist after switching tabs and refreshing page
    console.log("Test 9: Verifying persistence across browser refresh...");
    await page.goto("about:blank");
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[aria-label="Form title"]', { timeout: 15000 });
    await delay(2000);

    const reloadedTitleInput = await page.$('input[aria-label="Form title"]');
    const reloadedTitleVal = await page.evaluate((el) => el.value, reloadedTitleInput);
    console.log("Reloaded form title:", reloadedTitleVal);
    assert.strictEqual(reloadedTitleVal, "Customer Feedback Survey", "Reloaded title must match saved Customer Feedback Survey");

    const reloadedDescArea = await page.$('textarea[aria-label="Form description"]');
    const reloadedDescVal = await page.evaluate((el) => el.value, reloadedDescArea);
    console.log("Reloaded form description:", reloadedDescVal);
    assert.ok(reloadedDescVal.includes("Please help us improve"), "Reloaded description must match saved text");

    const reloadedQTitleInput = await page.$('input[aria-label="Question title"]');
    const reloadedQTitleVal = await page.evaluate((el) => el.value, reloadedQTitleInput);
    console.log("Reloaded question title:", reloadedQTitleVal);
    assert.strictEqual(reloadedQTitleVal, "Overall Rating", "Reloaded question title must match saved Overall Rating");

    const reloadedOptInputs = await page.$$('div.space-y-2 input[placeholder^="Option"]');
    const reloadedOpt1Val = await page.evaluate((el) => el.value, reloadedOptInputs[0]);
    const reloadedOpt2Val = await page.evaluate((el) => el.value, reloadedOptInputs[1]);
    console.log("Reloaded Option 1:", reloadedOpt1Val);
    console.log("Reloaded Option 2:", reloadedOpt2Val);
    assert.strictEqual(reloadedOpt1Val, "Extremely Satisfied", "Reloaded Option 1 must match");
    assert.strictEqual(reloadedOpt2Val, "Somewhat Satisfied", "Reloaded Option 2 must match");

    // TEST 10: Verify DB record contains the exact definitions
    console.log("Test 10: Checking database directly...");
    const dbForm = await prisma.form.findUnique({
      where: { id: form.id },
      select: { title: true, definition: true },
    });
    console.log("DB Form Title:", dbForm.title);
    console.log("DB Form Definition Title:", dbForm.definition.title);
    assert.strictEqual(dbForm.definition.title, "Customer Feedback Survey", "DB definition.title must match");

    console.log("\n========================================================");
    console.log("ALL TEXT EDITING & SELECTION TESTS PASSED SUCCESSFULLY!");
    console.log("========================================================\n");

  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runTextEditingTestSuite();
