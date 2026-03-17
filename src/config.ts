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

export const config = {
  botName: 'TON618',
  brandMarkPath: '/logo-ton618-transparent.png',
  socialImagePath,
  faviconPath,
  appleTouchIconPath,
  manifestPath,
  defaultMetaTitle,
  defaultMetaDescription,
  discordClientId: import.meta.env.VITE_DISCORD_CLIENT_ID || '',
  discordPermissions: import.meta.env.VITE_DISCORD_PERMISSIONS || '8',
  supportServerUrl: import.meta.env.VITE_SUPPORT_SERVER_URL || '',
  dashboardUrl: import.meta.env.VITE_DASHBOARD_URL || '',
  docsUrl: import.meta.env.VITE_DOCS_URL || '',
  statusUrl: import.meta.env.VITE_STATUS_URL || '',
  githubUrl: import.meta.env.VITE_GITHUB_URL || '',
  twitterUrl: import.meta.env.VITE_TWITTER_URL || '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  siteUrl,
  dashboardInternalPath: '/dashboard',
  authCallbackPath: '/auth/callback',
};

function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && isLocalOrigin(window.location.origin)) {
    return window.location.origin;
  }

  if (config.siteUrl) {
    return config.siteUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function getDashboardUrl(): string {
  return config.dashboardUrl || config.dashboardInternalPath;
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
