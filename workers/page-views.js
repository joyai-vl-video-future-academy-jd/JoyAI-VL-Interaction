export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Cache-Control': 'no-store',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!['GET', 'POST'].includes(request.method)) {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const url = new URL(request.url);
    const page = normalizePage(url.searchParams.get('page'));
    if (!page) {
      return json({ error: 'Missing page' }, 400, corsHeaders);
    }

    const key = `views:${page}`;
    const current = Number(await env.PAGE_VIEWS.get(key)) || 0;
    const views = request.method === 'POST' ? current + 1 : current;

    if (request.method === 'POST') {
      await env.PAGE_VIEWS.put(key, String(views));
    }

    return json({ page, views }, 200, corsHeaders);
  },
};

function normalizePage(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname.replace(/\/$/, '/')}`;
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
