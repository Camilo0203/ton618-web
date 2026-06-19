# Runbook: pago Tebex completado pero PRO no activado

## Sintoma

El usuario completo el checkout de Tebex, pero no recibio el codigo o el
servidor sigue mostrando `Free`.

## Triage rapido

1. Solicitar ID de transaccion Tebex, ID del usuario de Discord, ID del servidor y hora del pago.
2. Confirmar que el paquete comprado es mensual, anual o de por vida.
3. Confirmar que la cuenta usada en Tebex corresponde al usuario de Discord.

## Cadena de verificacion

### 1. Tebex

- Confirmar que el pago esta completado y que el webhook fue entregado.
- Confirmar que el evento tiene una identidad de Discord valida.
- Confirmar que el package ID coincide con el mapa configurado en el bot.

### 2. Webhook del bot

- Revisar los logs de `ton618-bot` para el evento Tebex.
- Un `401` indica firma invalida; un challenge de Cloudflare indica que la
  solicitud nunca llego al bot.
- Reintentar el evento solo despues de corregir la causa. La idempotencia debe
  reutilizar el mismo codigo pendiente.

### 3. Entrega del codigo

- Si los mensajes directos estaban cerrados, pedir al usuario que los habilite.
- Reintentar la entrega y confirmar que no se crea un segundo codigo.
- Nunca publicar el codigo en logs o canales publicos.

### 4. Activacion

- El propietario del servidor ejecuta `/premium activate <codigo>`.
- Confirmar `/premium status`.
- Confirmar una fila Tebex activa en `guild_subscriptions`.
- Confirmar que `guild_effective_entitlements` refleja `effective_plan='pro'`.

## Recuperacion segura

Si el pago es valido pero la entrega automatica sigue fallando:

1. Recuperar el codigo pendiente con herramientas privadas de soporte.
2. No crear un entitlement duplicado.
3. Usar `/debug entitlements` solo como override documentado y temporal.
4. Registrar actor, motivo, transaccion y servidor afectado.

## Cierre

- Confirmar que bot y dashboard muestran el mismo plan.
- Registrar causa raiz y tiempo de recuperacion.
- Probar renovacion o reembolso si el incidente afecta eventos de ciclo de vida.
