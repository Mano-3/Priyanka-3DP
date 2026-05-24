const puppeteer = require('puppeteer');
const path = require('path');

const base = `
  .universe-bg { display: none !important; }
  .universe { background-color: transparent !important; }
  body { background: transparent !important; }
`;

const variations = [
  {
    name: 'A-nebula',
    css: base + `
      .universe {
        background:
          radial-gradient(ellipse 80% 60% at 15% 65%, #4a18e8 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 82% 12%, #c00fa8 0%, transparent 48%),
          radial-gradient(ellipse 70% 55% at 55% 92%, #0a3fd4 0%, transparent 52%),
          #010008 !important;
      }
    `,
  },
  {
    name: 'B-aurora',
    css: base + `
      .universe {
        background:
          radial-gradient(ellipse 70% 55% at 8% 72%, #0db87a 0%, transparent 50%),
          radial-gradient(ellipse 65% 50% at 88% 18%, #1438d0 0%, transparent 48%),
          radial-gradient(ellipse 60% 50% at 50% 98%, #6010b0 0%, transparent 48%),
          #010008 !important;
      }
    `,
  },
  {
    name: 'C-warm',
    css: base + `
      .universe {
        background:
          radial-gradient(ellipse 75% 55% at 18% 55%, #c85a08 0%, transparent 52%),
          radial-gradient(ellipse 60% 50% at 80% 70%, #a02808 0%, transparent 46%),
          radial-gradient(ellipse 55% 45% at 58% 5%,  #d4840c 0%, transparent 44%),
          #090502 !important;
      }
    `,
  },
  {
    name: 'D-rose',
    css: base + `
      .universe {
        background:
          radial-gradient(ellipse 70% 55% at 72% 28%, #d42858 0%, transparent 50%),
          radial-gradient(ellipse 65% 50% at 18% 78%, #880a50 0%, transparent 46%),
          radial-gradient(ellipse 80% 60% at 50% 50%, #300020 0%, transparent 65%),
          #080004 !important;
      }
    `,
  },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const url = 'file://' + path.resolve(__dirname, 'index.html');

  for (const { name, css } of variations) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.addStyleTag({ content: css });
    await new Promise(r => setTimeout(r, 800));
    const out = `assets/thumbnails/bg-${name}.png`;
    await page.screenshot({ path: path.resolve(__dirname, out) });
    console.log('captured', out);
    await page.close();
  }

  await browser.close();
})();
