const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const langs = ['en','tr','de','fr','es','it','nl','sv','da','no','fi','zh','pt'];
const id = 'creator-content-packager';
const failures = [];
for (const lang of langs) {
  const file = path.join(root, 'dist', 'tools', id, `${lang}.html`);
  if (!fs.existsSync(file)) { failures.push(`${lang}: missing HTML`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
  const desc = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  const canon = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || '';
  if (title.length > 60) failures.push(`${lang}: title too long (${title.length})`);
  if (desc.length < 120 || desc.length > 155) failures.push(`${lang}: meta description length ${desc.length}`);
  if (!canon.endsWith(`/${lang}/${id}`)) failures.push(`${lang}: incorrect canonical ${canon}`);
  if ((html.match(/rel="alternate" hreflang=/g) || []).length !== 14) failures.push(`${lang}: expected 13 hreflang + x-default`);
  if ((html.match(/<h1\b/g) || []).length !== 1) failures.push(`${lang}: expected one H1`);
  if (!html.includes('Creator Content Packager') && lang === 'en') failures.push(`${lang}: app title absent`);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).filter(x => x.trim());
  for (const script of scripts) { try { new vm.Script(script); } catch (e) { failures.push(`${lang}: JS syntax: ${e.message}`); } }
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x => JSON.parse(x[1]));
  if (!schemas.flat().some(x => x['@type'] === 'SoftwareApplication')) failures.push(`${lang}: missing SoftwareApplication schema`);
  const faq = schemas.flat().find(x => x['@type'] === 'FAQPage');
  const visible = [...html.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)].map(x => [x[1], x[2]]);
  if (!faq || faq.mainEntity.length !== visible.length || faq.mainEntity.some((q,i) => q.name !== visible[i]?.[0] || q.acceptedAnswer.text !== visible[i]?.[1])) failures.push(`${lang}: visible FAQ and FAQ schema mismatch`);
}
const sitemap = fs.readFileSync(path.join(root, 'dist', 'sitemap.xml'), 'utf8');
for (const lang of langs) if (!sitemap.includes(`https://www.pratix.io/${lang}/${id}`)) failures.push(`sitemap missing ${lang}`);
if (failures.length) throw new Error(failures.join('\n'));
console.log(`Creator Content Packager validation passed for ${langs.length} language routes: metadata, H1, JSON-LD, FAQ parity, inline JS, and sitemap.`);
