import type { ConfigMutationSectionId, GuildConfigMutation, TicketDashboardActionId } from '../types';
import { normalizeGuildMutations } from '../utils';
import {
  createDashboardError,
  DASHBOARD_RPC_TIMEOUT_MS,
  ensureGuildId,
  getSupabaseClient,
  GuildMutationRow,
  runQueryWithTimeout,
} from './shared';
import { getDashboardSession } from './auth';

function isRpcSignatureMismatch(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
  const code = typeof candidate.code === 'string' ? candidate.code : '';
  const message = typeof candidate.message === 'string' ? candidate.message.toLowerCase() : '';
  const details = typeof candidate.details === 'string' ? candidate.details.toLowerCase() : '';
  const hint = typeof candidate.hint === 'string' ? candidate.hint.toLowerCase() : '';
  const body = `${message} ${details} ${hint}`;

  return code === 'PGRST202'
    || (
      body.includes('request_guild_config_change')
      && (
        body.includes('schema cache')
        || body.includes('function')
        || body.includes('parameters')
        || body.includes('arguments')
      )
    );
}

async function callRequestGuildConfigChangeRpc(
  guildId: string,
  section: ConfigMutationSectionId,
  payload: unknown,
) {
  const client = getSupabaseClient();
  const primaryArgs = {
    p_guild_id: guildId,
    p_section: section,
    p_payload: payload,
  };
  const fallbackArgs = {
    guild_id: guildId,
    section,
    payload,
  };

  const firstAttempt = await runQueryWithTimeout(
    `rpc.request_guild_config_change.${guildId}.${section}`,
    client.rpc('request_guild_config_change', primaryArgs),
    DASHBOARD_RPC_TIMEOUT_MS,
  );

  if (!firstAttempt.error || !isRpcSignatureMismatch(firstAttempt.error)) {
    return firstAttempt;
  }

  return runQueryWithTimeout(
    `rpc.request_guild_config_change.${guildId}.${section}.fallback`,
    client.rpc('request_guild_config_change', fallbackArgs),
    DASHBOARD_RPC_TIMEOUT_MS,
  );
}

export async function requestGuildConfigChange(
  guildId: string,
  section: ConfigMutationSectionId,
  payload: unknown,
): Promise<GuildConfigMutation> {
  const resolvedGuildId = ensureGuildId(guildId, 'guardar cambios');
  const { data, error } = await callRequestGuildConfigChangeRpc(resolvedGuildId, section, payload);

  if (error) {
    throw createDashboardError(
      `rpc.request_guild_config_change.${resolvedGuildId}.${section}`,
      error,
      'No se pudo registrar la solicitud de cambio.',
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la solicitud de cambio.');
  }

  return mutations[0];
}

export async function requestGuildBackupAction(
  guildId: string,
  action: 'create_backup' | 'restore_backup',
  payload: Record<string, unknown>,
): Promise<GuildConfigMutation> {
  const resolvedGuildId = ensureGuildId(
    guildId,
    action === 'create_backup' ? 'crear el backup' : 'restaurar el backup',
  );
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `rpc.request_guild_backup_action.${resolvedGuildId}.${action}`,
    client.rpc('request_guild_backup_action', {
      p_guild_id: resolvedGuildId,
      p_action: action,
      p_payload: payload,
    }),
    DASHBOARD_RPC_TIMEOUT_MS,
  );

  if (error) {
    throw createDashboardError(
      `rpc.request_guild_backup_action.${resolvedGuildId}.${action}`,
      error,
      'No se pudo registrar la accion de backup.',
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la accion de backup.');
  }

  return mutations[0];
}

function resolveDiscordActorMetadata(sessionUser: Awaited<ReturnType<typeof getDashboardSession>>['user']) {
  const metadata = sessionUser?.user_metadata as Record<string, unknown> | undefined;
  const actorDiscordId =
    typeof metadata?.provider_id === 'string'
      ? metadata.provider_id
      : typeof metadata?.sub === 'string'
        ? metadata.sub
        : null;
  const actorLabel =
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : typeof metadata?.user_name === 'string'
          ? metadata.user_name
          : sessionUser?.email ?? null;

  return {
    actorDiscordId,
    actorLabel,
  };
}

export async function requestTicketDashboardAction(
  guildId: string,
  action: TicketDashboardActionId,
  payload: Record<string, unknown>,
): Promise<GuildConfigMutation> {
  const resolvedGuildId = ensureGuildId(guildId, 'ejecutar la accion del ticket');
  const client = getSupabaseClient();
  const { data: userData, error: userError } = await runQueryWithTimeout(
    `rpc.request_ticket_dashboard_action.user.${resolvedGuildId}.${action}`,
    client.auth.getUser(),
    DASHBOARD_RPC_TIMEOUT_MS,
  );

  if (userError) {
    throw createDashboardError(
      `rpc.request_ticket_dashboard_action.user.${resolvedGuildId}.${action}`,
      userError,
      'No se pudo validar la sesion antes de ejecutar la accion del ticket.',
    );
  }

  const actor = resolveDiscordActorMetadata(userData.user ?? null);

  const { data, error } = await runQueryWithTimeout(
    `rpc.request_ticket_dashboard_action.${resolvedGuildId}.${action}`,
    client.rpc('request_ticket_dashboard_action', {
      p_guild_id: resolvedGuildId,
      p_action: action,
      p_payload: {
        ...payload,
        actorDiscordId: actor.actorDiscordId,
        actorLabel: actor.actorLabel,
      },
    }),
    DASHBOARD_RPC_TIMEOUT_MS,
  );

  if (error) {
    throw createDashboardError(
      `rpc.request_ticket_dashboard_action.${resolvedGuildId}.${action}`,
      error,
      'No se pudo registrar la accion del ticket.',
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la accion del ticket.');
  }

  return mutations[0];
}
