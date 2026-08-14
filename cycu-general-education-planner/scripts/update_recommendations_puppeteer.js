const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const RECS_PATH = path.join(__dirname, '..', 'recommendations.json');
const FEEDS_PATH = path.join(__dirname, '..', 'feeds.json');

async function scrapePage(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Try to extract meaningful candidates: h1/h2 titles and first few links
    const results = await page.evaluate(() => {
      const out = [];
      const pushText = (t, src) => { if (t && t.trim()) out.push({ title: t.trim(), source: src }); };
      const meta = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
      if (meta && meta.content) pushText(meta.content, 'meta');
      const h1 = document.querySelector('h1'); if (h1) pushText(h1.innerText, 'h1');
      const h2s = Array.from(document.querySelectorAll('h2')).slice(0,3); h2s.forEach(h=>pushText(h.innerText,'h2'));
      const links = Array.from(document.querySelectorAll('a')).slice(0,10);
      links.forEach(a => { if (a.innerText && a.href) pushText(a.innerText + ' ' + a.href, 'a'); });
      return out.slice(0,8);
    });

    await page.close();
    return results;
  } catch (e) {
    console.warn('scrapePage error', url, e.message || e);
    return [];
  } finally {
    await browser.close();
  }
}

async function main() {
  const feeds = JSON.parse(fs.readFileSync(FEEDS_PATH, 'utf8'));
  let recs = [];
  try {
    recs = JSON.parse(fs.readFileSync(RECS_PATH, 'utf8'));
  } catch (e) {
    console.warn('recommendations.json not found or invalid, starting empty');
    recs = [];
  }

  let id = Date.now();
  for (const f of feeds) {
    try {
      if (f.type === 'rss') continue; // keep RSS script for other path
      const items = await scrapePage(f.url);
      items.forEach(it => {
        recs.unshift({
          code: 'AUTO' + (id++),
          name: it.title.substring(0, 80),
          teacher: f.name || '網路',
          category: f.category || '延伸我',
          credits: 2,
          time: '',
          room: '',
          rating: null,
          difficulty: '未知',
          comment: it.title,
          source: f.name || f.url,
          verified: false
        });
      });
    } catch (e) {
      console.warn('feed scrape error', f.url, e && e.message);
    }
  }

  const max = 120;
  const out = recs.slice(0, max);
  fs.writeFileSync(RECS_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Puppeteer updater wrote', out.length, 'recommendations');
}

main().catch(e=>{ console.error(e); process.exit(1); });
