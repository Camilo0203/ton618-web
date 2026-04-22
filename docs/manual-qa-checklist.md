# Manual QA Checklist

## Landing

- [ ] Navegar toda la landing con teclado solamente.
- [ ] Verificar skip link al cargar la pagina.
- [ ] Validar focus visible en navbar, selector de idioma, CTAs y footer.
- [ ] Confirmar que el hero no rompe layout en 320px, 768px y desktop.
- [ ] Confirmar que el poster del hero aparece si el video tarda o falla.
- [ ] Revisar seccion de estadisticas en modo live y en fallback.
- [ ] Revisar textos clave en ingles y espanol.
- [ ] Confirmar que la seccion de recursos/comercial refuerza docs, dashboard, soporte y CTA final sin bloques huérfanos.

## Dashboard auth

- [ ] Iniciar sesion con Discord.
- [ ] Probar redirect a `/auth/callback`.
- [ ] Confirmar estados de loading, error y empty state.
- [ ] Confirmar logout y cambio de cuenta.

## Dashboard shell

- [ ] Abrir drawer lateral en mobile.
- [ ] Cerrar drawer por boton y por backdrop.
- [ ] Usar skip link del dashboard.
- [ ] Cambiar de guild desde header y sidebar.
- [ ] Cambiar de tema.

## Formularios

- [ ] Recorrer campos con teclado.
- [ ] Confirmar labels visibles y errores asociados.
- [ ] Confirmar estados disabled coherentes.
- [ ] Confirmar reset y save request.
- [ ] Verificar mensajes de validacion sin depender solo del color.

## Inbox

- [ ] Buscar tickets.
- [ ] Aplicar y limpiar filtros.
- [ ] Navegar la lista con flechas arriba/abajo.
- [ ] Abrir ticket y ejecutar una accion segura.
- [ ] Confirmar feedback de accion pending/success/error.
- [ ] Revisar notas internas, macros y respuesta manual.

## Activity y analytics

- [ ] Filtrar timeline por fuente y severidad.
- [ ] Revisar chart de analytics en mobile con scroll horizontal.
- [ ] Confirmar legibilidad de cards y snapshots en pantallas estrechas.
- [ ] Simular ausencia de `guild_dashboard_events` o `guild_metrics_daily` y confirmar degradación parcial con mensaje accionable.

## Degradacion parcial

- [ ] Simular fallo de `guild_ticket_events` y confirmar que Inbox sigue usable.
- [ ] Simular fallo de `guild_ticket_macros` y confirmar que Inbox sigue usable.
- [ ] Confirmar que el snapshot no cae completo cuando falla una fuente opcional.
- [ ] Confirmar que el mensaje visible identifica la fuente degradada y orienta qué revisar.

## Billing

- [ ] Navegar a `/pricing` y confirmar que los tres planes muestran precio correcto (Pro Monthly $9.99, Pro Yearly $99.99, Lifetime $299.99).
- [ ] Con `STRIPE_SECRET_KEY` apuntando a una clave de test (`sk_test_...`), completar checkout de `Pro Monthly` y verificar que redirige a `?checkout=success`.
- [ ] Confirmar que `guild_subscriptions` queda con `status=active` y `premium_enabled=true`.
- [ ] Confirmar que el dashboard muestra el plan correcto sin recargar manualmente.
- [ ] El bot refleja `Pro` al consultar `billing-guild-status` (esperar hasta 5 minutos o invalidar cache manualmente).
- [ ] Verificar checkout de `Lifetime`: `premium_enabled=true`, `lifetime=true`, `ends_at=null`.
- [ ] Verificar checkout de `Donate`: registro en tabla pero `premium_enabled=false`.
- [ ] Cancelar una suscripcion de prueba: confirmar `cancel_at_period_end=true` y premium sigue activo hasta `ends_at`.
- [ ] Confirmar que intentar checkout con un guild que ya tiene `premium_enabled=true` retorna error claro.
- [ ] Confirmar que el boton de checkout requiere tener el bot instalado y guild fresco (no stale).
- [ ] Con `BOT_API_KEY` incorrecto, confirmar que `billing-guild-status` devuelve 401.

## Regresion final

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
