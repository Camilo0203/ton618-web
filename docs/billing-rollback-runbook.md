# Billing Rollback Runbook

## Cuando usarlo

Usa este rollback si ocurre cualquiera de estos casos:

- `billing-webhook` deja de procesar eventos.
- Checkout cobra pero no activa `Pro`.
- El dashboard permite upgrades sobre guilds incorrectos.
- El bot no refleja el estado premium correcto por varios minutos.

## Objetivo

Detener nuevas compras sin borrar historial, conservar auditoria y volver a un estado seguro mientras investigamos.

## Pasos inmediatos

1. Desactivar el CTA comercial publico o redirigirlo temporalmente al soporte.
2. Pausar temporalmente el webhook en Stripe si es necesario.
3. Verificar que no existan campañas, anuncios o enlaces externos apuntando directo al checkout.
4. Confirmar si el problema es solo UI, solo webhook o proyeccion bot/dashboard.

## Contencion tecnica

1. Revisar logs de `billing-create-checkout` y `billing-webhook`.
2. Si el problema es en webhook, verificar firma HMAC o pausar el reenvio automatico hasta corregir.
3. Si el problema es de proyeccion al bot, verificar cache TTL o invalidar cache manualmente.
4. Si una compra entro y no proyecto el plan, verificar `guild_subscriptions` y `premium_enabled`.

## Estado de datos esperado

- `webhook_events` conserva el evento recibido con `event_hash` para idempotencia.
- `guild_subscriptions` conserva el estado real conocido.
- Nunca borrar filas para "arreglar" el problema sin exportar evidencia antes.

## Comunicacion

1. Avisar al canal interno de ops con hora exacta de inicio del incidente.
2. Si hubo usuarios afectados, compartir ETA y metodo de soporte.
3. Si hubo cobros, ofrecer compensacion manual o extension de periodo antes de reabrir ventas.

## Reapertura

Antes de volver a abrir checkout:

1. Reprocesar el flujo completo en Stripe test mode.
2. Validar `guild_subscriptions` y proyeccion al bot via `billing-guild-status`.
3. Revisar el runbook `runbook-payment-activated-but-pro-missing.md`.
4. Rehabilitar CTA publico de forma gradual.
