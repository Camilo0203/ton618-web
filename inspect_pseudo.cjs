const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});
  await page.goto('http://localhost:5173/pricing');
  await page.waitForSelector('nav');
  const elements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for(let i=0; i<all.length; i++) {
      const el = all[i];
      
      // Check element itself
      const style = window.getComputedStyle(el);
      
      // Check ::before
      const beforeStyle = window.getComputedStyle(el, '::before');
      if (beforeStyle.content && beforeStyle.content !== 'none' && beforeStyle.content !== 'normal') {
        results.push({
          tag: el.tagName + '::before',
          className: el.className,
          bg: beforeStyle.background.substring(0, 80),
          width: beforeStyle.width,
          height: beforeStyle.height,
          position: beforeStyle.position,
          top: beforeStyle.top
        });
      }

      // Check ::after
      const afterStyle = window.getComputedStyle(el, '::after');
      if (afterStyle.content && afterStyle.content !== 'none' && afterStyle.content !== 'normal') {
        results.push({
          tag: el.tagName + '::after',
          className: el.className,
          bg: afterStyle.background.substring(0, 80),
          width: afterStyle.width,
          height: afterStyle.height,
          position: afterStyle.position,
          top: afterStyle.top
        });
      }
    }
    return results;
  });
  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
})();
