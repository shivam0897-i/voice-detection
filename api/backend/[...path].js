/* global process, Buffer */
const DEFAULT_BACKEND_BASE_URL = 'https://shivam-2211-voice-detection-api.hf.space';

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function extractProxyPath(req) {
  const pathParam = req.query?.path;
  if (Array.isArray(pathParam) && pathParam.length > 0) {
    return pathParam.join('/');
  }
  if (typeof pathParam === 'string' && pathParam.length > 0) {
    return pathParam;
  }

  const rawUrl = String(req.url || '');
  const pathname = rawUrl.split('?')[0];
  const prefix = '/api/backend/';

  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length);
  }
  if (pathname === '/api/backend') {
    return '';
  }
  return '';
}

function buildTargetUrl(req) {
  const base = normalizeBaseUrl(process.env.BACKEND_BASE_URL || DEFAULT_BACKEND_BASE_URL);
  const path = extractProxyPath(req);

  const query = new URLSearchParams();
  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key === 'path') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
      return;
    }
    if (value != null) {
      query.append(key, String(value));
    }
  });

  const qs = query.toString();
  return `${base}/${path}${qs ? `?${qs}` : ''}`;
}

function buildForwardHeaders(req) {
  const headers = {
    Accept: 'application/json',
  };

  const contentType = req.headers['content-type'];
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const apiKey = process.env.BACKEND_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  return headers;
}

function getRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }
  if (req.body == null) {
    return undefined;
  }
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
    return req.body;
  }
  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const targetUrl = buildTargetUrl(req);
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: buildForwardHeaders(req),
      body: getRequestBody(req),
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || '';
    const bodyText = await upstream.text();

    res.status(upstream.status);
    res.setHeader('Cache-Control', 'no-store');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (!bodyText) {
      res.end();
      return;
    }

    if (contentType.includes('application/json')) {
      try {
        res.json(JSON.parse(bodyText));
        return;
      } catch {
        // Fall through as plain text if upstream JSON is malformed.
      }
    }

    res.send(bodyText);
  } catch {
    res.status(502).json({
      status: 'error',
      message: 'Upstream service unavailable',
    });
  }
}
