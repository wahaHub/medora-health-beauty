const DEFAULT_CRM_API_BASE_URL = 'http://localhost:3001';

function getCrmApiBaseUrl() {
  return (process.env.CRM_API_BASE_URL || DEFAULT_CRM_API_BASE_URL).replace(/\/+$/, '');
}

function getUpstreamUrl(req) {
  const pathParts = Array.isArray(req.query?.path) ? req.query.path : [];
  const path = pathParts.join('/');
  const search = new URL(req.url || '/api/patient', 'http://localhost').search;
  return `${getCrmApiBaseUrl()}/api/patient/${path}${search}`;
}

function toForwardHeaders(headers = {}) {
  const forwarded = {};

  for (const [name, value] of Object.entries(headers)) {
    if (typeof value === 'undefined') continue;
    if (Array.isArray(value)) {
      forwarded[name] = value.join(', ');
      continue;
    }
    forwarded[name] = value;
  }

  forwarded['x-medora-site'] = 'beauty';
  delete forwarded.host;
  delete forwarded.connection;
  delete forwarded['content-length'];

  return forwarded;
}

function getRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  if (typeof req.body === 'string' || req.body instanceof Buffer) {
    return req.body;
  }

  if (typeof req.body === 'undefined' || req.body === null) {
    return undefined;
  }

  return JSON.stringify(req.body);
}

function forwardSetCookies(res, upstreamRes) {
  const setCookies = typeof upstreamRes.headers.getSetCookie === 'function'
    ? upstreamRes.headers.getSetCookie()
    : upstreamRes.headers.get('set-cookie');

  if (Array.isArray(setCookies) && setCookies.length > 0) {
    res.setHeader('Set-Cookie', setCookies);
    return;
  }

  if (typeof setCookies === 'string' && setCookies.length > 0) {
    res.setHeader('Set-Cookie', setCookies);
  }
}

export default async function handler(req, res) {
  try {
    const upstreamRes = await fetch(getUpstreamUrl(req), {
      method: req.method,
      headers: toForwardHeaders(req.headers),
      body: getRequestBody(req),
    });

    const contentType = upstreamRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    forwardSetCookies(res, upstreamRes);

    const body = await upstreamRes.text();
    return res.status(upstreamRes.status).send(body);
  } catch (error) {
    console.error('Beauty patient proxy failed:', error);
    return res.status(502).json({
      error: 'crm_proxy_failed',
      message: 'Unable to reach CRM patient API',
    });
  }
}
