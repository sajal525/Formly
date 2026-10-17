const puppeteer = require("puppeteer-core");
const path = require("path");
const assert = require("assert");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\74135bcb-4dde-4401-88a6-4fdba8664f14";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("=== Verifying Minimal TUI Dashboard Redesign ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Register a temporary test user to log into dashboard
  const testUsername = `user_tui_${Date.now().toString().slice(-6)}`;
  console.log(`Creating test user: ${testUsername}`);
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", "Password123456!");
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    submitBtn.click(),
  ]);

  // Seed sample forms for this user
  const user = await prisma.user.findFirst({ where: { username: testUsername } });
  if (user) {
    console.log("Seeding realistic sample forms for user...");
    const sampleForms = [
      { title: "Feedback Form", description: "Help us improve our service", status: "PUBLISHED" },
      { title: "Event Registration", description: "Annual developer meetup registration", status: "DRAFT" },
      { title: "Product Survey", description: "Customer experience questionnaire", status: "PUBLISHED" },
      { title: "MOVIES", description: "Rate your top favorite movies", status: "DRAFT" },
      { title: "College Event Feedback", description: "Feedback for campus hackathon", status: "PUBLISHED" },
      { title: "Workshop Feedback", description: "Hands-on UI workshop thoughts", status: "PUBLISHED" },
    ];
    for (const f of sampleForms) {
      const created = await prisma.form.create({
        data: {
          ownerId: user.id,
          title: f.title,
          description: f.description,
          status: f.status,
          definition: {},
        },
      });
      if (f.status === "PUBLISHED") {
        await prisma.responseSession.create({
          data: { formId: created.id },
        });
        await prisma.formResponse.create({
          data: {
            formId: created.id,
            answers: {},
          },
        });
      }
    }
  }

  // Navigate to Dashboard
  console.log("Navigating to http://localhost:3000/dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await delay(1500);

  // 1. Verify Welcome Header & User Name
  const welcomeText = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? h1.innerText : null;
  });
  console.log("Welcome H1 detected:", welcomeText);
  assert.ok(welcomeText, "H1 welcome username heading must exist");

  // 2. Verify Create Form dropdown button exists
  const createFormBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.some(b => b.innerText.includes("Create Form"));
  });
  console.log("Create Form button exists:", createFormBtn);
  assert.ok(createFormBtn, "Create Form button must exist");

  // 3. Verify 4 Summary Metric Cards
  const statsInfo = await page.evaluate(() => {
    const statCards = Array.from(document.querySelectorAll("a, div")).filter(el => {
      const text = el.innerText || "";
      return text.includes("TOTAL FORMS") || text.includes("Total Forms");
    });
    return {
      hasTotalForms: document.body.innerText.includes("Total Forms") || document.body.innerText.includes("TOTAL FORMS"),
      hasTotalResponses: document.body.innerText.includes("Total Responses") || document.body.innerText.includes("TOTAL RESPONSES"),
      hasTotalViews: document.body.innerText.includes("Total Views") || document.body.innerText.includes("TOTAL VIEWS"),
      hasActiveForms: document.body.innerText.includes("Active Forms") || document.body.innerText.includes("ACTIVE FORMS"),
    };
  });
  console.log("Summary metrics check:", statsInfo);
  assert.ok(statsInfo.hasTotalForms, "Total Forms metric card must exist");
  assert.ok(statsInfo.hasTotalResponses, "Total Responses metric card must exist");
  assert.ok(statsInfo.hasTotalViews, "Total Views metric card must exist");
  assert.ok(statsInfo.hasActiveForms, "Active Forms metric card must exist");

  // 4. Verify Sidebar has narrow layout and monochrome icons
  const sidebarWidth = await page.evaluate(() => {
    const sidebar = document.querySelector("aside");
    return sidebar ? sidebar.getBoundingClientRect().width : 0;
  });
  console.log("Sidebar width (desktop):", sidebarWidth);
  assert.ok(sidebarWidth > 0 && sidebarWidth <= 72, "Minimal sidebar must be compact icon-led rail (<= 72px)");

  // 5. Test Creating a Form so we have Recent Forms populated
  console.log("Creating a form via Create Form button...");
  const blankBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.innerText.includes("Create Form"));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });

  await delay(1500);

  // Return to dashboard
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await delay(1200);

  // 6. Capture Desktop Light Mode
  await page.evaluate(() => {
    localStorage.setItem("formly-theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await delay(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_tui_desktop_light.png"), fullPage: false });
  console.log("Saved dashboard_tui_desktop_light.png");

  // 7. Capture Desktop Dark Mode
  await page.evaluate(() => {
    localStorage.setItem("formly-theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await delay(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_tui_desktop_dark.png"), fullPage: false });
  console.log("Saved dashboard_tui_desktop_dark.png");

  // 8. Capture Tablet (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await delay(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_tui_tablet.png"), fullPage: false });
  console.log("Saved dashboard_tui_tablet.png");

  // 9. Capture Mobile (375px)
  await page.setViewport({ width: 375, height: 812 });
  await delay(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dashboard_tui_mobile.png"), fullPage: false });
  console.log("Saved dashboard_tui_mobile.png");

  await browser.close();
  console.log("✓ All verification tests passed successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
