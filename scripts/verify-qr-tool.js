// Standalone verification for the QR Code Generator tool page.
// Usage: node scripts/verify-qr-tool.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const distFile = path.join(root, 'dist', 'tools', 'qr-code-generator.html');
const sourceFile = path.join(root, 'tools', 'qr-code-generator.html');
const failures = [];

if (!fs.existsSync(sourceFile)) throw new Error('tools/qr-code-generator.html: source missing');
const html = fs.readFileSync(distFile.exists ? distFile : sourceFile, 'utf8');

// Core SEO metadata (XHTML-style self-closing tags tolerated)
const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] || '';
const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1] || '';

if (!title || title.length > 70) failures.push(`title length ${title.length}`);
if (description.length < 80 || description.length > 165) failures.push(`description length ${description.length}`);
if (canonical !== 'https://www.pratix.io/en/qr-code-generator') failures.push(`canonical ${canonical}`);
if (ogUrl !== canonical) failures.push(`og:url ${ogUrl} != canonical`);

// Shared visual standard + rendering stack
if (!html.includes('/pratix-standard.css')) failures.push('pratix-standard.css link missing');
if (!html.includes('cdn.tailwindcss.com')) failures.push('tailwind CDN missing');
if (!html.includes('qrcode-generator')) failures.push('qrcode-generator library missing');

// Feature wiring: downloads, size/quiet-zone/error-correction controls, i18n hooks
const requiredFeatures = [
  'downloadPng',
  'downloadSvg',
  'error-correction',
  'marginSelect',
  'data-i18n',
];
for (const feature of requiredFeatures) {
  if (!html.includes(feature)) failures.push(`feature missing: ${feature}`);
}

// 12-language UI dictionary coverage
const languageCodes = ['en', 'tr', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'zh'];
for (const lang of languageCodes) {
  const pattern = new RegExp(`${lang}:\\s*\\{`);
  if (!pattern.test(html)) failures.push(`i18n dictionary missing language: ${lang}`);
}

// FAQ content for long-tail queries
const faqCount = (html.match(/<details[\s>]/g) || []).length;
if (faqCount < 4) failures.push(`FAQ entries ${faqCount}, expected >= 4`);

// Inline script syntax check
const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
try {
  new Function(inlineScript);
} catch (error) {
  failures.push(`inline script syntax: ${error.message}`);
}

if (failures.length) throw new Error('QR tool verification failed:\n' + failures.join('\n'));
console.log(`QR tool verification passed: canonical, metadata, shared CSS, 12-language UI, ${faqCount} FAQ entries, script syntax.`);