const puppeteer = require('puppeteer');
const path = require('path');

const tiles = [
  { file: '../v3-real-content/index.html',    out: 'assets/thumbnails/v3-real-content.png',    wait: 3500 },
  { file: '../v2-newmixcoffee-v2/index.html', out: 'assets/thumbnails/v2-newmixcoffee-v2.png', wait: 3500 },
  { file: '../v2-newmixcoffee-v1/index.html', out: 'assets/thumbnails/v2-newmixcoffee-v1.png' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  for (const { file, out, wait, scrollTo } of tiles) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });
    // disable all CSS animations/transitions so we get the final state instantly
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const url = 'file://' + path.resolve(__dirname, file);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.addStyleTag({ content: `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0.001ms !important;
        transition-delay: 0ms !important;
      }
    `});
    await new Promise(r => setTimeout(r, wait || 800));
    if (scrollTo) {
      await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'instant' });
      }, scrollTo);
      await new Promise(r => setTimeout(r, 400));
    }
    await page.screenshot({ path: path.resolve(__dirname, out) });
    console.log('captured', out);
    await page.close();
  }
  await browser.close();
})();
