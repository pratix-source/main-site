const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const languages = ['en', 'tr', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'zh'];
const slugSection = source.match(/const LOCALIZED_SLUGS = \{([\s\S]*?)\n    \};/);
if (!slugSection) throw new Error('LOCALIZED_SLUGS not found');
const toolIds = [...slugSection[1].matchAll(/'([^']+)': \{/g)].map(match => match[1]);
const transSection = source.slice(source.indexOf('const TRANSLATIONS = {'), source.indexOf('\n    };', source.indexOf('const TRANSLATIONS = {')));
const ui = Object.fromEntries(languages.map(language => {
  const match = transSection.match(new RegExp(`${language}: \\{ heroTitle: '([^']*)', heroDesc: '([^']*)'`));
  return [language, match ? { title: match[1], description: match[2] } : null];
}));
function toolBlock(id) {
  const start = source.indexOf(`"id": "${id}"`);
  const end = source.indexOf('\n          {', start + 1);
  return source.slice(start, end === -1 ? source.length : end);
}
function localized(block, key, language) {
  const match = block.match(new RegExp(`"${key}": \\{([\\s\\S]*?)\\}`));
  if (!match) return '';
  const value = match[1].match(new RegExp(`"${language}": "([^\"]*)"`));
  return value ? value[1] : '';
}
const report = [];
for (const language of languages) {
  report.push({ language, page: 'hub', title: `${ui[language]?.title || ui.en.title} | Pratix.io`, description: ui[language]?.description || ui.en.description });
  for (const id of toolIds) {
    const block = toolBlock(id);
    const name = localized(block, 'name', language) || localized(block, 'name', 'en');
    const description = localized(block, 'desc', language) || localized(block, 'desc', 'en');
    report.push({ language, page: id, title: `${name} | Pratix.io`, description });
  }
}
const longTitles = report.filter(item => item.title.length > 60);
const shortDescriptions = report.filter(item => item.description.length < 120);
const longDescriptions = report.filter(item => item.description.length > 160);
console.log(JSON.stringify({ pages: report.length, tools: toolIds.length, languages: languages.length, title_over_60: longTitles.length, description_under_120: shortDescriptions.length, description_over_160: longDescriptions.length, samples: report.slice(0, 16), short_examples: shortDescriptions.slice(0, 20), long_title_examples: longTitles.slice(0, 10) }, null, 2));
