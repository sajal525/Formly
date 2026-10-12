const puppeteer = require("puppeteer-core");
const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDefaultTextAutoSelectSuite() {
  console.log("=== Formly Default Text Auto-Select & Natural Editing Verification Suite ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => console.log("[BROWSER CONSOLE]", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("[BROWSER ERROR]", err.message));
  page.on("response", async (res) => {
    if (res.url().includes("/draft")) {
      console.log("[DRAFT API RESPONSE]", res.status(), res.url(), await res.text().catch(() => ""));
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `autoselect_tester_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log("1. Registering test user on localhost:3000...");
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

    // 2. Create test draft form with untouched defaults
    console.log("2. Creating test draft form with untouched default title & question...");
    const form = await prisma.form.create({
      data: {
        ownerId: userId,
        status: "DRAFT",
        title: "Untitled form",
        themeKey: "soft-lavender",
        definition: {
          schemaVersion: 1,
          title: "Untitled form",
          description: "",
          themeKey: "soft-lavender",
          blocks: [
            {
              id: "q-1",
              kind: "question",
              question: {
                id: "q-1",
                type: "MULTIPLE_CHOICE",
                label: "Untitled question",
                description: "",
                required: false,
                options: [
                  { id: "opt-1", label: "Option 1", value: "option_1" },
                  { id: "opt-2", label: "Option 2", value: "option_2" },
                ],
              },
            },
          ],
        },
      },
    });

    // 3. Open Form Builder
    console.log(`3. Opening Form Builder at http://127.0.0.1:3000/forms/${form.id}/edit...`);
    await page.goto(`http://127.0.0.1:3000/forms/${form.id}/edit`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      return Boolean(document.querySelector('input[aria-label="Form title"]'));
    }, { timeout: 15000 });
    await delay(1000);

    // TEST 1: Click "Untitled form" title input -> Automatically select all existing text
    console.log("TEST 1: Clicking untouched 'Untitled form' title input...");
    await page.click('input[aria-label="Form title"]');
    await delay(150);

    const titleSelection = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Form title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        selectedText: input.value.substring(input.selectionStart, input.selectionEnd),
      };
    });

    console.log("Title selection after initial click:", titleSelection);
    assert.strictEqual(titleSelection.value, "Untitled form");
    assert.strictEqual(titleSelection.selectionStart, 0, "selectionStart must be 0");
    assert.strictEqual(titleSelection.selectionEnd, 13, "selectionEnd must be 13");
    assert.strictEqual(titleSelection.selectedText, "Untitled form", "Entire default title must be selected");

    // TEST 2: Type first character -> replaces the entire default text immediately
    console.log("TEST 2: Typing first character 'M' -> should replace entire 'Untitled form'...");
    await page.keyboard.type("M");
    await delay(100);

    const titleAfterFirstChar = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Form title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    });

    console.log("Title after first character:", titleAfterFirstChar);
    assert.strictEqual(titleAfterFirstChar.value, "M", "Default text must be completely replaced by 'M'");
    assert.strictEqual(titleAfterFirstChar.selectionStart, 1, "Cursor must be immediately after 'M'");
    assert.strictEqual(titleAfterFirstChar.selectionEnd, 1, "No selection range after typing");

    // TEST 3: Continue normal typing -> without reselecting text on every keystroke
    console.log("TEST 3: Continuing normal typing 'y Survey' without reselecting on keystrokes...");
    await page.keyboard.type("y Survey");
    await delay(100);

    const titleAfterTyping = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Form title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    });

    console.log("Title after continuous typing:", titleAfterTyping);
    assert.strictEqual(titleAfterTyping.value, "My Survey", "Title must be 'My Survey'");
    assert.strictEqual(titleAfterTyping.selectionStart, 9, "Cursor must be at the end of 'My Survey'");

    // TEST 4: Click inside customized text field -> preserves normal cursor positioning, does NOT select all
    console.log("TEST 4: Clicking inside customized text 'My Survey' -> must place cursor, NOT select all...");
    // Click outside first to blur
    await page.click('body', { offset: { x: 10, y: 10 } });
    await delay(200);

    // Click on the title input at offset around character 2
    const titleBox = await page.$('input[aria-label="Form title"]');
    const boxRect = await titleBox.boundingBox();
    await page.mouse.click(boxRect.x + 30, boxRect.y + boxRect.height / 2);
    await delay(150);

    const customizedClickState = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Form title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        isCollapsed: input.selectionStart === input.selectionEnd,
      };
    });

    console.log("Customized title click state:", customizedClickState);
    assert.strictEqual(customizedClickState.value, "My Survey");
    assert.strictEqual(customizedClickState.isCollapsed, true, "Caret must be placed normally (no select-all)");
    assert.notStrictEqual(customizedClickState.selectionEnd, 9, "Must not have selected the entire string");

    // TEST 5: Question Card - Untouched default "Untitled question" auto-selects all on click
    console.log("TEST 5: Clicking untouched 'Untitled question' in Question Card...");
    await page.click('input[aria-label="Question title"]');
    await delay(150);

    const questionSelection = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Question title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        selectedText: input.value.substring(input.selectionStart, input.selectionEnd),
      };
    });

    console.log("Question selection after initial click:", questionSelection);
    assert.strictEqual(questionSelection.value, "Untitled question");
    assert.strictEqual(questionSelection.selectionStart, 0);
    assert.strictEqual(questionSelection.selectionEnd, 17);
    assert.strictEqual(questionSelection.selectedText, "Untitled question", "Entire question title must be selected");

    // TEST 6: Type first character in Question Card -> replaces entire default question
    console.log("TEST 6: Typing first character 'W' into question -> replaces entire text...");
    await page.keyboard.type("W");
    await delay(100);

    const questionAfterFirstChar = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Question title"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    });

    console.log("Question title after first character:", questionAfterFirstChar);
    assert.strictEqual(questionAfterFirstChar.value, "W");
    assert.strictEqual(questionAfterFirstChar.selectionStart, 1);

    await page.keyboard.type("hat is your team?");
    await delay(100);

    const questionAfterTyping = await page.evaluate(() => {
      return document.querySelector('input[aria-label="Question title"]').value;
    });
    console.log("Question title after full typing:", questionAfterTyping);
    assert.strictEqual(questionAfterTyping, "What is your team?");

    // TEST 7: Options - Clicking untouched default "Option 1" auto-selects all on click
    console.log("TEST 7: Clicking untouched default 'Option 1' input...");
    const option1Input = await page.$('input[placeholder="Option 1"]');
    await option1Input.click();
    await delay(150);

    const optionSelection = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Option 1"]');
      return {
        value: input.value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        selectedText: input.value.substring(input.selectionStart, input.selectionEnd),
      };
    });

    console.log("Option 1 selection after click:", optionSelection);
    assert.strictEqual(optionSelection.value, "Option 1");
    assert.strictEqual(optionSelection.selectionStart, 0);
    assert.strictEqual(optionSelection.selectionEnd, 8);
    assert.strictEqual(optionSelection.selectedText, "Option 1", "Entire 'Option 1' must be selected");

    // TEST 8: Typing replaces "Option 1" completely
    console.log("TEST 8: Typing 'Engineering' into Option 1 -> replaces default completely...");
    await page.keyboard.type("Engineering");
    await delay(100);

    const optionAfterTyping = await page.evaluate(() => {
      return document.querySelector('input[placeholder="Option 1"]').value;
    });
    console.log("Option 1 after typing:", optionAfterTyping);
    assert.strictEqual(optionAfterTyping, "Engineering");

    // TEST 9: Verify autosave persists the newly typed content
    console.log("TEST 9: Waiting for autosave persistence to database...");
    await delay(2500);

    const savedForm = await prisma.form.findUnique({ where: { id: form.id } });
    console.log("Saved form in database:", {
      title: savedForm?.title,
      definitionTitle: savedForm?.definition?.title,
      questionLabel: savedForm?.definition?.blocks?.[0]?.question?.label,
      optionLabel: savedForm?.definition?.blocks?.[0]?.question?.options?.[0]?.label,
    });

    assert.strictEqual(savedForm?.title, "My Survey", "Database title must be 'My Survey'");
    assert.strictEqual(
      savedForm?.definition?.blocks?.[0]?.question?.label,
      "What is your team?",
      "Database question label must be 'What is your team?'"
    );
    assert.strictEqual(
      savedForm?.definition?.blocks?.[0]?.question?.options?.[0]?.label,
      "Engineering",
      "Database option label must be 'Engineering'"
    );

    console.log("\n==================================================================");
    console.log(">>> ALL DEFAULT TEXT AUTO-SELECT TESTS PASSED WITH 100% SUCCESS <<<");
    console.log("==================================================================\n");
  } catch (error) {
    console.error("Test Suite Failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runDefaultTextAutoSelectSuite();
