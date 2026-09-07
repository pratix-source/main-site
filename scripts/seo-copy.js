const TITLE_OVERRIDES = {
  'ad-layout---banner-placeholder-generator': {
    fr: 'Outil de mise en page publicitaire et bannière',
    es: 'Diseño de anuncios y banners',
    nl: 'Advertentie- en bannertool',
    sv: 'Annons- och bannergenerator',
    fi: 'Mainos- ja bannertyökalu',
  },
  'schema-generator': {
    en: 'Free Schema Generator — JSON-LD Structured Data',
    tr: 'Ücretsiz Schema Oluşturucu — JSON-LD Veri',
    de: 'Kostenloser Schema-Generator — JSON-LD Daten',
    fr: 'Générateur de Schema JSON-LD Gratuit',
    es: 'Generador de Schema JSON-LD Gratis',
    it: 'Generatore di Schema JSON-LD Gratuito',
    nl: 'Gratis Schema Generator — JSON-LD Data',
    sv: 'Gratis Schema Generator — JSON-LD Data',
    da: 'Gratis Schema Generator — JSON-LD Data',
    no: 'Gratis Skjemagenerator — JSON-LD Data',
    fi: 'Ilmainen Skeemageneraattori — JSON-LD',
    zh: '免费 Schema 生成器 — JSON-LD 结构化数据',
  },
  'qr-code-generator': {
    en: 'Free QR Code Generator — Links, Wi-Fi, vCard',
    tr: 'Ücretsiz QR Kod Oluşturucu — Link, Wi-Fi, vCard',
    de: 'Kostenloser QR-Code-Generator — WLAN, vCard',
    fr: 'Générateur de QR Code Gratuit — Lien, Wi-Fi',
    es: 'Generador de Códigos QR Gratis — Wi-Fi, vCard',
    it: 'Generatore di QR Code Gratuito — Wi-Fi, vCard',
    nl: 'Gratis QR-codegenerator — Link, Wifi, vCard',
    sv: 'Gratis QR-kodsgenerator — Länk, Wi-Fi, vCard',
    da: 'Gratis QR-kodegenerator — Link, Wi-Fi, vCard',
    no: 'Gratis QR-kodegenerator — Lenke, Wi-Fi, vCard',
    fi: 'Ilmainen QR-koodigeneraattori — Linkki, Wi-Fi',
    zh: '免费二维码生成器 — 链接、Wi-Fi、名片',
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

const DESCRIPTION_OVERRIDES = {
  'schema-generator': {
    en: 'Free JSON-LD schema generator for structured data: create valid markup for rich results in your browser. No signup, no uploads, unlimited use.',
    tr: 'JSON-LD şema oluşturucu ile yapılandırılmış verinizi saniyeler içinde üretin. Zengin sonuçlar için ücretsiz schema generator; tarayıcınızda çalışır.',
    de: 'JSON-LD Schema-Generator für strukturierte Daten: Erstellen Sie gültiges Markup für Rich Results direkt im Browser — ohne Anmeldung, ohne Upload.',
    fr: 'Générateur de schéma JSON-LD pour données structurées : créez un balisage valide pour les rich results dans votre navigateur, sans inscription.',
    es: 'Generador de esquema JSON-LD para datos estructurados: crea marcado válido para resultados enriquecidos en tu navegador, sin registro ni subidas.',
    it: 'Generatore di schema JSON-LD per dati strutturati: crea markup validi per i rich results direttamente nel browser, senza registrazione né upload.',
    nl: 'JSON-LD schema generator voor gestructureerde data: maak geldige markup voor rich results direct in je browser, zonder registratie of uploads.',
    sv: 'JSON-LD schemagenerator för strukturerad data: skapa giltig markup för rich results direkt i webbläsaren, utan registrering eller uppladdning.',
    da: 'JSON-LD skemagenerator til strukturerede data: opret gyldig markup til rich results direkte i browseren, uden registrering eller upload.',
    no: 'JSON-LD skjemagenerator for strukturerte data: lag gyldig markup for rich results direkte i nettleseren, uten registrering eller opplasting.',
    fi: 'JSON-LD skeemageneraattori rakenteiselle datalle: luo kelvollinen merkintä rich results -tuloksiin suoraan selaimessa ilman rekisteröitymistä.',
    zh: '免费的 JSON-LD Schema 生成器：在浏览器中为结构化数据生成有效标记，助力 Google 搜索富结果展示，无需注册、无需上传文件，适合 Shopify、WooCommerce、Webflow、Wix、Squarespace 与 Magento 等平台的站长与开发者，即开即用。',
  },
  'qr-code-generator': {
    en: 'Create custom QR codes for URLs, text, Wi-Fi and contact cards in your browser. Choose colors and size, then download print-ready PNG or SVG files.',
    tr: 'URL, metin, Wi-Fi ve iletişim kartları için tarayıcınızda özel QR kodlar oluşturun. Renk ve boyut seçin, baskıya hazır PNG veya SVG olarak indirin.',
    de: 'Erstellen Sie individuelle QR-Codes für URLs, Text, WLAN und Kontaktkarten direkt im Browser. Farben und Größe wählen und als PNG oder SVG herunterladen.',
    fr: 'Créez des QR codes personnalisés pour URL, texte, Wi-Fi et cartes de visite dans votre navigateur. Choisissez couleurs et taille, exportez en PNG ou SVG.',
    es: 'Crea códigos QR personalizados para URL, texto, Wi-Fi y tarjetas de contacto en tu navegador. Elige colores y tamaño y descarga en PNG o SVG para impresión.',
    it: 'Crea QR code personalizzati per URL, testo, Wi-Fi e biglietti da visita nel browser. Scegli colori e dimensioni e scarica in PNG o SVG pronto per la stampa.',
    nl: "Maak aangepaste QR-codes voor URL's, tekst, wifi en contactkaarten in je browser. Kies kleuren en grootte en download drukklare PNG- of SVG-bestanden.",
    sv: 'Skapa anpassade QR-koder för URL:er, text, Wi-Fi och kontaktkort i webbläsaren. Välj färger och storlek och ladda ner utskriftsklara PNG- eller SVG-filer.',
    da: "Opret brugerdefinerede QR-koder til URL'er, tekst, Wi-Fi og kontaktkort i browseren. Vælg farver og størrelse og download printklare PNG- eller SVG-filer.",
    no: 'Lag egendefinerte QR-koder for URL-er, tekst, Wi-Fi og kontaktkort i nettleseren. Velg farger og størrelse og last ned utskriftsklare PNG- eller SVG-filer.',
    fi: 'Luo mukautettuja QR-koodeja linkkejä, tekstiä, Wi-Fi-yhteyksiä ja yhteystietoja varten selaimessa. Valitse värit ja koko ja lataa painovalmis PNG tai SVG.',
    zh: '在浏览器中为网址、文本、Wi-Fi 和联系人名片创建自定义二维码，自由调整颜色与尺寸，导出高清 PNG 或矢量 SVG，适用于海报、包装与名片印刷，无需注册，内容不上传服务器。',
  },
};

function normalizeDescription(value, language, toolId) {
  const override = DESCRIPTION_OVERRIDES[toolId]?.[language];
  let description = clean(override || value);
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
    description: normalizeDescription(description, language, toolId),
  };
}

module.exports = { getSeoCopy, MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH };
