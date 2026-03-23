import { supabase } from '../../lib/supabaseClient';

export const OAUTH_EXCHANGE_TIMEOUT_MS = 15_000;
export const GUILD_SYNC_TIMEOUT_MS = 20_000;
export const DASHBOARD_QUERY_TIMEOUT_MS = 12_000;
export const DASHBOARD_RPC_TIMEOUT_MS = 15_000;
export const DASHBOARD_AUTH_INTENT_STORAGE_KEY = 'dashboard:auth-intent';

export interface GuildAccessRow {
  guild_id: string;
  guild_name: string;
  guild_icon: string | null;
  permissions_raw: string | null;
  can_manage: boolean | null;
  is_owner: boolean | null;
  bot_installed: boolean | null;
  member_count: number | null;
  premium_tier: string | null;
  bot_last_seen_at: string | null;
  last_synced_at: string | null;
}

export interface GuildConfigRow {
  guild_id: string;
  general_settings: unknown;
  server_roles_channels_settings: unknown;
  tickets_settings: unknown;
  verification_settings: unknown;
  welcome_settings: unknown;
  suggestion_settings: unknown;
  modlog_settings: unknown;
  command_settings: unknown;
  system_settings: unknown;
  moderation_settings: unknown;
  dashboard_preferences: unknown;
  updated_by: string | null;
  updated_at: string | null;
  config_source: string | null;
}

export interface GuildInventoryRow {
  guild_id: string;
  roles: unknown;
  channels: unknown;
  categories: unknown;
  commands: unknown;
  updated_at: string | null;
}

export interface GuildEventRow {
  id: string;
  guild_id: string;
  event_type: string;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GuildMetricsRow {
  guild_id: string;
  metric_date: string;
  commands_executed: number | null;
  moderated_messages: number | null;
  active_members: number | null;
  uptime_percentage: number | null;
  tickets_opened: number | null;
  tickets_closed: number | null;
  open_tickets: number | null;
  sla_breaches: number | null;
  avg_first_response_minutes: number | null;
  modules_active: string[] | null;
}

export interface GuildMutationRow {
  id: string;
  guild_id: string;
  actor_user_id: string | null;
  mutation_type: string | null;
  section: string | null;
  status: string | null;
  requested_payload: unknown;
  applied_payload: unknown;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  requested_at: string | null;
  applied_at: string | null;
  failed_at: string | null;
  superseded_at: string | null;
  updated_at: string | null;
}

export interface GuildBackupRow {
  backup_id: string;
  guild_id: string;
  actor_user_id: string | null;
  source: string | null;
  schema_version: number | null;
  exported_at: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface GuildSyncStatusRow {
  guild_id: string;
  bridge_status: string | null;
  bridge_message: string | null;
  last_heartbeat_at: string | null;
  last_inventory_at: string | null;
  last_config_sync_at: string | null;
  last_mutation_processed_at: string | null;
  last_backup_at: string | null;
  pending_mutations: number | null;
  failed_mutations: number | null;
  updated_at: string | null;
}

export interface GuildTicketInboxRow {
  guild_id: string;
  ticket_id: string;
  channel_id: string;
  user_id: string;
  user_label: string | null;
  workflow_status: string | null;
  queue_type: string | null;
  category_id: string | null;
  category_label: string | null;
  priority: string | null;
  subject: string | null;
  claimed_by: string | null;
  claimed_by_label: string | null;
  assignee_id: string | null;
  assignee_label: string | null;
  claimed_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_customer_message_at: string | null;
  last_staff_message_at: string | null;
  last_activity_at: string | null;
  message_count: number | null;
  staff_message_count: number | null;
  reopen_count: number | null;
  tags: string[] | null;
  sla_target_minutes: number | null;
  sla_due_at: string | null;
  sla_state: string | null;
  is_open: boolean | null;
}

export interface GuildTicketEventRow {
  id: string;
  guild_id: string;
  ticket_id: string;
  channel_id: string | null;
  actor_id: string | null;
  actor_kind: string | null;
  actor_label: string | null;
  event_type: string;
  visibility: string | null;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GuildTicketMacroRow {
  macro_id: string;
  guild_id: string;
  label: string;
  content: string;
  visibility: string | null;
  sort_order: number | null;
  is_system: boolean | null;
}

export interface GuildPlaybookDefinitionRow {
  guild_id: string;
  playbook_id: string;
  key: string;
  label: string | null;
  description: string | null;
  tier: string | null;
  execution_mode: string | null;
  summary: string | null;
  trigger_summary: string | null;
  is_enabled: boolean | null;
  sort_order: number | null;
  updated_at: string | null;
}

export interface GuildPlaybookRunRow {
  run_id: string;
  guild_id: string;
  playbook_id: string;
  ticket_id: string;
  user_id: string;
  status: string | null;
  tone: string | null;
  title: string | null;
  summary: string | null;
  reason: string | null;
  suggested_action: string | null;
  suggested_priority: string | null;
  suggested_status: string | null;
  suggested_macro_id: string | null;
  confidence: number | null;
  sort_order: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GuildCustomerMemoryRow {
  guild_id: string;
  user_id: string;
  display_label: string | null;
  total_tickets: number | null;
  open_tickets: number | null;
  resolved_tickets: number | null;
  breached_tickets: number | null;
  recent_tags: string[] | null;
  last_ticket_at: string | null;
  last_resolved_at: string | null;
  risk_level: string | null;
  summary: string | null;
  updated_at: string | null;
}

export interface GuildTicketRecommendationRow {
  recommendation_id: string;
  guild_id: string;
  ticket_id: string;
  user_id: string;
  playbook_id: string;
  status: string | null;
  tone: string | null;
  title: string | null;
  summary: string | null;
  reason: string | null;
  suggested_action: string | null;
  suggested_priority: string | null;
  suggested_status: string | null;
  suggested_macro_id: string | null;
  confidence: number | null;
  customer_risk_level: string | null;
  customer_summary: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

function getMissingSupabaseConfigKeys(): string[] {
  const missingKeys: string[] = [];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    missingKeys.push('VITE_SUPABASE_URL');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missingKeys.push('VITE_SUPABASE_ANON_KEY');
  }

  return missingKeys;
}

export function getSupabaseClient() {
  if (!supabase) {
    const missingKeys = getMissingSupabaseConfigKeys();
    const missingKeysLabel = missingKeys.length ? ` Faltan: ${missingKeys.join(', ')}.` : '';
    throw new Error(`Supabase no esta configurado para la dashboard.${missingKeysLabel}`);
  }

  return supabase;
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error) {
    return error;
  }

  return fallbackMessage;
}

function isTemporaryDashboardError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  return [
    'timeout',
    'network',
    'fetch',
    'failed to fetch',
    'timed out',
    'tempor',
    'temporar',
    '429',
    '500',
    '502',
    '503',
    '504',
    'edge function',
  ].some((token) => normalizedMessage.includes(token));
}

export function createDashboardError(context: string, error: unknown, fallbackMessage: string): Error {
  const baseMessage = getErrorMessage(error, fallbackMessage).trim() || fallbackMessage;
  const hint = isTemporaryDashboardError(baseMessage)
    ? ' Parece un problema temporal; puedes reintentar en unos segundos.'
    : '';

  return new Error(`${baseMessage}${hint} [${context}]`);
}

function readStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function persistDashboardAuthIntent(requestedGuildId?: string | null) {
  const storage = readStorage();
  if (!storage) {
    return;
  }

  const intent = {
    requestedGuildId: requestedGuildId ?? null,
    createdAt: new Date().toISOString(),
  };

  storage.setItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY, JSON.stringify(intent));
}

export function peekDashboardAuthIntent(): { requestedGuildId: string | null } {
  const storage = readStorage();
  if (!storage) {
    return { requestedGuildId: null };
  }

  const rawIntent = storage.getItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY);
  if (!rawIntent) {
    return { requestedGuildId: null };
  }

  storage.removeItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY);

  try {
    const parsedIntent = JSON.parse(rawIntent) as { requestedGuildId?: unknown };
    return {
      requestedGuildId:
        typeof parsedIntent.requestedGuildId === 'string' && parsedIntent.requestedGuildId
          ? parsedIntent.requestedGuildId
          : null,
    };
  } catch {
    return { requestedGuildId: null };
  }
}

export function clearDashboardAuthIntent() {
  const storage = readStorage();
  storage?.removeItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY);
}

export function resolveDashboardRedirectPath(preferredGuildId?: string | null): string {
  if (!preferredGuildId) {
    return '/dashboard';
  }

  return `/dashboard?guild=${encodeURIComponent(preferredGuildId)}`;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timeoutHandle: number | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
  }
}

export async function runQueryWithTimeout<T>(
  context: string,
  promise: PromiseLike<T>,
  timeoutMs = DASHBOARD_QUERY_TIMEOUT_MS,
): Promise<T> {
  try {
    return await withTimeout(
      Promise.resolve(promise),
      timeoutMs,
      `La consulta del dashboard tardo demasiado (${timeoutMs / 1000}s).`,
    );
  } catch (error: unknown) {
    throw createDashboardError(
      context,
      error,
      'No se pudo completar una consulta requerida por el dashboard.',
    );
  }
}

export function ensureGuildId(guildId: string, context: string): string {
  const normalizedGuildId = guildId.trim();
  if (!normalizedGuildId) {
    throw new Error(`No hay un servidor valido seleccionado para ${context}.`);
  }

  return normalizedGuildId;
}

export function debugAuthLog(event: string, payload?: Record<string, unknown>, level: 'info' | 'error' = 'info'): void {
  if (!import.meta.env.DEV) {
    return;
  }
  if (level === 'error') {
    console.error(`[dashboard-auth] ${event}`, payload);
  } else {
    console.log(`[dashboard-auth] ${event}`, payload);
  }
}
