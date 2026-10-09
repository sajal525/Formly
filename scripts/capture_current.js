const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\c6e573bc-5209-46f2-81e2-2bd317c90bc2';

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Capturing /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'current_login_view.png') });

  console.log('Capturing /register...');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'current_register_view.png') });

  // Register a quick user to see dashboard
  const user = 'viewuser_' + Math.floor(Math.random() * 10000);
  await page.type('#reg-username-input', user);
  await page.type('#reg-password-input', 'Password123456!');
  const btn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {}),
    btn.click()
  ]);

  console.log('Capturing /dashboard...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'current_dashboard_view.png') });

  await browser.close();
  console.log('Screenshots saved!');
}

takeScreenshots().catch(console.error);
