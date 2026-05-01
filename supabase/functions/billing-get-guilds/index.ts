// Get User's Manageable Guilds with Premium Status
// Fetches guilds from Discord API and enriches with premium info

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { getCorsHeaders, jsonResponse, errorResponse, handleError, requireEnv, getClientIp, checkRateLimit, rateLimitResponse } from '../_shared/utils.ts';
import { DiscordClient } from '../_shared/discord.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) });
  }

  // Rate limit: 60 requests per minute per IP
  const clientIp = getClientIp(req);
  const { allowed: rateAllowed, retryAfterMs } = checkRateLimit(`billing-get-guilds:${clientIp}`, 60, 60000);
  if (!rateAllowed) {
    return rateLimitResponse(retryAfterMs, req.headers.get('origin'));
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Get authenticated user from Supabase Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401);
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');
    const supabaseAnonKey = requireEnv('SUPABASE_ANON_KEY');
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get Discord access token from user metadata
    const discordAccessToken = user.user_metadata?.provider_token;
    if (!discordAccessToken) {
      return errorResponse('Discord access token not found. Please re-authenticate.', 401);
    }

    // Initialize Discord client
    const discordClientId = requireEnv('DISCORD_CLIENT_ID');
    const discordClientSecret = requireEnv('DISCORD_CLIENT_SECRET');
    const discordRedirectUri = requireEnv('DISCORD_REDIRECT_URI');
    
    const discordClient = new DiscordClient(
      discordClientId,
      discordClientSecret,
      discordRedirectUri
    );

    // Fetch user's guilds from Discord
    let guilds;
    try {
      guilds = await discordClient.getUserGuilds(discordAccessToken);
    } catch (error) {
      console.error('Failed to fetch Discord guilds:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        return errorResponse(
          'Discord access token has expired. Please log out and log in again.',
          401
        );
      }
      
      return errorResponse(
        'Failed to fetch guilds from Discord. Please try again or re-authenticate.',
        500
      );
    }

    // Filter to only manageable guilds
    const manageableGuilds = discordClient.filterManageableGuilds(guilds);

    // Get premium status for all guilds
    const adminSupabase = createSupabaseClient();
    const db = new BillingDatabase(adminSupabase);

    const guildsWithPremium = await Promise.all(
      manageableGuilds.map(async (guild) => {
        const premiumStatus = await db.getGuildPremiumStatus(guild.id);
        
        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          icon_url: discordClient.getGuildIconUrl(guild.id, guild.icon, 128),
          owner: guild.owner,
          has_premium: premiumStatus.has_premium,
          plan_key: premiumStatus.plan_key,
          ends_at: premiumStatus.ends_at,
          lifetime: premiumStatus.lifetime,
        };
      })
    );

    // Sort: premium guilds first, then alphabetically
    guildsWithPremium.sort((a, b) => {
      if (a.has_premium && !b.has_premium) return -1;
      if (!a.has_premium && b.has_premium) return 1;
      return a.name.localeCompare(b.name);
    });

    return jsonResponse({
      guilds: guildsWithPremium,
      total: guildsWithPremium.length,
      premium_count: guildsWithPremium.filter(g => g.has_premium).length,
    });

  } catch (error) {
    return handleError(error);
  }
});
