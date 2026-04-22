import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, errorResponse, handleError, requireEnv, getEnv, getRequestBody, validateRequiredFields, isValidDiscordId } from '../_shared/utils.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';
import { DiscordClient } from '../_shared/discord.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface StripeCheckoutSessionResponse {
  id: string;
  url: string;
}

async function createStripeCheckoutSession(
  secretKey: string,
  params: URLSearchParams
): Promise<StripeCheckoutSessionResponse> {
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const payload = await response.json();
  if (!response.ok) {
    const errorMessage = payload?.error?.message || 'Failed to create Stripe Checkout Session';
    throw new Error(errorMessage);
  }

  return payload as StripeCheckoutSessionResponse;
}

async function getFoundingSpotsRemaining(db: BillingDatabase): Promise<number> {
  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from('guild_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('is_founding_member', true);

  if (error) {
    throw error;
  }

  const used = count ?? 0;
  return Math.max(0, 50 - used);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
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

    // Get Discord user ID from user metadata
    const discordUserId = user.user_metadata?.provider_id;
    if (!discordUserId) {
      return errorResponse('Discord user ID not found in session', 400);
    }

    // Validate Discord user ID format
    if (!isValidDiscordId(discordUserId)) {
      console.error('Invalid Discord user ID format:', { discordUserId, user_id: user.id });
      return errorResponse('Invalid Discord user ID format', 400);
    }

    // Parse request body
    const body = await getRequestBody<{ guild_id?: string; plan_key: string; user_id?: string }>(req);

    validateRequiredFields(body, ['plan_key']);

    const { guild_id, plan_key } = body;

    // Validate plan_key
    const validPlans = ['pro_monthly', 'pro_yearly', 'lifetime', 'donate'];
    if (!validPlans.includes(plan_key)) {
      return errorResponse(`Invalid plan_key. Must be one of: ${validPlans.join(', ')}`, 400);
    }

    // Premium plans require guild_id
    const premiumPlans = ['pro_monthly', 'pro_yearly', 'lifetime'];
    if (premiumPlans.includes(plan_key)) {
      if (!guild_id) {
        return errorResponse('guild_id is required for premium plans', 400);
      }

      if (!isValidDiscordId(guild_id)) {
        return errorResponse('Invalid guild_id format', 400);
      }

      // Validate user has permission to manage this guild
      const discordAccessToken = user.user_metadata?.provider_token;
      if (!discordAccessToken) {
        return errorResponse('Discord access token not found. Please re-authenticate.', 401);
      }

      const discordClientId = requireEnv('DISCORD_CLIENT_ID');
      const discordClientSecret = requireEnv('DISCORD_CLIENT_SECRET');
      const discordRedirectUri = requireEnv('DISCORD_REDIRECT_URI');
      
      const discordClient = new DiscordClient(
        discordClientId,
        discordClientSecret,
        discordRedirectUri
      );

      // Fetch user's guilds from Discord
      let userGuilds;
      try {
        userGuilds = await discordClient.getUserGuilds(discordAccessToken);
      } catch (error) {
        console.error('Failed to fetch Discord guilds for ownership validation:', error);
        return errorResponse(
          'Failed to verify guild ownership. Please try again or re-authenticate.',
          500
        );
      }

      // Filter to manageable guilds and check if guild_id is in the list
      const manageableGuilds = discordClient.filterManageableGuilds(userGuilds);
      const hasPermission = manageableGuilds.some(g => g.id === guild_id);

      if (!hasPermission) {
        return errorResponse(
          'You do not have permission to manage this guild. You must be the owner or have "Manage Server" permission.',
          403
        );
      }

      // Check if guild already has active premium
      const adminSupabase = createSupabaseClient();
      const db = new BillingDatabase(adminSupabase);
      
      const premiumStatus = await db.getGuildPremiumStatus(guild_id);
      if (premiumStatus.has_premium) {
        const currentPlan = premiumStatus.plan_key || 'unknown';
        const isLifetime = premiumStatus.lifetime;
        
        if (isLifetime) {
          return errorResponse(
            `This guild already has lifetime premium access. Upgrades are not supported.`,
            409
          );
        }
        
        return errorResponse(
          `This guild already has an active ${currentPlan} subscription. Please cancel it first or wait until it expires.`,
          409
        );
      }
    }

    // Donations don't require guild_id
    if (plan_key === 'donate' && guild_id) {
      return errorResponse('guild_id should not be provided for donations', 400);
    }

    const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
    const priceMap: Record<string, string> = {
      pro_monthly: requireEnv('STRIPE_PRICE_PRO_MONTHLY'),
      pro_yearly: requireEnv('STRIPE_PRICE_PRO_YEARLY'),
      lifetime: requireEnv('STRIPE_PRICE_LIFETIME'),
      donate: requireEnv('STRIPE_PRICE_DONATE'),
    };

    const priceId = priceMap[plan_key];
    if (!priceId) {
      return errorResponse('Stripe price not configured for this plan', 500);
    }

    const siteUrl = getEnv('SITE_URL', 'https://ton618.app');
    const successUrl = `${siteUrl}/billing/success?plan_key=${encodeURIComponent(plan_key)}${guild_id ? `&guild_id=${encodeURIComponent(guild_id)}` : ''}`;
    const cancelUrl = `${siteUrl}/billing/cancel`;

    const mode = plan_key === 'pro_monthly' || plan_key === 'pro_yearly' ? 'subscription' : 'payment';
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('success_url', successUrl);
    params.set('cancel_url', cancelUrl);
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    params.set('metadata[guild_id]', guild_id || '');
    params.set('metadata[user_id]', body.user_id || discordUserId);
    params.set('metadata[discord_user_id]', discordUserId);
    params.set('metadata[plan_key]', plan_key);
    if (user.email) {
      params.set('customer_email', user.email);
    }

    if (plan_key !== 'donate') {
      const adminSupabase = createSupabaseClient();
      const db = new BillingDatabase(adminSupabase);
      const foundingSpotsRemaining = await getFoundingSpotsRemaining(db);
      const foundingCoupon = getEnv('STRIPE_FOUNDING_COUPON_ID', '').trim();
      if (foundingSpotsRemaining > 0 && foundingCoupon) {
        params.set('discounts[0][coupon]', foundingCoupon);
        params.set('metadata[founding_member_eligible]', 'true');
      }
    }

    const checkout = await createStripeCheckoutSession(stripeSecretKey, params);

    return jsonResponse({
      checkout_url: checkout.url,
    });

  } catch (error) {
    return handleError(error);
  }
});
