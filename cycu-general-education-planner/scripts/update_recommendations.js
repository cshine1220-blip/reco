const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

// 你可以在 feeds.json 裡維護要抓取的 RSS 或部落格網址
const feeds = JSON.parse(fs.readFileSync('feeds.json', 'utf8'));

async function fetchArticles() {
  const items = [];
  for (const f of feeds) {
    try {
      const feed = await parser.parseURL(f.url);
      feed.items.slice(0,5).forEach(i => {
        items.push({
          title: i.title,
          link: i.link,
          pubDate: i.pubDate || i.isoDate,
          source: f.name
        });
      });
    } catch (e) {
      console.warn('feed error', f.url, e.message);
    }
  }
  return items;
}

(async () => {
  const articles = await fetchArticles();
  const recs = JSON.parse(fs.readFileSync('recommendations.json', 'utf8'));

  // 簡單示範：把最新文章附加為 "社群心得" 類別之未核對課程
  let id = Date.now();
  articles.forEach(a => {
    recs.unshift({
      code: 'AUTO' + (id++),
      name: a.title.substring(0,60),
      teacher: a.source || '網路',
      category: '延伸我',
      credits: 2,
      time: '',
      room: '',
      rating: null,
      difficulty: '未知',
      comment: a.link,
      source: a.source,
      verified: false
    });
  });

  // 限制數量，避免檔案過大
  const max = 80;
  const out = recs.slice(0, max);
  fs.writeFileSync('recommendations.json', JSON.stringify(out, null, 2), 'utf8');
  console.log('Updated recommendations.json with', articles.length, 'articles');
})();
