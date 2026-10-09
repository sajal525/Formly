const puppeteer = require("puppeteer-core");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function test() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: "new" });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/register", { waitUntil: "domcontentloaded" });
  const ts = Date.now().toString().slice(-6);
  await page.evaluate(async (u) => {
    await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: "Password123!" }),
    });
  }, "user_net_" + ts);

  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });

  page.on("request", (req) => {
    if (req.url().includes("localhost:3000") && !req.url().includes("_next/static")) {
      console.log("-> REQ:", req.method(), req.url().replace("http://localhost:3000", ""));
    }
  });

  console.log("\n--- Clicking My Forms ---");
  const t1 = performance.now();
  await page.click('aside a[href="/my-forms"]');
  await delay(1500);
  console.log(`My Forms click took: ${(performance.now() - t1).toFixed(1)}ms`);

  console.log("\n--- Clicking Templates ---");
  const t2 = performance.now();
  await page.click('aside a[href="/templates"]');
  await delay(1500);
  console.log(`Templates click took: ${(performance.now() - t2).toFixed(1)}ms`);

  await browser.close();
}
test().catch(console.error);
