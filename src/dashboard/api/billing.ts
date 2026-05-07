import { guildBillingEntitlementSchema } from '../schemas';
import type { GuildBillingEntitlement } from '../types';
import {
  createDashboardError,
  ensureGuildId,
  getSupabaseClient,
  GuildBillingEntitlementRow,
  runQueryWithTimeout,
} from './shared';

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

