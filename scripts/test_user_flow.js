const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testUserFlow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('--- 1. Testing Registration Page ---');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
  
  const testUser = 'user_' + Math.floor(Math.random() * 100000);
  console.log('Registering test user:', testUser);
  await page.type('#reg-username-input', testUser);
  await page.type('#reg-password-input', 'Password123456!');
  
  const registerSubmit = await page.$('button[type="submit"]');
  console.log('Clicking submit...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(e => console.log('Nav result:', e.message)),
    registerSubmit.click()
  ]);

  console.log('URL after register:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Page body snippet:', bodyText);

  // Check if we are on dashboard
  if (page.url().includes('/dashboard')) {
    console.log('Successfully reached dashboard!');
    const greeting = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : 'No H1';
    });
    console.log('Greeting header:', greeting);
  }

  await browser.close();
}

testUserFlow().catch(console.error);
