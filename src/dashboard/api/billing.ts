import {
  checkoutSessionResultSchema,
  customerPortalSessionSchema,
  guildBillingEntitlementSchema,
} from '../schemas';
import type {
  CheckoutSessionResult,
  CustomerPortalSessionResult,
  DashboardBillingInterval,
  GuildBillingEntitlement,
} from '../types';
import {
  createDashboardError,
  debugAuthLog,
  ensureGuildId,
  getSupabaseClient,
  GuildBillingEntitlementRow,
  runQueryWithTimeout,
} from './shared';

function serializeInvokeErrorPart(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (value instanceof Error) {
    return value.message || value.name;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function summarizeFunctionInvokeError(error: unknown): Promise<string> {
  if (!(error && typeof error === 'object')) {
    return error instanceof Error ? error.message : String(error);
  }

  const invokeError = error as Record<string, unknown>;
  const details: string[] = [];

  if (typeof invokeError.status === 'number') {
    details.push(`status=${invokeError.status}`);
  }

  if (typeof invokeError.code === 'string' && invokeError.code) {
    details.push(`code=${invokeError.code}`);
  }

  const message = serializeInvokeErrorPart(invokeError.message);
  if (message) {
    details.push(`message=${message}`);
  }

  const data = serializeInvokeErrorPart(invokeError.data);
  if (data) {
    details.push(`data=${data}`);
  }

  const body = serializeInvokeErrorPart(invokeError.body);
  if (body) {
    details.push(`body=${body}`);
  }

  const context = invokeError.context;
  if (context instanceof Response) {
    details.push(`responseStatus=${context.status}`);
    if (context.statusText) {
      details.push(`responseStatusText=${context.statusText}`);
    }

    try {
      const responseBody = await context.clone().text();
      const serializedBody = serializeInvokeErrorPart(responseBody);
      if (serializedBody) {
        details.push(`responseBody=${serializedBody}`);
      }
    } catch {
      // Best-effort only; keep the rest of the error details.
    }
  } else {
    const serializedContext = serializeInvokeErrorPart(context);
    if (serializedContext) {
      details.push(`context=${serializedContext}`);
    }
  }

  return details.join(' | ') || 'Unknown function invoke error';
}

function mapBillingRow(row: GuildBillingEntitlementRow): GuildBillingEntitlement {
  return guildBillingEntitlementSchema.parse({
    guildId: row.guild_id,
    effectivePlan: row.effective_plan ?? 'free',
    planSource: row.plan_source ?? 'free',
    subscriptionStatus: row.subscription_status,
    billingInterval: row.billing_interval,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    supporterEnabled: Boolean(row.supporter_enabled),
    supporterExpiresAt: row.supporter_expires_at,
    updatedAt: row.updated_at,
  });
}

export async function fetchGuildBillingEntitlement(guildId: string): Promise<GuildBillingEntitlement | null> {
  const client = getSupabaseClient();
  const resolvedGuildId = ensureGuildId(guildId, 'consultar billing');

  const { data, error } = await runQueryWithTimeout(
    'billing.entitlement',
    client
      .from('guild_effective_entitlements')
      .select(
        'guild_id, effective_plan, plan_source, subscription_status, billing_interval, current_period_end, cancel_at_period_end, supporter_enabled, supporter_expires_at, updated_at',
      )
      .eq('guild_id', resolvedGuildId)
      .maybeSingle<GuildBillingEntitlementRow>(),
  );

  if (error) {
    throw createDashboardError(
      'billing.entitlement',
      error,
      'No se pudo cargar el estado de billing del servidor.',
    );
  }

  return data ? mapBillingRow(data) : null;
}

export async function createGuildCheckoutSession(
  guildId: string,
  billingInterval: DashboardBillingInterval,
): Promise<CheckoutSessionResult> {
  const client = getSupabaseClient();
  const resolvedGuildId = ensureGuildId(guildId, 'crear el checkout');
  const nowInSeconds = Math.floor(Date.now() / 1000);

  debugAuthLog('createGuildCheckoutSession:session:start', {
    guildId: resolvedGuildId,
    billingInterval,
  });

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const currentSession = sessionData.session;
  const expiresAt = currentSession?.expires_at ?? null;
  const isExpired = typeof expiresAt === 'number' ? expiresAt <= nowInSeconds : false;
  const willExpireSoon = typeof expiresAt === 'number' ? expiresAt - nowInSeconds < 60 : false;
  const shouldRefreshSession = !currentSession || !currentSession.access_token || isExpired || willExpireSoon;

  debugAuthLog('createGuildCheckoutSession:session:getSession', {
    hasSession: Boolean(currentSession),
    hasAccessToken: Boolean(currentSession?.access_token),
    expiresAt,
    isExpired,
    willExpireSoon,
    refreshSessionExecuted: shouldRefreshSession,
    sessionError: sessionError?.message ?? null,
  }, sessionError ? 'error' : 'info');

  if (shouldRefreshSession) {
    const { data: refreshData, error: refreshError } = await client.auth.refreshSession();
    debugAuthLog('createGuildCheckoutSession:session:refreshSession', {
      hasSession: Boolean(refreshData.session),
      hasAccessToken: Boolean(refreshData.session?.access_token),
      expiresAt: refreshData.session?.expires_at ?? null,
      isExpired: typeof refreshData.session?.expires_at === 'number'
        ? refreshData.session.expires_at <= nowInSeconds
        : false,
      willExpireSoon: typeof refreshData.session?.expires_at === 'number'
        ? refreshData.session.expires_at - nowInSeconds < 60
        : false,
      refreshSessionExecuted: true,
      refreshError: refreshError?.message ?? null,
    }, refreshError ? 'error' : 'info');
  }

  const { data: verifiedSessionData, error: verifiedSessionError } = await client.auth.getSession();
  const verifiedSession = verifiedSessionData.session;
  const verifiedExpiresAt = verifiedSession?.expires_at ?? null;
  const verifiedIsExpired = typeof verifiedExpiresAt === 'number' ? verifiedExpiresAt <= nowInSeconds : false;
  const verifiedWillExpireSoon = typeof verifiedExpiresAt === 'number'
    ? verifiedExpiresAt - nowInSeconds < 60
    : false;
  debugAuthLog('createGuildCheckoutSession:session:verified', {
    hasSession: Boolean(verifiedSession),
    hasAccessToken: Boolean(verifiedSession?.access_token),
    expiresAt: verifiedExpiresAt,
    isExpired: verifiedIsExpired,
    willExpireSoon: verifiedWillExpireSoon,
    refreshSessionExecuted: shouldRefreshSession,
    sessionError: verifiedSessionError?.message ?? null,
  }, verifiedSessionError ? 'error' : 'info');

  if (!verifiedSession?.access_token) {
    throw new Error('No hay una sesión válida de Supabase para abrir checkout.');
  }

  debugAuthLog('createGuildCheckoutSession:invoke:start', {
    guildId: resolvedGuildId,
    billingInterval,
    hasSession: Boolean(verifiedSession),
    hasAccessToken: Boolean(verifiedSession?.access_token),
    expiresAt: verifiedExpiresAt,
    isExpired: verifiedIsExpired,
    willExpireSoon: verifiedWillExpireSoon,
    refreshSessionExecuted: shouldRefreshSession,
  });

  const { data, error } = await client.functions.invoke('create-checkout-session', {
    body: {
      guildId: resolvedGuildId,
      billingInterval,
    },
  });

  if (error) {
    const summarizedError = await summarizeFunctionInvokeError(error);
    debugAuthLog('createGuildCheckoutSession:invoke:error', {
      guildId: resolvedGuildId,
      billingInterval,
      error: summarizedError,
    }, 'error');
    throw new Error(summarizedError);
  }

  debugAuthLog('createGuildCheckoutSession:invoke:success', {
    guildId: resolvedGuildId,
    billingInterval,
    hasUrl: Boolean(data && typeof data === 'object' && 'url' in (data as Record<string, unknown>)),
  });

  return checkoutSessionResultSchema.parse(data);
}

export async function createCustomerPortalSession(
  guildId: string,
): Promise<CustomerPortalSessionResult> {
  const client = getSupabaseClient();
  const resolvedGuildId = ensureGuildId(guildId, 'abrir el portal de billing');

  const { data, error } = await client.functions.invoke('create-customer-portal-session', {
    body: {
      guildId: resolvedGuildId,
    },
  });

  if (error) {
    throw createDashboardError(
      'billing.portal',
      error,
      'No se pudo abrir el portal de billing.',
    );
  }

  return customerPortalSessionSchema.parse(data);
}
