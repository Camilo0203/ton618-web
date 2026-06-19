import { Helmet } from 'react-helmet-async';
import { config } from '../config';

/**
 * Security Headers Component
 * Implements Content Security Policy and other security headers
 * to protect against XSS, clickjacking, and other web attacks
 */
export function SecurityHeaders() {
  // Build CSP directives
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://discord.com https://api.discord.gg https://headless.tebex.io https://checkout.tebex.io https://store.ton618bot.xyz",
    "frame-src https://checkout.tebex.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  return (
    <Helmet>
      {/* Content Security Policy */}
      <meta httpEquiv="Content-Security-Policy" content={cspDirectives} />
      
      {/* Prevent MIME type sniffing */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Referrer Policy */}
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Permissions Policy - restrict browser features */}
      <meta 
        httpEquiv="Permissions-Policy" 
        content="accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" 
      />
      
      {/* DNS Prefetch Control */}
      <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
      
      {/* HSTS - only in production */}
      {config.siteUrl?.startsWith('https://') && (
        <meta 
          httpEquiv="Strict-Transport-Security" 
          content="max-age=31536000; includeSubDomains; preload" 
        />
      )}
    </Helmet>
  );
}

export default SecurityHeaders;
