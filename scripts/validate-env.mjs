import fs from 'node:fs';
import path from 'node:path';

function parseEnvFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const entries = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    entries[key] = value;
  }

  return entries;
}

const fileArg = process.argv.find((argument) => argument.startsWith('--file='));
const modeArg = process.argv.find((argument) => argument.startsWith('--mode='));
const mode = modeArg ? modeArg.slice('--mode='.length) : 'runtime';
const envFile = fileArg ? path.resolve(process.cwd(), fileArg.slice('--file='.length)) : null;
const env = envFile ? { ...process.env, ...parseEnvFile(envFile) } : process.env;

function parseBooleanEnv(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return undefined;
}

const requiredKeys = [
  'VITE_DISCORD_CLIENT_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SITE_URL',
];

const errors = [];
const warnings = [];

for (const key of requiredKeys) {
  if (!String(env[key] || '').trim()) {
    errors.push(`${key} is required.`);
  }
}

// Validate VITE_DISCORD_CLIENT_ID format (Discord snowflake: 17-19 digits)
if (env.VITE_DISCORD_CLIENT_ID) {
  const clientId = String(env.VITE_DISCORD_CLIENT_ID).trim();
  if (!/^\d{17,19}$/.test(clientId)) {
    errors.push('VITE_DISCORD_CLIENT_ID must be a 17-19 digit Discord application ID (snowflake).');
  }
}

// Validate VITE_SUPABASE_ANON_KEY format (JWT starting with eyJ)
if (env.VITE_SUPABASE_ANON_KEY) {
  const anonKey = String(env.VITE_SUPABASE_ANON_KEY).trim();
  if (!anonKey.startsWith('eyJ') || anonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY must be a valid Supabase JWT (starts with eyJ, ≥100 chars).');
  }
}

if (env.VITE_SUPABASE_URL && !/^https:\/\/.+/i.test(env.VITE_SUPABASE_URL)) {
  errors.push('VITE_SUPABASE_URL must be an https URL.');
}
if (env.VITE_SUPABASE_URL && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(env.VITE_SUPABASE_URL)) {
  warnings.push('VITE_SUPABASE_URL does not match standard Supabase project URL pattern (https://<project>.supabase.co).');
}

if (env.VITE_SITE_URL && !/^https?:\/\/.+/i.test(env.VITE_SITE_URL)) {
  errors.push('VITE_SITE_URL must be an absolute URL.');
}
if (mode === 'production' && env.VITE_SITE_URL && !/^https:\/\//i.test(env.VITE_SITE_URL)) {
  errors.push('VITE_SITE_URL must use https in production mode (not http).');
}

if (String(env.VITE_DASHBOARD_URL || '').trim() && !/^https?:\/\/.+/i.test(env.VITE_DASHBOARD_URL)) {
  errors.push('VITE_DASHBOARD_URL must be an absolute URL when provided.');
}

if (mode === 'production') {
  if (/localhost|127\.0\.0\.1/i.test(String(env.VITE_SITE_URL || ''))) {
    errors.push('VITE_SITE_URL cannot point to localhost in production mode.');
  }
  if (/localhost|127\.0\.0\.1/i.test(String(env.VITE_DASHBOARD_URL || ''))) {
    errors.push('VITE_DASHBOARD_URL cannot point to localhost in production mode.');
  }
}

if (!String(env.VITE_SUPPORT_SERVER_URL || '').trim()) {
  warnings.push('VITE_SUPPORT_SERVER_URL is empty. Footer and support CTA will lose the direct support link.');
} else if (!/^https?:\/\/.+/i.test(String(env.VITE_SUPPORT_SERVER_URL))) {
  errors.push('VITE_SUPPORT_SERVER_URL must be an absolute URL when provided.');
}

if (!String(env.VITE_DOCS_URL || '').trim()) {
  warnings.push('VITE_DOCS_URL is empty. Docs CTA will point to fallback routes only.');
} else if (!/^https?:\/\/.+/i.test(String(env.VITE_DOCS_URL))) {
  errors.push('VITE_DOCS_URL must be an absolute URL when provided.');
}

if (!String(env.VITE_STATUS_URL || '').trim()) {
  warnings.push('VITE_STATUS_URL is empty. Status CTA will be hidden or degraded.');
} else if (!/^https?:\/\/.+/i.test(String(env.VITE_STATUS_URL))) {
  errors.push('VITE_STATUS_URL must be an absolute URL when provided.');
}

if (!String(env.VITE_CONTACT_EMAIL || '').trim()) {
  warnings.push('VITE_CONTACT_EMAIL is empty. Enterprise and billing contact paths will degrade.');
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(env.VITE_CONTACT_EMAIL).trim())) {
  errors.push('VITE_CONTACT_EMAIL must be a valid email address.');
}

const billingBetaMode = parseBooleanEnv(env.VITE_BILLING_BETA_MODE);

if (billingBetaMode === false) {
  warnings.push('VITE_BILLING_BETA_MODE is false. Self-serve billing will stay broadly available only if allowlist enforcement is disabled server-side.');
}

for (const warning of warnings) {
  console.warn(`WARN: ${warning}`);
}

if (errors.length) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

console.log(`TON618 web env check passed (${mode}${envFile ? ` from ${path.basename(envFile)}` : ''}).`);
