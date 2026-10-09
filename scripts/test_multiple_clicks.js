const puppeteer = require("puppeteer-core");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("=== Testing Rapid Multiple Clicks in Formly ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const ts = Date.now().toString().slice(-6);
  const username = `multi_${ts}`;
  const password = "Password123!";

  // 1. Register & login
  await page.goto("http://localhost:3000/register", { waitUntil: "domcontentloaded" });
  await page.evaluate(async (u, p) => {
    await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
  }, username, password);

  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await delay(500);

  console.log("\n--- Scenario A: Multiple rapid clicks on sidebar navigation links ---");
  const navTargets = ["My Forms", "Templates", "Responses", "Analytics", "Settings", "Profile"];
  for (const target of navTargets) {
    const t0 = performance.now();
    // Wait for aside link to exist
    const linkFound = await page.waitForSelector(`aside a`, { timeout: 3000 }).catch(() => null);
    if (!linkFound) {
      console.log(`Sidebar not found for '${target}'`);
      continue;
    }
    const clicked = await page.evaluate((title) => {
      const links = Array.from(document.querySelectorAll("aside a"));
      const match = links.find((l) => l.innerText.includes(title));
      if (match) {
        match.click();
        return true;
      }
      return false;
    }, target);
    console.log(`Clicked '${target}':`, clicked ? "YES" : "NO", `in ${(performance.now() - t0).toFixed(1)}ms`);
    await delay(300);
  }

  // Scenario B: Rapid clicks on builder buttons
  console.log("\n--- Scenario B: Rapid clicks on builder buttons ---");
  await page.goto("http://localhost:3000/my-forms", { waitUntil: "domcontentloaded" });
  await delay(500);

  const tToggle = performance.now();
  await page.evaluate(async () => {
    const btns = Array.from(document.querySelectorAll("button"));
    const gridBtn = btns.find((b) => b.getAttribute("aria-label")?.includes("Grid") || b.title?.includes("Grid") || b.innerHTML.includes("LayoutGrid"));
    if (gridBtn) {
      for (let i = 0; i < 5; i++) {
        gridBtn.click();
        await new Promise((r) => setTimeout(r, 40));
      }
    }
  });
  console.log(`5 Rapid view toggle clicks finished in: ${(performance.now() - tToggle).toFixed(1)}ms`);

  await browser.close();
  console.log("\nDone!");
}

run().catch(console.error);
