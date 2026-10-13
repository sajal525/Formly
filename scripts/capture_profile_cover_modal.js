const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\1345f917-e2d0-46c5-9fc4-103d10bbf981";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureModal() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login as existing user or register
  const testUsername = `user_view_${Date.now().toString().slice(-6)}`;
  await page.goto("http://localhost:3000/register", { waitUntil: "networkidle0" });
  await page.type("#reg-username-input", testUsername);
  await page.type("#reg-password-input", "Password123456!");
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {}),
    submitBtn.click(),
  ]);

  await page.goto("http://localhost:3000/profile", { waitUntil: "networkidle0" });
  await delay(1000);

  // Click Change Cover
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent.includes("Change Cover"));
    btn.click();
  });
  await delay(500);

  // Capture Dropzone stage
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "profile_cover_modal_dropzone.png") });

  // Generate image and upload
  const samplePath = path.join(ARTIFACT_DIR, "sample_modal_view.png");
  const base64Data = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 1600, 500);
    grad.addColorStop(0, "#38bdf8");
    grad.addColorStop(0.5, "#6366f1");
    grad.addColorStop(1, "#a855f7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 500);
    return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
  });
  fs.writeFileSync(samplePath, Buffer.from(base64Data, "base64"));

  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(samplePath);
  await delay(1200);

  // Capture Adjust Stage
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "profile_cover_modal_adjust.png") });

  await browser.close();
  console.log("Screenshots captured successfully!");
}

captureModal().catch(console.error);
