# ton618-web

Frontend de landing publica y dashboard operativo para TON618, construido con Vite, React, TypeScript, Tailwind, React Query y Supabase.

## Estado actual

- Landing comercial en `/` con CTA hacia invite, dashboard, docs y soporte.
- Dashboard operativo en `/dashboard` con auth via Supabase + Discord.
- Callback OAuth endurecido en `/auth/callback`.
- Snapshot del dashboard con degradacion parcial para `activity`, `metrics`, `ticket events` y `ticket macros`.

## Scripts

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run preview`

## Entorno

Variables criticas:

- `VITE_DISCORD_CLIENT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

Variables recomendadas:

- `VITE_SUPPORT_SERVER_URL`
- `VITE_DOCS_URL`
- `VITE_STATUS_URL`
- `VITE_CONTACT_EMAIL`
- `VITE_GITHUB_URL`
- `VITE_TWITTER_URL`
- `VITE_DASHBOARD_URL`

Usa `.env.example` como base local.

## Setup local

1. Copia `.env.example` a `.env`.
2. Completa variables.
3. Ejecuta `npm install`.
4. Inicia con `npm run dev`.
5. Abre `http://localhost:5173`.

## Supabase y contratos

Migraciones relevantes:

- `supabase/migrations/20260305063924_create_bot_stats_table.sql`
- `supabase/migrations/20260313183000_create_dashboard_tables.sql`
- `supabase/migrations/20260313193000_expand_dashboard_control_plane.sql`
- `supabase/migrations/20260313220000_add_ticket_workspace.sql`

Edge Function requerida:

- `supabase/functions/sync-discord-guilds`

## Configuracion de OAuth (Discord + Supabase)

El login del dashboard esta delegado a Supabase, el cual se conecta con Discord. Para que el callback hacia `/auth/callback` funcione correctamente:

1. **En Discord Developer Portal:** 
   - Ve a tu aplicacion > *OAuth2*.
   - Añade el *Callback URL* que te proporciona Supabase (ej: `https://<tu-proyecto>.supabase.co/auth/v1/callback`).
2. **En Supabase:** 
   - Ve a *Authentication* > *Providers* y activa **Discord**. Ingresa tu `Client ID` y `Client Secret`.
   - Ve a *Authentication* > *URL Configuration* y añade tu URL local (`http://localhost:5173/**`) o tu URL de produccion a las **Redirect URLs**.
3. **Edge Functions:** 
   - Despliega la funcion `sync-discord-guilds` configurando previamente el `DISCORD_BOT_TOKEN` en los secretos de Supabase.

Finalmente, manten al bot publicando latidos constantes hacia `bot_stats`, `bot_guilds`, `guild_metrics_daily` y las tablas operativas del dashboard para que el panel luzca actualizado.

## Release

- Checklist de release: `docs/release-readiness-checklist.md`
- Checklist de QA manual: `docs/manual-qa-checklist.md`
- Deuda tecnica resuelta: `docs/technical-debt-resolved.md`
- Revision tecnica Codex: `docs/technical-review-codex.md`
- Verificacion final: `docs/final-verification-report.md`
