const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name === 'index.html') htmlFiles.push(fullPath);
  }
}
walk(dist);
if (htmlFiles.length !== 13) throw new Error(`Expected 13 generated hub pages, found ${htmlFiles.length}`);
const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  const decodedDescription = description.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
  const canonical = html.match(/<link rel="canonical" href="([^"]*)">/)?.[1] || '';
  const hreflangCount = (html.match(/data-seo-hreflang="true"/g) || []).length;
  const jsonLdCount = (html.match(/<script type="application\/ld\+json" data-seo-jsonld="true">/g) || []).length;
  if (!title || title.length > 60) failures.push(`${file}: title length ${title.length}`);
  if (decodedDescription.length < 120 || decodedDescription.length > 155) failures.push(`${file}: description length ${decodedDescription.length}`);
  if (!canonical.startsWith('https://www.pratix.io/')) failures.push(`${file}: canonical ${canonical}`);
  if (hreflangCount !== 13) failures.push(`${file}: hreflang count ${hreflangCount}`);
  if (jsonLdCount !== 1) failures.push(`${file}: JSON-LD count ${jsonLdCount}`);
}
for (const file of ['sitemap.xml', 'robots.txt', 'google6ddf2b84ffac0dd8.html']) {
  if (!fs.existsSync(path.join(dist, file))) failures.push(`dist/${file}: missing`);
}
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedUrlCount = 12 + 12 * 13;
if (sitemapUrls.length !== expectedUrlCount) failures.push(`sitemap.xml: ${sitemapUrls.length} URLs, expected ${expectedUrlCount}`);
for (const url of sitemapUrls) {
  if (!url.startsWith('https://www.pratix.io/')) failures.push(`sitemap.xml: non-www URL ${url}`);
}
const legacyFragments = ['pratix.io/schema', 'pratix.io/ads', 'pratix.io/revenue', 'pratix.io/prompter', 'pratix.io/content-creator-studio', 'pratix.io/tools/'];
for (const fragment of legacyFragments) {
  if (sitemapUrls.some(url => url.includes(fragment))) failures.push(`sitemap.xml: legacy/redirect URL present (${fragment})`);
}
const robotsText = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
if (!robotsText.includes('Sitemap: https://www.pratix.io/sitemap.xml')) failures.push('robots.txt: www sitemap declaration missing');
if (failures.length) throw new Error(failures.slice(0, 20).join('\n'));
console.log(`SEO validation passed for ${htmlFiles.length} hub pages: title <= 60, description 120-155, canonical, hreflang, JSON-LD, sitemap and robots.`);
