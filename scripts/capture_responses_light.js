const puppeteer = require("puppeteer-core");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const timestamp = Date.now().toString().slice(-5);
  const testUser = `capr_${timestamp}`;
  const testPassword = "SecurePassword123!";

  // 1. Register & login
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUser);
  await page.type("#reg-password-input", testPassword);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('button[type="submit"]'),
  ]);

  // 2. Create form from template
  await page.goto("http://localhost:3000/templates", { waitUntil: "networkidle0" });
  await page.waitForSelector(".group", { timeout: 8000 });
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".group"));
    for (const card of cards) {
      const btns = Array.from(card.querySelectorAll("button"));
      const useBtn = btns.find((b) => b.textContent && b.textContent.includes("Use Template"));
      if (useBtn) {
        useBtn.click();
        return;
      }
    }
  });

  await page.waitForFunction(
    () => document.body.textContent.includes("Draft Form Created!"),
    { timeout: 10000 }
  );

  const dbUser = await prisma.user.findFirst({ where: { username: testUser } });
  const form = await prisma.form.findFirst({
    where: { ownerId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  // 3. Publish form
  await prisma.form.update({
    where: { id: form.id },
    data: { status: "PUBLISHED" },
  });

  // 4. Seed 2 submissions with durations
  const session1 = await prisma.responseSession.create({
    data: {
      formId: form.id,
      startedAt: new Date(Date.now() - 145000),
      completedAt: new Date(),
    },
  });

  await prisma.formResponse.create({
    data: {
      formId: form.id,
      responseSessionId: session1.id,
      durationSeconds: 145,
      definitionSnapshot: form.definition,
      answers: {
        "sr-1": "Sajal Jaiswal",
        "sr-2": "sajal23@gmail.com",
        "sr-3": "9876543210",
        "sr-4": "2002-04-12",
        "sr-5": "cs",
        "sr-6": "A2301",
      },
      submittedAt: new Date(),
    },
  });

  const session2 = await prisma.responseSession.create({
    data: {
      formId: form.id,
      startedAt: new Date(Date.now() - 95000),
      completedAt: new Date(),
    },
  });

  await prisma.formResponse.create({
    data: {
      formId: form.id,
      responseSessionId: session2.id,
      durationSeconds: 95,
      definitionSnapshot: form.definition,
      answers: {
        "sr-1": "Rohan Patil",
        "sr-2": "rohan15@gmail.com",
        "sr-3": "9876543211",
        "sr-4": "2002-08-20",
        "sr-5": "ai",
        "sr-6": "A2315",
      },
      submittedAt: new Date(Date.now() - 60000),
    },
  });

  // 5. Navigate to /responses
  await page.setViewport({ width: 1536, height: 960, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3000/responses?formId=${form.id}`, { waitUntil: "networkidle0" });

  // Ensure Light Mode
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("formly-theme", "light");
  });
  await delay(600);

  // Capture table overview in light mode
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "responses_desktop_light.png"),
    fullPage: false,
  });
  console.log("Captured responses_desktop_light.png");

  // Click View on first row to open detail panel
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const viewBtn = btns.find((b) => b.textContent && b.textContent.includes("View"));
    if (viewBtn) viewBtn.click();
  });
  await delay(600);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "responses_desktop_details_light.png"),
    fullPage: false,
  });
  console.log("Captured responses_desktop_details_light.png");

  await browser.close();
  await prisma.$disconnect();
}

capture().catch(console.error);
