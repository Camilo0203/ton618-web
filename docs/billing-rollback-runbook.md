# Tebex Billing Rollback Runbook

## Cuando usarlo

- El webhook deja de procesar eventos.
- Tebex cobra pero no entrega o activa PRO.
- Renovaciones o reembolsos afectan el servidor incorrecto.
- Bot y dashboard muestran entitlements distintos.

## Contencion

1. Desactivar temporalmente los CTA de compra o dirigirlos a soporte.
2. Pausar/restringir el webhook desde Tebex si esta generando efectos incorrectos.
3. No borrar codigos, eventos ni filas de `guild_subscriptions`.
4. Guardar IDs de transaccion, evento, usuario y servidor afectados.

## Diagnostico

1. Confirmar DNS y que Cloudflare no desafia `/webhook-tebex`.
2. Revisar firma, event type, package ID e identidad de Discord.
3. Confirmar que los reintentos reutilizan el efecto/codigo idempotente.
4. Comparar MongoDB, `guild_subscriptions` y `guild_effective_entitlements`.

## Reapertura

1. Ejecutar tests del webhook y de activacion.
2. Completar una compra controlada de extremo a extremo.
3. Repetir el evento y verificar idempotencia.
4. Probar una renovacion y un reembolso.
5. Rehabilitar los CTA solo cuando bot y dashboard coincidan.
