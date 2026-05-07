// Guild Premium Status — Bot API
// Returns premium status for a single guild. Used by ton618-bot to enforce Pro gating.
// Auth: X-Bot-Api-Key header (must match BOT_API_KEY env).

import { getCorsHeaders, jsonResponse, errorResponse, requireEnv } from '../_shared/utils.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';

// Deno global is provided by Supabase Edge runtime.
declare const Deno: { serve: (handler: (req: Request) => Promise<Response> | Response) => void };

const GUILD_ID_REGEX = /^\d{17,20}$/;

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) });
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  // --- Bot API Key validation ---
  const botApiKey = req.headers.get('X-Bot-Api-Key');
  const expectedApiKey = requireEnv('BOT_API_KEY');
  if (!botApiKey || botApiKey !== expectedApiKey) {
    return errorResponse('Unauthorized', 401);
  }

  // --- Extract guildId from path ---
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const guildId = pathParts[pathParts.length - 1];

  if (!guildId || !GUILD_ID_REGEX.test(guildId)) {
    return errorResponse('Invalid guild ID', 400);
  }

  try {
    const supabase = createSupabaseClient();
    const db = new BillingDatabase(supabase);
    const status = await db.getGuildPremiumStatus(guildId);

    return jsonResponse({
      has_premium: status.has_premium,
      tier: status.plan_key,
      plan_key: status.plan_key,
      expires_at: status.ends_at,
      lifetime: status.lifetime,
      owner_user_id: null,
      _meta: {
        source: 'api',
        stale: false,
        unavailable: false,
        errorCode: null,
      },
    });
  } catch (error) {
    console.error('[billing-guild-status] Error fetching premium status:', error);

    return jsonResponse({
      has_premium: false,
      tier: null,
      plan_key: null,
      expires_at: null,
      lifetime: false,
      owner_user_id: null,
      _meta: {
        source: 'error',
        stale: false,
        unavailable: true,
        errorCode: 'billing_status_error',
      },
    }, 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handleRequest);
}
