import * as Sentry from '@sentry/react';

export function setSentryDashboardUser(userId: string, email?: string | null) {
  Sentry.setUser({
    id: userId,
    email: email ?? undefined,
  });
}

export function clearSentryDashboardUser() {
  Sentry.setUser(null);
}

export function setSentryDashboardGuild(guildId: string, guildName: string) {
  Sentry.setTag('guild_id', guildId);
  Sentry.setTag('guild_name', guildName);
  Sentry.setContext('dashboard_guild', {
    guild_id: guildId,
    guild_name: guildName,
  });
}

export function clearSentryDashboardGuild() {
  Sentry.setTag('guild_id', undefined);
  Sentry.setTag('guild_name', undefined);
  Sentry.setContext('dashboard_guild', null);
}

export function addSentryModuleNavigation(from: string, to: string) {
  Sentry.addBreadcrumb({
    category: 'dashboard.navigation',
    message: `Module: ${from} → ${to}`,
    level: 'info',
    data: { from, to },
  });
}

export function addSentryMutationBreadcrumb(
  section: string,
  status: 'started' | 'success' | 'error',
  errorMessage?: string
) {
  Sentry.addBreadcrumb({
    category: 'dashboard.mutation',
    message: `Config change: ${section} (${status})`,
    level: status === 'error' ? 'error' : 'info',
    data: {
      section,
      status,
      ...(errorMessage ? { error: errorMessage } : {}),
    },
  });
}

export function addSentrySnapshotBreadcrumb(
  guildId: string,
  status: 'loading' | 'success' | 'error',
  durationMs?: number
) {
  Sentry.addBreadcrumb({
    category: 'dashboard.snapshot',
    message: `Snapshot ${status} for ${guildId}`,
    level: status === 'error' ? 'warning' : 'info',
    data: {
      guild_id: guildId,
      status,
      ...(durationMs != null ? { duration_ms: Math.round(durationMs) } : {}),
    },
  });
}
