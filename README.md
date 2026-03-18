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

Requisitos operativos:

1. Activar Discord como provider en Supabase Auth.
2. Configurar redirects terminando en `/auth/callback`.
3. Desplegar `sync-discord-guilds` con sus secretos.
4. Mantener al bot publicando `bot_stats`, `bot_guilds`, `guild_metrics_daily` y tablas operativas del dashboard.

## Release

- Checklist de release: `docs/release-readiness-checklist.md`
- Checklist de QA manual: `docs/manual-qa-checklist.md`
- Deuda tecnica resuelta: `docs/technical-debt-resolved.md`
- Revision tecnica Codex: `docs/technical-review-codex.md`
- Verificacion final: `docs/final-verification-report.md`
