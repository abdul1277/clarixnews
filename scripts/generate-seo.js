const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'articles.js'), 'utf8');
const serialized = vm.runInNewContext(source + '\n;JSON.stringify(ARTICLES);', { URL, URLSearchParams });
const articles = JSON.parse(serialized);

if (!Array.isArray(articles) || articles.length === 0) {
  throw new Error('No articles were loaded from articles.js; refusing to overwrite SEO files.');
}

const base = 'https://clarixnews.vercel.app';
const today = new Date().toISOString().slice(0, 10);
const escapeXml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char]));

function parseDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? new Date(today + 'T12:00:00Z') : date;
}
function rfcDate(value) {
  return parseDate(value).toUTCString();
}
function urlFor(id) {
  return base + '/article.html?id=' + encodeURIComponent(String(id));
}

const staticPages = [
  ['', '1.0', 'daily'],
  ['/markets.html', '0.9', 'hourly'],
  ['/weather.html', '0.9', 'hourly'],
  ['/about.html', '0.5', 'monthly'],
  ['/contact.html', '0.5', 'monthly'],
  ['/privacy.html', '0.3', 'yearly'],
  ['/terms.html', '0.3', 'yearly'],
  ['/category.html?cat=world', '0.8', 'daily'],
  ['/category.html?cat=pakistan', '0.8', 'daily'],
  ['/category.html?cat=usa', '0.8', 'daily'],
  ['/category.html?cat=europe', '0.8', 'daily'],
  ['/category.html?cat=middleeast', '0.8', 'daily'],
  ['/category.html?cat=asia', '0.8', 'daily'],
  ['/category.html?cat=business', '0.8', 'daily'],
  ['/category.html?cat=tech', '0.8', 'daily'],
  ['/category.html?cat=career', '0.8', 'daily'],
  ['/category.html?cat=opinion', '0.8', 'daily']
];

const staticXml = staticPages.map(([url, priority, changefreq]) =>
  '  <url><loc>' + escapeXml(base + url) + '</loc><lastmod>' + today +
  '</lastmod><changefreq>' + changefreq + '</changefreq><priority>' + priority + '</priority></url>'
);
const articleXml = articles.filter(a => a && a.id && a.title).map(article =>
  '  <url><loc>' + escapeXml(urlFor(article.id)) + '</loc><lastmod>' +
  parseDate(article.date).toISOString().slice(0, 10) +
  '</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>'
);
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  staticXml.join('\n') + '\n' + articleXml.join('\n') + '\n</urlset>\n';

const latest = articles.filter(a => a && a.id && a.title)
  .slice()
  .sort((a, b) => parseDate(b.date) - parseDate(a.date))
  .slice(0, 50);
const items = latest.map(article => {
  const link = urlFor(article.id);
  return [
    '    <item>',
    '      <title>' + escapeXml(article.title) + '</title>',
    '      <link>' + escapeXml(link) + '</link>',
    '      <guid isPermaLink="true">' + escapeXml(link) + '</guid>',
    '      <pubDate>' + rfcDate(article.date) + '</pubDate>',
    '      <category>' + escapeXml(article.category || 'News') + '</category>',
    '      <description>' + escapeXml(article.subtitle || article.title) + '</description>',
    '    </item>'
  ].join('\n');
});
const rss = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0"><channel>\n' +
  '  <title>ClarixNews — Latest Articles</title>\n' +
  '  <link>' + base + '/</link>\n' +
  '  <description>Latest news, explainers and practical guides from ClarixNews.</description>\n' +
  '  <language>en</language>\n' +
  '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n' +
  items.join('\n') + '\n</channel></rss>\n';

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(root, 'rss.xml'), rss);
console.log('Generated sitemap.xml (' + (staticPages.length + articleXml.length) + ' URLs) and rss.xml (' + latest.length + ' articles).');
