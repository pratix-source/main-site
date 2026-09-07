#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const failures = [];

const htmlPath = path.join(dist, 'tools/llms-txt-generator.html');
if (!fs.existsSync(htmlPath)) failures.push('dist/tools/llms-txt-generator.html: missing');
const html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('<script src="https://cdn.tailwindcss.com"></script>')) failures.push('tailwind script tag missing');
if ((html.match(/class="ad-slot/g) || []).length !== 4) failures.push(`ad-slot count ${(html.match(/class="ad-slot/g) || []).length}, expected 4`);
if (!html.includes('rel="canonical" href="https://www.pratix.io/en/llms-txt-generator"')) failures.push('canonical missing');
if (!html.includes('application/ld+json')) failures.push('FAQPage JSON-LD missing');
if (!html.includes('id="llmsOutput"')) failures.push('live preview output missing');
if (!html.includes('id="copyBtn"') || !html.includes('id="downloadBtn"')) failures.push('copy/download buttons missing');
if (!html.includes('buildLlms')) failures.push('generator logic missing');

const LANGUAGES = ['en', 'tr', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'zh'];
for (const lang of LANGUAGES) {
  if (!html.includes(`    ${lang}: {`)) failures.push(`translation block ${lang} missing`);
}

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
for (const route of ['/en/llms-txt-generator', '/tr/llms-txt-olusturucu', '/fi/llms-txt-generaattori', '/zh/llms-wenjian-shengchengqi']) {
  if (!sitemap.includes(`https://www.pratix.io${route}</loc>`)) failures.push(`sitemap URL missing: ${route}`);
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('llms.txt tool validation passed: metadata, 12 languages, 4 ad slots, copy/download wiring and sitemap routes.');