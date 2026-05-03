const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/pricing');
  await page.waitForSelector('nav');
  const elements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for(let i=0; i<all.length; i++) {
      const el = all[i];
      const style = window.getComputedStyle(el);
      const bg = style.background;
      const bgImg = style.backgroundImage;
      const bgColor = style.backgroundColor;
      if(bg.includes('linear-gradient') || bgImg.includes('linear-gradient') || bg.includes('199')) {
        const rect = el.getBoundingClientRect();
        if(rect.width > 500 && rect.height >= 1) {
          results.push({
            tag: el.tagName,
            className: el.className,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bg: bg.substring(0, 80) + '...',
            bgImg: bgImg.substring(0, 80) + '...'
          });
        }
      }
    }
    return results;
  });
  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
})();
