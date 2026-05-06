import { describe, it, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // @ts-expect-error - shim for node/vitest
  globalThis.Deno = {
    env: {
      get: vi.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://supabase.test';
        if (key === 'SUPABASE_ANON_KEY') return 'anon_test';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'service_role_test';
        if (key === 'DISCORD_BOT_TOKEN') return 'bot_token_test';
        if (key === 'VITE_SENTRY_DSN') return '';
        return undefined;
      }),
    },
  };
});

describe('supabase/functions/sync-discord-guilds', () => {
  it('OPTIONS returns ok with CORS headers', async () => {
    const { handleRequest } = await import('./index');

    const req = new Request('http://localhost', {
      method: 'OPTIONS',
      headers: { origin: 'https://example.com' },
    });

    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin') ?? res.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
  });

  it('missing Authorization returns 401', async () => {
    const { handleRequest } = await import('./index');

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { origin: 'https://example.com' },
      body: JSON.stringify({ providerToken: 'token_test' }),
    });

    const res = await handleRequest(req);
    expect(res.status).toBe(401);
  });

  it('missing providerToken returns 400', async () => {
    const { handleRequest } = await import('./index');

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        origin: 'https://example.com',
        Authorization: 'Bearer supabase_auth_token',
      },
      body: JSON.stringify({ providerToken: '' }),
    });

    const res = await handleRequest(req);
    expect(res.status).toBe(400);
  });
});
