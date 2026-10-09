const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectPage() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const failed = [];
  page.on('response', resp => {
    if (resp.status() >= 400) {
      failed.push({ status: resp.status(), url: resp.url() });
    }
  });

  const res = await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  console.log('Status:', res.status());

  const info = await page.evaluate(() => {
    return {
      title: document.title,
      bodyTextSnippet: document.body.innerText.substring(0, 200),
      stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(el => el.tagName + (el.href ? ' ' + el.href : ' (inline)')),
      computedH1: window.getComputedStyle(document.querySelector('h1') || document.body).fontSize,
      fontFamilies: window.getComputedStyle(document.body).fontFamily,
      images: Array.from(document.querySelectorAll('img, svg')).length
    };
  });
  console.log('Page info:', JSON.stringify(info, null, 2));
  console.log('Failed:', failed);

  await browser.close();
}
inspectPage().catch(console.error);
