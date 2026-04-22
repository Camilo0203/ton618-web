# Release Readiness Checklist

## Precondiciones

- [ ] `VITE_DISCORD_CLIENT_ID` configurado en el entorno de deploy.
- [ ] `VITE_SUPABASE_URL` configurado.
- [ ] `VITE_SUPABASE_ANON_KEY` configurado.
- [ ] `VITE_SITE_URL` apunta al dominio final.
- [ ] Redirects OAuth de Discord/Supabase incluyen `/auth/callback`.
- [ ] `VITE_SUPPORT_SERVER_URL`, `VITE_STATUS_URL`, `VITE_DOCS_URL` y `VITE_CONTACT_EMAIL` revisados.
- [ ] `npm run env:check -- --mode=production` pasa con el archivo/env real del deploy.

## Infra y datos

- [ ] Migraciones de Supabase aplicadas.
- [ ] Edge Function `sync-discord-guilds` desplegada.
- [ ] Edge Functions `billing-create-checkout`, `billing-webhook`, `billing-guild-status` y `billing-get-guilds` desplegadas.
- [ ] Secretos Supabase de billing cargados: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_LIFETIME`, `STRIPE_PRICE_DONATE`, `BOT_API_KEY`.
- [ ] Stripe webhook apunta al endpoint publicado y firma HMAC verificada.
- [ ] RLS validado para lectura del dashboard.
- [ ] El bot publica `bot_stats`.
- [ ] `bot_stats` publica datos `source='live'`; no se exponen seeds como metricas publicas.
- [ ] El bot publica `bot_guilds` y `guild_metrics_daily`.
- [ ] El bot consulta `billing-guild-status` con `BOT_API_KEY` y cachea resultados por 5 minutos.

## Calidad obligatoria

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `docs/final-verification-report.md` actualizado con resultados reales.

## Landing

- [ ] CTA de invite habilitado o degradado de forma intencional.
- [ ] Navbar, footer, hero y stats sin overflow en mobile.
- [ ] Skip link y focus states visibles con teclado.
- [ ] Cambio de idioma funcional.
- [ ] Metadatos, favicon, manifest y canonical correctos.
- [ ] Ruta comercial clara: valor, confianza, recursos y CTA final sin secciones huérfanas.

## Dashboard

- [ ] Login con Discord funcional.
- [ ] Callback `/auth/callback` funcional.
- [ ] Selector de guild funcional.
- [ ] Guilds con `last_synced_at` stale fuerzan re-sync y bloquean billing/writes.
- [ ] Drawer/sidebar usable en mobile.
- [ ] Formularios muestran labels, errores y estados de foco claros.
- [ ] Activity, inbox y analytics se pueden usar en mobile sin bloqueo.
- [ ] Estados vacios, errores y warnings muestran texto explicito, no solo color.
- [ ] Fallos parciales de `activity`, `metrics`, `ticket events` y `ticket macros` degradan con gracia sin tumbar el snapshot completo.
- [ ] Modulo Billing muestra plan, estado, renovacion/cancelacion y CTAs correctos.
- [ ] Checkout `Pro monthly`, `Pro yearly`, `Lifetime` y `Donate` crean sesion valida.
- [ ] `?checkout=success` confirma activacion y refleja `Pro` sin recargar manualmente el estado.

## Seguridad y observabilidad

- [ ] `sync-discord-guilds` rechaza `providerToken` que no pertenece al Discord user autenticado.
- [ ] Sentry Session Replay sigue desactivado en produccion.
- [ ] Existe alerta para `billing-webhook` fallido o sin eventos recientes.
- [ ] Existe alerta para cache premium lag > 5 min o desalineacion de estado.
- [ ] Existe alerta para fallos de creacion de tickets por encima del umbral definido.

## Legal y soporte

- [ ] `Terms`, `Privacy`, `Refund policy` y `Billing contact` publicados y navegables.
- [ ] Se valido el flujo de contacto para `Enterprise`.
- [ ] Se documento el proceso de override/manual comp para soporte.

## Aprobacion final

- [ ] QA manual completado con [manual-qa-checklist.md](/c:/Users/Camilo/Desktop/ton618-web/docs/manual-qa-checklist.md).
- [ ] Smoke E2E de beta pagada completado: login -> sync -> checkout -> activacion -> bridge -> cancelacion.
- [ ] Riesgos residuales documentados.
- [ ] Release owner da aprobacion de deploy.
