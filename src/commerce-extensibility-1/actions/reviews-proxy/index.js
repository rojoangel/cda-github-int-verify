import fetch from 'node-fetch';

const ROUTES = [
  { pattern: /^\/api\/reviews\/([^/]+)$/, key: 'reviews:collection' },
  { pattern: /^\/api\/reviews\/([^/]+)\/([^/]+)$/, key: 'reviews:item' },
  { pattern: /^\/api\/ratings\/([^/]+)$/, key: 'ratings:collection' },
  { pattern: /^\/api\/ratings\/([^/]+)\/([^/]+)$/, key: 'ratings:item' },
];

const METHOD_RULES = {
  'reviews:collection': ['GET', 'POST'],
  'reviews:item': ['GET', 'DELETE'],
  'ratings:collection': ['GET', 'POST'],
  'ratings:item': ['GET', 'DELETE'],
};

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  };
}

function normalizeBaseUrl(baseUrl) {
  return typeof baseUrl === 'string' ? baseUrl.replace(/\/+$/, '') : '';
}

function parseRoute(path) {
  for (const route of ROUTES) {
    const match = path.match(route.pattern);
    if (match) {
      const [, sku, second] = match;
      return { key: route.key, sku, second };
    }
  }
  return null;
}

function buildUpstreamPath(route) {
  const sku = encodeURIComponent(route.sku);
  const second = route.second ? `/${encodeURIComponent(route.second)}` : '';

  if (route.key.startsWith('reviews:')) {
    return `/reviews/${sku}${second}`;
  }
  return `/ratings/${sku}${second}`;
}

async function readResponseBody(response) {
  const raw = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return raw;
  }

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return raw;
  }
}

function getConfigValue(params, key) {
  return process.env[key] || params[key] || '';
}

export async function main(params = {}) {
  const method = String(params.__ow_method || '').toUpperCase();
  const path = String(params.__ow_path || '');
  const route = parseRoute(path);

  console.log(JSON.stringify({
    operation: 'reviews-proxy.request',
    method,
    path,
    route: route ? route.key : 'unmatched',
  }));

  if (!route) {
    return json(404, { error: 'Not Found' });
  }

  if (!(METHOD_RULES[route.key] || []).includes(method)) {
    return json(405, { error: 'Method Not Allowed' });
  }

  const baseUrl = normalizeBaseUrl(getConfigValue(params, 'REVIEWS_API_BASE_URL'));
  const token = getConfigValue(params, 'REVIEWS_API_BEARER_TOKEN');

  if (!baseUrl || !token) {
    console.error(JSON.stringify({
      operation: 'reviews-proxy.config',
      baseUrlPresent: Boolean(baseUrl),
      tokenPresent: Boolean(token),
      errorClass: 'ConfigError',
    }));
    return json(500, { error: 'Proxy configuration is missing' });
  }

  const upstreamUrl = `${baseUrl}${buildUpstreamPath(route)}`;
  const headers = { Authorization: `Bearer ${token}` };
  const init = { method, headers };

  if (!['GET', 'DELETE'].includes(method) && params.__ow_body != null) {
    init.body = typeof params.__ow_body === 'string' ? params.__ow_body : JSON.stringify(params.__ow_body);
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(upstreamUrl, init);
    const body = await readResponseBody(response);
    return {
      statusCode: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    };
  } catch (error) {
    console.error(JSON.stringify({
      operation: 'reviews-proxy.upstream',
      method,
      path,
      upstreamUrl,
      errorClass: error?.name || 'Error',
      message: error?.message,
    }));
    return json(502, { error: 'Upstream request failed' });
  }
}

export default { main };
