import { describe, it, expect, beforeAll, vi } from 'vitest';

const mockDenoEnv = {
  get: vi.fn((key: string) => {
    // Keep env deterministic for tests. Override specific keys if needed.
    if (key === 'SITE_URL') return '';
    return '';
  }),
};

beforeAll(() => {
  // @ts-expect-error - create a minimal Deno shim for node/vitest
  globalThis.Deno = {
    env: mockDenoEnv,
  };
});

describe('supabase/functions/_shared/utils', () => {
  it('isValidDiscordId validates 17-19 digit IDs', async () => {
    const mod = await import('./utils.ts');
    expect(mod.isValidDiscordId('12345678901234567')).toBe(true); // 17 digits
    expect(mod.isValidDiscordId('1234567890123456789')).toBe(true); // 19 digits (max allowed)
    expect(mod.isValidDiscordId('12345678901234567890')).toBe(false); // 20 digits (too long)
    expect(mod.isValidDiscordId('abcd')).toBe(false);
    expect(mod.isValidDiscordId('123')).toBe(false);
  });

  it('isValidEmail validates basic email format', async () => {
    const mod = await import('./utils.ts');
    expect(mod.isValidEmail('a@b.com')).toBe(true);
    expect(mod.isValidEmail('test@example.co.uk')).toBe(true);
    expect(mod.isValidEmail('not-an-email')).toBe(false);
    expect(mod.isValidEmail('a@b')).toBe(false);
  });

  it('isValidCurrency validates ISO 4217 codes (3 uppercase letters)', async () => {
    const mod = await import('./utils.ts');
    expect(mod.isValidCurrency('USD')).toBe(true);
    expect(mod.isValidCurrency('EUR')).toBe(true);
    expect(mod.isValidCurrency('usd')).toBe(false);
    expect(mod.isValidCurrency('US')).toBe(false);
    expect(mod.isValidCurrency('USDX')).toBe(false);
  });

  it('sanitizeString trims and returns null for empty/undefined', async () => {
    const mod = await import('./utils.ts');
    expect(mod.sanitizeString('  hello  ')).toBe('hello');
    expect(mod.sanitizeString('   ')).toBe(null);
    expect(mod.sanitizeString(undefined)).toBe(null);
    expect(mod.sanitizeString(null)).toBe(null);
  });

  it('parseIntSafe parses number and string, falls back to default on NaN', async () => {
    const mod = await import('./utils.ts');
    expect(mod.parseIntSafe(12.9)).toBe(12);
    expect(mod.parseIntSafe('42')).toBe(42);
    expect(mod.parseIntSafe('42.7')).toBe(42);
    expect(mod.parseIntSafe('nope', 7)).toBe(7);
    expect(mod.parseIntSafe(undefined as unknown, 7)).toBe(7);
  });

  it('checkRateLimit allows under maxRequests and blocks on exceed', async () => {
    const mod = await import('./utils.ts');

    const key = 'rate-limit-test';
    const maxRequests = 2;
    const windowMs = 60_000;

    const r1 = mod.checkRateLimit(key, maxRequests, windowMs);
    const r2 = mod.checkRateLimit(key, maxRequests, windowMs);
    const r3 = mod.checkRateLimit(key, maxRequests, windowMs);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);
    // retryAfterMs puede ser 0 dependiendo del timing exacto, pero no debería ser negativo
    expect(r3.retryAfterMs).toBeGreaterThanOrEqual(0);
  });
});
