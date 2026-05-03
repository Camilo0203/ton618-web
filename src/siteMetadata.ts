export const defaultMetaTitle = 'TON618 | Bilingual Discord bot for tickets, verification and staff operations';
export const defaultMetaDescription =
  'TON618 is a bilingual staff operations bot for Discord communities, with tickets, verification, setup, stats and control commands inside Discord.';

export const socialImagePath = '/social-preview.png';
export const faviconPath = '/logo-ton618-transparent.png';
export const appleTouchIconPath = '/logo-ton618.png';
export const manifestPath = '/site.webmanifest';

export function normalizeSiteUrl(value?: string): string {
  const trimmed = (value || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    console.warn(`[siteMetadata] Invalid site URL (missing protocol): ${trimmed}`);
    return '';
  }
  return trimmed;
}

export function buildAbsoluteUrl(origin: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!origin) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
