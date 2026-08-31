const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'index.html');
const distPath = path.join(root, 'dist');
const source = fs.readFileSync(sourcePath, 'utf8');
const languages = ['en', 'tr', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'zh'];
const siteOrigin = 'https://pratix.io';
const { getSeoCopy } = require('./seo-copy');

function escapeHtml(value) {
  return String(value).replaceAll('\\n', ' ').replace(/\s+/g, ' ').trim()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseSlugMap() {
  const sectionMatch = source.match(/const LOCALIZED_SLUGS = \{([\s\S]*?)\n    \};/);
  if (!sectionMatch) throw new Error('LOCALIZED_SLUGS map not found');
  const map = {};
  const entryPattern = /'([^']+)': \{([^}]+)\}/g;
  for (const entry of sectionMatch[1].matchAll(entryPattern)) {
    const perLanguage = {};
    for (const pair of entry[2].matchAll(/(en|tr|de|fr|es|it|nl|sv|da|no|fi|zh): '([^']+)'/g)) {
      perLanguage[pair[1]] = pair[2];
    }
    map[entry[1]] = perLanguage;
  }
  return map;
}

function parseQuotedMap(block) {
  return Object.fromEntries([...block.matchAll(/"(en|tr|de|fr|es|it|nl|sv|da|no|fi|zh)": "([^"]*)"/g)].map(match => [match[1], match[2]]));
}

function parseTools(slugMap) {
  const tools = {};
  for (const toolId of Object.keys(slugMap)) {
    const start = source.indexOf(`"id": "${toolId}"`);
    if (start === -1) throw new Error(`Tool not found: ${toolId}`);
    const end = source.indexOf('\n          {', start + 1);
    const block = source.slice(start, end === -1 ? source.length : end);
    const nameMatch = block.match(/"name": \{([\s\S]*?)\}/);
    const descMatch = block.match(/"desc": \{([\s\S]*?)\}/);
    if (!nameMatch || !descMatch) throw new Error(`Tool metadata not found: ${toolId}`);
    tools[toolId] = { name: parseQuotedMap(nameMatch[1]), desc: parseQuotedMap(descMatch[1]) };
  }
  return tools;
}

function parseUiTranslations() {
  const start = source.indexOf('const TRANSLATIONS = {');
  const end = source.indexOf('\n    };', start);
  const block = source.slice(start, end);
  const translations = {};
  for (const language of languages) {
    const match = block.match(new RegExp(`${language}: \\{ heroTitle: '([^']*)', heroDesc: '([^']*)'`));
    if (match) translations[language] = { heroTitle: match[1], heroDesc: match[2] };
  }
  return translations;
}

const slugMap = parseSlugMap();
const tools = parseTools(slugMap);
const uiTranslations = parseUiTranslations();
const localizedToolIds = Object.keys(slugMap);

function absoluteUrl(language, toolId = null) {
  if (!toolId) return `${siteOrigin}/${language}/`;
  return `${siteOrigin}/${language}/${slugMap[toolId][language]}`;
}

function replaceOrInsert(html, matcher, replacement, insertionPoint = '</head>') {
  if (matcher.test(html)) return html.replace(matcher, replacement);
  return html.replace(insertionPoint, `${replacement}\n${insertionPoint}`);
}

function setStaticMetadata(html, language, toolId = null) {
  const tool = toolId ? tools[toolId] : null;
  const rawName = tool ? (tool.name[language] || tool.name.en) : (uiTranslations[language]?.heroTitle || uiTranslations.en.heroTitle);
  const rawDescription = tool ? (tool.desc[language] || tool.desc.en) : (uiTranslations[language]?.heroDesc || uiTranslations.en.heroDesc);
  const { title, description } = getSeoCopy({ language, toolId, name: rawName, description: rawDescription });
  const canonical = absoluteUrl(language, toolId);
  const replacements = [
    [/<html\s+lang="[^"]*">/, `<html lang="${escapeHtml(language)}">`],
    [/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(title)}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(description)}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(title)}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(description)}">`],
    [/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`],
    [/<meta name="author" content="[^"]*">/, '<meta name="author" content="Pratix.io">'],
    [/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'],
    [/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="website">'],
    [/<meta property="og:site_name" content="[^"]*">/, '<meta property="og:site_name" content="Pratix.io">'],
    [/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${language}">`],
    [/<meta name="twitter:card" content="[^"]*">/, '<meta name="twitter:card" content="summary">'],
  ];
  for (const [matcher, replacement] of replacements) html = replaceOrInsert(html, matcher, replacement);

  const jsonLd = { '@context': 'https://schema.org', '@type': tool ? 'SoftwareApplication' : 'WebSite', name: rawName, description, url: canonical, ...(tool ? { applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', isAccessibleForFree: true } : {}), publisher: { '@type': 'Organization', name: 'Pratix.io', url: siteOrigin } };
  html = html.replace(/<script type="application\/ld\+json" data-seo-jsonld="true">[\s\S]*?<\/script>/g, '');
  html = html.replace('</head>', `  <script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(jsonLd)}</script>\n</head>`);
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '');
  html = html.replace(/\n\s*<link data-seo-hreflang="true"[^>]*>/g, '');

  const alternateLinks = languages.map(candidate => `  <link rel="alternate" hreflang="${candidate}" href="${absoluteUrl(candidate, toolId)}" data-seo-hreflang="true">`);
  alternateLinks.push(`  <link rel="alternate" hreflang="x-default" href="${absoluteUrl('en', toolId)}" data-seo-hreflang="true">`);
  html = html.replace('</head>', `${alternateLinks.join('\n')}\n</head>`);

  const contentTitle = rawName;
  const contentDescription = description;
  const staticSection = `\n  <section class="max-w-4xl mx-auto px-6 py-8 prerendered-content" data-prerendered="true">\n    <h1 class="text-2xl font-bold text-zinc-900">${escapeHtml(contentTitle)}</h1>\n    <p class="mt-3 text-zinc-600 leading-relaxed">${escapeHtml(contentDescription)}</p>\n  </section>\n`;
  html = html.replace('<body>', `<body>${staticSection}`);
  return html;
}

function writePage(relativePath, language, toolId = null) {
  const outputPath = path.join(distPath, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, setStaticMetadata(source, language, toolId));
}

fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath, { recursive: true });
writePage('index.html', 'en');
for (const language of languages) writePage(`${language}/index.html`, language);
for (const toolId of localizedToolIds) {
  for (const language of languages) writePage(`${language}/${slugMap[toolId][language]}/index.html`, language, toolId);
}

for (const staticFile of ['sitemap.xml', 'robots.txt', 'google6ddf2b84ffac0dd8.html']) {
  const staticSource = path.join(root, staticFile);
  if (fs.existsSync(staticSource)) fs.copyFileSync(staticSource, path.join(distPath, staticFile));
}

console.log(`Prerendered ${1 + languages.length + localizedToolIds.length * languages.length} pages into ${path.relative(root, distPath)}/`);
console.log(`Localized tools: ${localizedToolIds.length}; languages: ${languages.length}`);
