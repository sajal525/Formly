const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Verifying 4 Dashboard Cards Layout ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Register / log in
  const testUsername = `user_cards_${Date.now().toString().slice(-6)}`;
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", "Password123456!");
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    submitBtn.click(),
  ]);

  // Navigate to Dashboard
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await delay(1200);

  // 1. Desktop Check (1440x900)
  const cardsInfo = await page.evaluate(() => {
    const grid = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4");
    if (!grid) return null;
    const children = Array.from(grid.children);
    return {
      count: children.length,
      rects: children.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          innerText: c.innerText.trim(),
          childCount: c.children.length,
        };
      }),
    };
  });

  console.log("Cards info on desktop (1440px):", cardsInfo);
  assert.ok(cardsInfo, "4-column grid must exist");
  assert.strictEqual(cardsInfo.count, 4, "Must have exactly 4 cards");

  // Verify cards are all on the same row (same y)
  const firstY = cardsInfo.rects[0].y;
  assert.ok(
    cardsInfo.rects.every((r) => Math.abs(r.y - firstY) <= 2),
    "All 4 cards must be aligned in one row on desktop"
  );

  // Verify all 4 cards have equal height
  const firstHeight = cardsInfo.rects[0].height;
  assert.ok(
    cardsInfo.rects.every((r) => Math.abs(r.height - firstHeight) <= 2),
    "All 4 cards must be equal in height"
  );

  // Verify all 4 cards have equal width (within 2px rounding)
  const firstWidth = cardsInfo.rects[0].width;
  assert.ok(
    cardsInfo.rects.every((r) => Math.abs(r.width - firstWidth) <= 2),
    "All 4 cards must be equal in width"
  );

  // Verify card 4 is completely blank
  const card4 = cardsInfo.rects[3];
  assert.strictEqual(card4.innerText, "", "Card 4 must have no text");
  assert.strictEqual(card4.childCount, 0, "Card 4 must have no child elements");

  // Capture desktop screenshot (Dark mode)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_4_cards_desktop_dark.png") });

  // Toggle to light mode and capture desktop
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await delay(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_4_cards_desktop_light.png") });

  // 2. Tablet check (768px - 2x2 grid)
  await page.setViewport({ width: 768, height: 1024 });
  await delay(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_4_cards_tablet.png") });

  // 3. Mobile check (375px - stacked)
  await page.setViewport({ width: 375, height: 812 });
  await delay(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_4_cards_mobile.png") });

  await browser.close();
  console.log("✓ All 4-card layout checks passed with flying colors!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
