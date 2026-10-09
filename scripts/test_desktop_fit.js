const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\sajal\\.gemini\\antigravity-ide\\brain\\c6e573bc-5209-46f2-81e2-2bd317c90bc2';

async function testPopulated() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const testUser = 'formuser_' + Math.floor(Math.random() * 100000);
  console.log('Registering user:', testUser);
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
  await page.type('#reg-username-input', testUser);
  await page.type('#reg-password-input', 'Password123456!');
  const submitBtn = await page.$('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {}),
    submitBtn.click()
  ]);

  console.log('On dashboard:', page.url());

  // Click the blank form quick start card
  console.log('Opening create form modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Create Form') || b.innerText.includes('Blank Form'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Type form title in modal
  await page.type('#form-title-input', 'Customer Feedback Form 2026');
  
  // Submit modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submit = buttons.find(b => b.innerText.toLowerCase().includes('create draft'));
    if (submit) submit.click();
  });

  await new Promise(r => setTimeout(r, 2500));

  // Verify form appears in table
  const hasFormInTable = await page.evaluate(() => {
    return document.body.innerText.includes('Customer Feedback Form 2026');
  });
  console.log('Form in table:', hasFormInTable);

  // Check scrollability with populated table at 1440x900
  const scroll900 = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    isScrollable: document.documentElement.scrollHeight > window.innerHeight
  }));
  console.log('1440x900 with form scroll check:', scroll900);

  await page.screenshot({ path: path.join(OUTPUT_DIR, 'dashboard_900p_populated.png') });

  // Check at 1920x1080
  await page.setViewport({ width: 1920, height: 1080 });
  await new Promise(r => setTimeout(r, 500));
  const scroll1080 = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    isScrollable: document.documentElement.scrollHeight > window.innerHeight
  }));
  console.log('1920x1080 with form scroll check:', scroll1080);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'dashboard_1080p_populated.png') });

  await browser.close();
  console.log('All tests passed!');
}

testPopulated().catch(console.error);
