/**
 * Cloudflare Worker — static asset delivery + API proxy.
 *
 * Serves the 16,000-page static build straight from the edge and forwards the
 * stateful routes (/api, /admin, /uploads) to a long-lived Node host that owns
 * the SQLite database. The browser only ever talks to one origin, so session
 * cookies and CSRF keep working without any CORS configuration.
 */

export interface Env {
  ASSETS: Fetcher;
  API_ORIGIN: string;
}

/** Routes handled by the stateful Node service rather than the static build. */
const PROXY_PREFIXES = ['/api', '/admin', '/uploads'];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (PROXY_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
      return proxy(request, env.API_ORIGIN);
    }

    // Pretty-URL fallback: /seo-services -> /seo-services/index.html
    if (env.ASSETS) {
      const direct = await env.ASSETS.fetch(request);
      if (direct.status !== 404) return withSecurityHeaders(direct);

      const indexUrl = new URL(url);
      indexUrl.pathname = url.pathname.replace(/\/+$/, '') + '/index.html';
      const viaIndex = await env.ASSETS.fetch(new Request(indexUrl, request));
      if (viaIndex.status !== 404) return withSecurityHeaders(viaIndex);
    }

    return withSecurityHeaders(new Response('Not found', { status: 404 }));
  },
};

async function proxy(request: Request, origin: string): Promise<Response> {
  const target = origin.replace(/\/$/, '') + new URL(request.url).pathname + new URL(request.url).search;
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const init: RequestInit = {
    method: request.method,
    headers: new Headers(request.headers),
    // Preserve the visitor's real protocol/host so the API issues correct
    // absolute URLs and secure cookies.
    redirect: 'manual',
  };
  if (hasBody) {
    (init as any).body = await request.arrayBuffer();
  }
  init.headers.set('x-forwarded-proto', new URL(request.url).protocol.replace(':', ''));
  init.headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '');

  const res = await fetch(target, init);
  return withSecurityHeaders(res);
}

function withSecurityHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set('X-Content-Type-Options', 'nosniff');
  out.headers.set('X-Frame-Options', 'SAMEORIGIN');
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  out.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  if (out.headers.get('content-type')?.includes('text/html')) {
    out.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );
  }
  return out;
}
