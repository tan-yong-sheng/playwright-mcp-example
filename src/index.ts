import { env } from 'cloudflare:workers';

import { createMcpAgent } from '@cloudflare/playwright-mcp';

export const PlaywrightMCP = createMcpAgent(env.BROWSER);

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // ✅ Authorization check (only if env.BEARER_TOKEN is set)
    if (env.BEARER_TOKEN) {
      const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization');
      const bearerToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

      if (bearerToken !== env.BEARER_TOKEN) {
        return new Response('Unauthorized', { status: 401 });
      }
    }
    
    const { pathname }  = new URL(request.url);

    switch (pathname) {
      case '/sse':
      case '/sse/message':
        return PlaywrightMCP.serveSSE('/sse').fetch(request, env, ctx);
      case '/mcp':
        return PlaywrightMCP.serve('/mcp').fetch(request, env, ctx);
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};
