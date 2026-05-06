import { describe, it, expect, beforeAll, vi } from 'vitest';


const mockDenoEnv = {
  get: vi.fn((key: string) => {
    if (key === 'SUPABASE_URL') return 'https://supabase.test';
    if (key === 'SUPABASE_ANON_KEY') return 'anon_test';
    if (key === 'DISCORD_CLIENT_ID') return 'discord_client_id';
    if (key === 'DISCORD_CLIENT_SECRET') return 'discord_client_secret';
    if (key === 'DISCORD_REDIRECT_URI') return 'https://discord.test/callback';
    if (key === 'VITE_SENTRY_DSN') return '';
    return '';
  }),
};

beforeAll(() => {
  // @ts-expect-error - shim for tests
  globalThis.Deno = { env: mockDenoEnv };
});

describe('supabase/functions/billing-get-guilds', () => {
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

  it('method != GET returns 405', async () => {
    const { handleRequest } = await import('./index');

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { origin: 'https://example.com' },
    });

    const res = await handleRequest(req);
    expect(res.status).toBe(405);
  });

  it('missing Authorization returns 401', async () => {
    const { handleRequest } = await import('./index');

    const req = new Request('http://localhost', {
      method: 'GET',
      headers: { origin: 'https://example.com' },
    });

    const res = await handleRequest(req);
    expect(res.status).toBe(401);
  });
});
