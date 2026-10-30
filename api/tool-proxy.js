const ALLOWED = [
  'https://pratix-seo-metadata.vercel.app/',
  'https://pratix-utm-campaign-builder.vercel.app/',
  'https://excel-data-cleaner-iota.vercel.app/'
];

module.exports = async (req, res) => {
  const target = typeof req.query.target === 'string' ? req.query.target : '';
  if (!ALLOWED.some((prefix) => target.startsWith(prefix))) {
    return res.status(400).send('Invalid tool target');
  }
  try {
    const upstream = await fetch(target, { headers: { accept: 'text/html,*/*' } });
    const type = upstream.headers.get('content-type') || '';
    if (!type.includes('text/html')) {
      return res.status(upstream.status).send(await upstream.text());
    }
    let html = await upstream.text();
    const injection = '<script defer src="/tool-actions.js"></script>';
    if (!html.includes('/tool-actions.js')) {
      html = html.includes('</head>') ? html.replace('</head>', `${injection}</head>`) : `${injection}${html}`;
    }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(upstream.status).send(html);
  } catch (error) {
    return res.status(502).send('Tool upstream unavailable');
  }
};
