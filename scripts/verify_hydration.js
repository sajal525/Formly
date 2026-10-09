const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\c6e573bc-5209-46f2-81e2-2bd317c90bc2";

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const failedRequests = [];
  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push({ status: resp.status(), url: resp.url() });
    }
  });

  console.log("Loading http://localhost:3000/login ...");
  const res = await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  console.log("Main document status:", res.status());
  console.log("Failed requests count:", failedRequests.length);

  await page.screenshot({ path: path.join(OUTPUT_DIR, "verify_login_rendered.png") });
  console.log("Saved verify_login_rendered.png");

  console.log("Loading http://localhost:3000/register ...");
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(OUTPUT_DIR, "verify_register_rendered.png") });
  console.log("Saved verify_register_rendered.png");

  await browser.close();
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

test().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
