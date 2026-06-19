# Manual QA Checklist

## Landing y dashboard

- [ ] Navegar con teclado y verificar foco visible.
- [ ] Probar 320px, 768px y escritorio.
- [ ] Confirmar textos clave en ingles y espanol.
- [ ] Iniciar y cerrar sesion con Discord.
- [ ] Probar `/auth/callback`, selector de servidor y estados vacios/error.
- [ ] Simular fallos de fuentes opcionales y confirmar degradacion parcial.

## Compra Tebex

- [ ] `/pricing` abre la tienda oficial de Tebex.
- [ ] Verificar precios actuales: mensual `$7.99`, anual `$59.99`, lifetime `$79.99`.
- [ ] Completar una compra controlada con una cuenta real de Discord de prueba.
- [ ] Confirmar que el bot envia exactamente un codigo por DM.
- [ ] Ejecutar `/premium activate <codigo>` como propietario del servidor.
- [ ] Confirmar `/premium status` y el dashboard sin crear un segundo entitlement.
- [ ] Repetir el webhook y confirmar idempotencia.
- [ ] Probar DMs cerrados, reintentar y confirmar que se reutiliza el codigo.
- [ ] Probar renovacion mensual o anual.
- [ ] Probar reembolso y confirmar revocacion del entitlement correcto.
- [ ] Probar lifetime y confirmar que no tiene expiracion.

## Infraestructura publica

- [ ] Dominio raiz, `www`, `store` y `status` resuelven.
- [ ] El webhook Tebex tiene hostname publico y no recibe challenge de Cloudflare.
- [ ] `curl http://127.0.0.1:3000` responde en la VPS.
- [ ] `curl http://127.0.0.1:3001` responde en la VPS.
- [ ] `/api/bot-health` devuelve un payload sanitizado.
- [ ] PM2 no contiene un proceso separado `ton618-music`.

## Regresion automatizada

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `git diff --check`
