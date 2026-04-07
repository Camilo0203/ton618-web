// Get Guild Premium Status
// Public endpoint for bot to check premium status (requires API key)

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, errorResponse, handleError, requireEnv, isValidDiscordId } from '../_shared/utils.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';

async function timingSafeEquals(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    let dummy = 0;
    for (let i = 0; i < aBytes.length; i++) dummy |= aBytes[i];
    return false;
  }
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Validate API key (for bot authentication)
    const apiKey = req.headers.get('X-Bot-Api-Key');
    const expectedApiKey = requireEnv('BOT_API_KEY');
    
    if (!apiKey || !(await timingSafeEquals(apiKey, expectedApiKey))) {
      return errorResponse('Unauthorized: Invalid or missing API key', 401);
    }

    // Extract guild_id from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const guildId = pathParts[pathParts.length - 1];

    if (!guildId || guildId === 'billing-guild-status') {
      return errorResponse('Missing guild_id in path', 400);
    }

    // Validate guild_id format
    if (!isValidDiscordId(guildId)) {
      console.error('Invalid guild_id format in billing-guild-status:', { guildId });
      return errorResponse('Invalid guild_id format', 400);
    }

    // Get premium status
    const supabase = createSupabaseClient();
    const db = new BillingDatabase(supabase);
    
    const premiumStatus = await db.getGuildPremiumStatus(guildId);

    // Get subscription details if premium
    let subscriptionDetails = null;
    if (premiumStatus.has_premium) {
      const subscription = await db.getActiveGuildSubscription(guildId);
      if (subscription) {
        subscriptionDetails = {
          plan_key: subscription.plan_key,
          billing_type: subscription.billing_type,
          status: subscription.status,
          renews_at: subscription.renews_at,
          ends_at: subscription.ends_at,
          lifetime: subscription.lifetime,
          cancel_at_period_end: subscription.cancel_at_period_end,
        };
      }
    }

    // Ensure robust shape with explicit null handling
    const response = {
      guild_id: guildId,
      has_premium: Boolean(premiumStatus.has_premium),
      plan_key: premiumStatus.plan_key || null,
      tier: premiumStatus.plan_key || null, // Alias for bot compatibility
      ends_at: premiumStatus.ends_at || null,
      expires_at: premiumStatus.ends_at || null, // Alias for bot compatibility
      lifetime: Boolean(premiumStatus.lifetime),
      subscription: subscriptionDetails,
      checked_at: new Date().toISOString(),
    };

    console.log(`✅ Guild premium status checked: ${guildId}`, {
      has_premium: response.has_premium,
      plan_key: response.plan_key,
      lifetime: response.lifetime,
    });

    return jsonResponse(response);

  } catch (error) {
    return handleError(error);
  }
});
