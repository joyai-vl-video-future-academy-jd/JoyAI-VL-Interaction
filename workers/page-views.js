const ALLOWED_ORIGINS = new Set([
  'https://joyai-vl-video-future-academy-jd.github.io',
  'http://172.20.3.173:8080',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (!['GET', 'POST'].includes(request.method)) {
      return json({ error: 'Method not allowed' }, 405, headers);
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'Forbidden origin' }, 403, headers);
    }

    const url = new URL(request.url);
    if (url.pathname !== '/pageview') {
      return json({ error: 'Not found' }, 404, headers);
    }

    const page = normalizePage(url.searchParams.get('page'));
    if (!page) {
      return json({ error: 'Missing page' }, 400, headers);
    }

    if (request.method === 'POST') {
      await env.DB.prepare(`
        INSERT INTO page_views (page, views, updated_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(page) DO UPDATE SET
          views = views + 1,
          updated_at = CURRENT_TIMESTAMP
      `).bind(page).run();
    }

    const row = await env.DB.prepare(
      'SELECT views FROM page_views WHERE page = ?'
    ).bind(page).first();

    return json({ page, views: Number(row?.views || 0) }, 200, headers);
  },
};

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
    'Cache-Control': 'no-store',
  };
}

function normalizePage(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/index\.html$/, '/');
    return `${url.hostname}${path}`;
  } catch (_) {
    return value.slice(0, 200);
  }
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
