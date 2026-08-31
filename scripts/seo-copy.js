const TITLE_OVERRIDES = {
  'ad-layout---banner-placeholder-generator': {
    fr: 'Outil de mise en page publicitaire et bannière',
    es: 'Diseño de anuncios y banners',
    nl: 'Advertentie- en bannertool',
    sv: 'Annons- och bannergenerator',
    fi: 'Mainos- ja bannertyökalu',
  },
};

const DESCRIPTION_SUFFIXES = {
  en: ' Runs in your browser without uploads. Simple, private, and ready when you are.',
  tr: ' Tarayıcınızda çalışır; yükleme veya sunucu gerektirmez. Hızlı, özel ve kullanıma hazırdır.',
  de: ' Läuft direkt im Browser – ohne Upload und ohne Server. Schnell, einfach und privat.',
  fr: ' Fonctionne directement dans votre navigateur, sans téléversement ni serveur. Rapide, simple et privé.',
  es: ' Funciona directamente en su navegador, sin cargas ni servidor. Rápido, sencillo y privado.',
  it: ' Funziona direttamente nel browser, senza caricamenti né server. Semplice, veloce e privato.',
  nl: ' Werkt direct in je browser, zonder upload of server. Snel, eenvoudig en privé.',
  sv: ' Körs direkt i webbläsaren utan uppladdning eller server. Snabbt, enkelt och privat.',
  da: ' Kører direkte i browseren uden upload eller server. Hurtigt, enkelt og privat.',
  no: ' Kjører direkte i nettleseren uten opplasting eller server. Raskt, enkelt og privat.',
  fi: ' Toimii suoraan selaimessa ilman latausta tai palvelinta. Nopeaa, helppoa ja yksityistä.',
  zh: ' 所有处理都在浏览器本地完成，无需上传文件或连接服务器。界面清晰、操作快速，并以隐私保护为优先，适合日常工作、内容制作、数据整理、网站优化和日常计算。无需注册即可开始使用，输入内容不会发送到远程服务，适合个人、团队和企业在日常工作中快速完成任务。',
};

const MAX_DESCRIPTION_LENGTH = 155;
const MIN_DESCRIPTION_LENGTH = 120;

function clean(value) {
  return String(value || '').replaceAll('\\n', ' ').replace(/\s+/g, ' ').trim();
}

function trimAtWord(value, limit) {
  if (value.length <= limit) return value;
  const clipped = value.slice(0, limit);
  const boundary = clipped.lastIndexOf(' ');
  const base = clipped.slice(0, boundary >= limit - 30 ? boundary : limit - 1).replace(/[,:;–—-]+$/, '').trim();
  return `${base.slice(0, limit - 1).trim()}.`;
}

function normalizeDescription(value, language) {
  let description = clean(value);
  const suffix = DESCRIPTION_SUFFIXES[language] || DESCRIPTION_SUFFIXES.en;
  if (description.length < MIN_DESCRIPTION_LENGTH) description = `${description}${suffix}`;
  return trimAtWord(description, MAX_DESCRIPTION_LENGTH);
}

function normalizeTitle(value, language, toolId) {
  const override = TITLE_OVERRIDES[toolId]?.[language];
  const base = clean(override || value);
  return `${base} | Pratix.io`;
}

function getSeoCopy({ language, toolId = null, name, description }) {
  return {
    title: normalizeTitle(name, language, toolId),
    description: normalizeDescription(description, language),
  };
}

module.exports = { getSeoCopy, MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH };
