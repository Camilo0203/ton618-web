// Common utilities for Edge Functions

// Allowed origins - configure via environment variable or explicitly list
const ALLOWED_ORIGINS = [
  'https://ton618.app',
  'https://www.ton618.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// Add origin from env if available
const envOrigin = Deno.env.get('SITE_URL');
if (envOrigin && !ALLOWED_ORIGINS.includes(envOrigin)) {
  ALLOWED_ORIGINS.push(envOrigin);
}

/**
 * Get CORS headers for a specific request origin
 * @param requestOrigin - Origin from request headers
 * @returns CORS headers object
 */
export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  // Only allow specific origins, never use wildcard '*' in production
  const allowedOrigin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0] || 'https://ton618.app';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Legacy export for backward compatibility - prefer getCorsHeaders()
export const corsHeaders = getCorsHeaders();

export function jsonResponse(data: unknown, status = 200, requestOrigin?: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(requestOrigin),
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message: string, status = 400, requestOrigin?: string | null): Response {
  return jsonResponse({ error: message }, status, requestOrigin);
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnv(name: string, defaultValue = ''): string {
  return Deno.env.get(name) || defaultValue;
}

export async function getRequestBody<T = unknown>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export function sanitizeString(str: string | null | undefined): string | null {
  if (!str) return null;
  return str.trim() || null;
}

export function parseIntSafe(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function isValidDiscordId(id: string): boolean {
  return /^\d{17,19}$/.test(id);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCurrency(currency: string): boolean {
  // ISO 4217 currency codes (3 uppercase letters)
  return /^[A-Z]{3}$/.test(currency);
}

export function validateProviderId(id: unknown, fieldName: string): string {
  if (!id) {
    throw new Error(`${fieldName} is required`);
  }
  const idStr = String(id);
  if (idStr === 'null' || idStr === 'undefined' || idStr.trim() === '') {
    throw new Error(`${fieldName} is invalid: ${idStr}`);
  }
  return idStr;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): Response {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof Error) {
    if (error.message === 'DUPLICATE_EVENT') {
      return jsonResponse({ message: 'Event already processed' }, 200);
    }
    // Never leak internal error details to the caller in 500 responses.
    // The full error is already logged above via console.error.
    return errorResponse('Internal server error', 500);
  }

  return errorResponse('An unexpected error occurred', 500);
}

export function logRequest(request: Request, extra?: Record<string, unknown>): void {
  const REDACTED = '[REDACTED]';
  const SENSITIVE_HEADERS = new Set(['authorization', 'x-bot-api-key', 'cookie', 'x-api-key']);
  const headers = Object.fromEntries(
    [...request.headers.entries()].map(([k, v]) =>
      [k, SENSITIVE_HEADERS.has(k.toLowerCase()) ? REDACTED : v]
    )
  );
  console.log(JSON.stringify({
    method: request.method,
    url: request.url,
    headers,
    ...extra,
  }));
}

export function generateRandomState(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

export function buildUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function parseQueryParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Simple in-memory sliding-window rate limiter for Edge Functions.
// Tracks requests per key (ip + function name). Cleans old entries on each check.
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter(ts => ts > windowStart);

  if (validTimestamps.length >= maxRequests) {
    const oldestInWindow = validTimestamps[0];
    const retryAfterMs = windowStart + windowMs - oldestInWindow;
    return { allowed: false, retryAfterMs };
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);

  // Simple cleanup: if map grows too large, evict oldest 20% of keys
  if (rateLimitMap.size > 5000) {
    const entries = [...rateLimitMap.entries()];
    entries.sort((a, b) => (a[1][0] ?? 0) - (b[1][0] ?? 0));
    const evictCount = Math.floor(entries.length * 0.2);
    for (let i = 0; i < evictCount; i++) {
      rateLimitMap.delete(entries[i][0]);
    }
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function rateLimitResponse(
  retryAfterMs: number,
  requestOrigin?: string | null
): Response {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Please slow down.', retryAfter: retryAfterSeconds }),
    {
      status: 429,
      headers: {
        ...getCorsHeaders(requestOrigin),
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function isExpired(date: string | Date | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local;
  
  return `${maskedLocal}@${domain}`;
}

export function safeJsonParse<T = unknown>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}
