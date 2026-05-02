# Billing Beta Launch Checklist

## Whop

- [ ] Crear producto `TON618 Bot Pro` en Whop.
- [ ] Crear plan `Pro Monthly` por `USD 9.99` (recurring).
- [ ] Crear plan `Pro Yearly` por `USD 99.99` (recurring).
- [ ] Crear plan `Lifetime` por `USD 299.99` (one-time).
- [ ] Crear plan `Donation` (one-time, variable).
- [ ] Guardar los `plan_id` reales para monthly, yearly, lifetime y donate.
- [ ] Configurar webhook con eventos `membership.went_active` y `membership.went_inactive`.
- [ ] Configurar URL de webhook: `https://<tu-proyecto>.supabase.co/functions/v1/whop-webhook`.

## Supabase

- [ ] Aplicar `supabase/migrations/20260406000000_create_billing_tables.sql`.
- [ ] Aplicar `supabase/migrations/20260406000001_create_rls_policies.sql`.
- [ ] Cargar secretos en Edge Functions: `WHOP_WEBHOOK_SECRET`, `BOT_API_KEY`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.
- [ ] Cargar IDs de planes en Edge Functions: `WHOP_PLAN_MONTHLY`, `WHOP_PLAN_YEARLY`, `WHOP_PLAN_LIFETIME`.
- [ ] Desplegar `sync-discord-guilds`.
- [ ] Desplegar `whop-webhook`.
- [ ] Desplegar `billing-guild-status`.
- [ ] Desplegar `billing-get-guilds`.
- [ ] Confirmar que `guild_subscriptions` responde para un guild de prueba.

## Web

- [ ] Ejecutar `npm run env:check -- --mode=production`.
- [ ] Ejecutar `npm run verify`.
- [ ] Ejecutar `npm run test:unit`.
- [ ] Ejecutar `npm run test:e2e:smoke`.
- [ ] Definir en `.env` de producción: `VITE_WHOP_PLAN_MONTHLY`, `VITE_WHOP_PLAN_YEARLY`, `VITE_WHOP_PLAN_LIFETIME`.

## Bot

- [ ] Definir `SUPABASE_URL`.
- [ ] Definir `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Definir `OWNER_ID`.
- [ ] Mantener `DASHBOARD_BRIDGE_INTERVAL_MS=60000` para beta.
- [ ] Ejecutar `npm run env:check -- --mode=production`.
- [ ] Ejecutar `npm test`.

## Smoke manual

- [ ] Login con Discord.
- [ ] Sync de guilds exitoso.
- [ ] Guild stale bloquea checkout hasta re-sync.
- [ ] Guild fresco con bot instalado abre checkout de Whop.
- [ ] Pago en test mode completa `membership.went_active`.
- [ ] `guild_subscriptions` queda `active` con `premium_enabled=true`.
- [ ] Dashboard muestra `Pro` en menos de `60s`.
- [ ] El bot refleja `Pro` consultando `billing-guild-status`.
- [ ] Cancelacion marca `cancel_at_period_end=true` y premium sigue activo hasta `ends_at`.
- [ ] Lifetime purchase activa premium permanente sin `ends_at`.
- [ ] Donation se registra sin activar premium.

## Go / no-go

- [ ] No hay fallos criticos abiertos.
- [ ] No hay Session Replay activo en dashboard.
- [ ] No hay metricas seed visibles en la landing.
- [ ] El soporte sabe usar el runbook de override y el runbook de incidentes.
