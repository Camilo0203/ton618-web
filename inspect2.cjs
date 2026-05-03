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
      const style = window.getComputedStyle(el);
      const bg = style.background;
      const bgImg = style.backgroundImage;
      const bgColor = style.backgroundColor;
      const rect = el.getBoundingClientRect();
      if(rect.width === 1920 && rect.top === 0 && rect.height > 0 && rect.height < 200) {
        results.push({
          tag: el.tagName,
          className: el.className,
          id: el.id,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bg: bg.substring(0, 100),
          bgImg: bgImg.substring(0, 100),
          bgColor: bgColor
        });
      }
    }
    return results;
  });
  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
})();
