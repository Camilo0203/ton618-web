import {
  appleTouchIconPath,
  buildAbsoluteUrl,
  defaultMetaDescription,
  defaultMetaTitle,
  faviconPath,
  manifestPath,
  normalizeSiteUrl,
  socialImagePath,
} from './siteMetadata';

const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
}

export const config = {
  botName: 'TON618',
  brandMarkPath: '/logo-ton618-transparent.png',
  socialImagePath,
  faviconPath,
  appleTouchIconPath,
  manifestPath,
  defaultMetaTitle,
  defaultMetaDescription,
  // Keep public dashboard promotion disabled unless explicitly enabled for this site.
  enableDashboard: parseBooleanEnv(import.meta.env.VITE_ENABLE_DASHBOARD, false),
  discordClientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
  discordPermissions: import.meta.env.VITE_DISCORD_PERMISSIONS || '8',
  supportServerUrl: import.meta.env.VITE_SUPPORT_SERVER_URL || '',
  dashboardUrl: import.meta.env.VITE_DASHBOARD_URL || '',
  docsUrl: import.meta.env.VITE_DOCS_URL || '',
  statusUrl: import.meta.env.VITE_STATUS_URL || '',
  githubUrl: import.meta.env.VITE_GITHUB_URL || '',
  twitterUrl: import.meta.env.VITE_TWITTER_URL || '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',
  donationUrl: import.meta.env.VITE_DONATION_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  billingBetaMode: parseBooleanEnv(import.meta.env.VITE_BILLING_BETA_MODE, false),
  whopPlanMonthly: import.meta.env.VITE_WHOP_PLAN_MONTHLY || '',
  whopPlanYearly: import.meta.env.VITE_WHOP_PLAN_YEARLY || '',
  whopPlanLifetime: import.meta.env.VITE_WHOP_PLAN_LIFETIME || '',
  siteUrl,
  dashboardInternalPath: '/dashboard',
  authCallbackPath: '/auth/callback',
};


export function getSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    // Usamos el origen real del navegador para asegurar que las redirecciones
    // coincidan siempre con el dominio donde esta alojada la web.
    return normalizeSiteUrl(window.location.origin);
  }

  return config.siteUrl || '';
}

export function getDashboardUrl(): string {
  return config.dashboardUrl || config.dashboardInternalPath;
}

export function isPublicDashboardEnabled(): boolean {
  return config.enableDashboard;
}

export function getPublicDashboardUrl(): string | null {
  if (!config.enableDashboard) {
    return null;
  }

  return getDashboardUrl();
}

export function isDashboardExternal(): boolean {
  return Boolean(config.dashboardUrl);
}

export function getAuthCallbackUrl(): string {
  const origin = getSiteOrigin();

  return origin ? `${origin}${config.authCallbackPath}` : config.authCallbackPath;
}

export function getCanonicalUrl(pathname = '/'): string {
  const origin = getSiteOrigin();
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (!origin) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `${origin}/` : `${origin}${normalizedPath}`;
}

export function getAbsoluteAssetUrl(path: string): string {
  const origin = getSiteOrigin();
  return buildAbsoluteUrl(origin, path);
}

export function getDiscordInviteUrl(guildId?: string): string {
  if (!config.discordClientId) {
    return '';
  }

  const clientId = encodeURIComponent(config.discordClientId);
  const permissions = encodeURIComponent(config.discordPermissions);
  const guildSuffix = guildId
    ? `&guild_id=${encodeURIComponent(guildId)}&disable_guild_select=true`
    : '';

  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands${guildSuffix}`;
}

export function getDashboardBillingUrl(guildId?: string | null): string {
  const baseUrl = getDashboardUrl();
  const url = new URL(baseUrl, getSiteOrigin() || 'https://ton618.local');
  url.searchParams.set('section', 'billing');

  if (guildId) {
    url.searchParams.set('guild', guildId);
  }

  const serialized = `${url.pathname}${url.search}${url.hash}`;
  if (!isDashboardExternal()) {
    return serialized;
  }

  return url.toString();
}
