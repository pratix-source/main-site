module.exports = async (req, res) => {
  const target = typeof req.query.target === 'string' ? req.query.target : '';
  let url;
  try { url = new URL(target); } catch (_) { return res.status(400).send('Invalid tool target'); }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.vercel.app')) {
    return res.status(400).send('Invalid tool target');
  }
  try {
    const upstream = await fetch(url.toString(), { headers: { accept: 'text/html,*/*' } });
    const type = upstream.headers.get('content-type') || '';
    let body = await upstream.text();
    if (type.includes('text/html') && !body.includes('/tool-actions.js')) {
      const injection = '<script defer src="/tool-actions.js"></script>';
      body = body.includes('</head>') ? body.replace('</head>', `${injection}</head>`) : `${injection}${body}`;
    }
    res.setHeader('content-type', type.includes('text/html') ? 'text/html; charset=utf-8' : type);
    res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(upstream.status).send(body);
  } catch (_) {
    return res.status(502).send('Tool upstream unavailable');
  }
};
