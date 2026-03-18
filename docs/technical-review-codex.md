# Technical Review Codex

Fecha: 2026-03-18

## Resumen ejecutivo

El repositorio llega a esta pasada con una base tecnica estable: `typecheck`, `lint`, `test` y `build` pasan, la separacion entre landing, dashboard y callback ya existe, y la capa de snapshot incorpora degradacion parcial para datasets secundarios. La recomendacion final es **listo para QA**.

No rehice arquitectura porque no hacia falta para un release candidate. La mayor parte del trabajo seguro estuvo en endurecimiento de experiencia y documentacion: corregi navegacion interna de CTAs del dashboard para evitar recargas completas innecesarias, actualice el `README` con rutas de repo validas y deje los reportes de release alineados con el estado real de esta revision.

## Fortalezas encontradas

- La estructura general es coherente: `src/pages` para rutas publicas, `src/dashboard` para dominio operativo y `src/components` para bloques de landing.
- `src/dashboard/api/*` ya esta separada por dominio y usa timeout/hardening centralizado en `src/dashboard/api/shared.ts`.
- El flujo OAuth esta razonablemente encapsulado entre `src/dashboard/AuthCallbackPage.tsx` y `src/dashboard/authCallbackFlow.ts`.
- El dashboard degrada con gracia para `activity`, `metrics`, `ticket_events` y `ticket_macros` sin tumbar el snapshot completo.
- Hay cobertura de tests unitarios en validacion y utilidades del dashboard.
- La landing ya cubre SEO tecnico basico, skip link, metadatos y rutas de conversion principales.

## Problemas encontrados

### Alto

- Los CTA internos hacia `/dashboard` en la landing usaban enlaces `href` en varios puntos, provocando navegacion con recarga completa en lugar de transicion SPA. Esto no rompia el flujo, pero si empeoraba UX, percepcion de fluidez y trazabilidad de estado en release demos.

### Medio

- `README.md` apuntaba a rutas absolutas locales en lugar de rutas relativas de repositorio, lo que rompe la utilidad del documento fuera de la maquina donde fue generado.
- `docs/final-verification-report.md` describia una corrida anterior y ya no representaba el estado real de esta pasada.
- Hay archivos grandes con bastante responsabilidad, especialmente `src/dashboard/DashboardPage.tsx` y `src/dashboard/components/DashboardShell.tsx`. No bloquean release, pero merecen futura segmentacion.

### Bajo

- Persisten warnings no bloqueantes de toolchain durante `test` y `build`:
  - advertencias de Vite sobre opciones de `esbuild` deprecadas desde el plugin React Babel
  - aviso de `Browserslist` por `caniuse-lite` desactualizado
- Existen exports aparentemente no consumidos (`useExchangeDashboardCode`, `consumeDashboardAuthIntent`, `isDashboardExternal`). No impactan release, pero suman ruido de mantenimiento.

## Bugs corregidos

- Converti los CTA internos hacia `/dashboard` a navegacion SPA en:
  - `src/components/Hero.tsx`
  - `src/components/FinalCTA.tsx`
  - `src/components/DocsSection.tsx`
  - `src/components/Footer.tsx`
- Normalice el texto del fallback de carga en `src/App.tsx` para evitar una cadena inconsistente en la pantalla de suspense.
- Reescribi `README.md` para eliminar rutas absolutas locales y dejar documentacion de repo valida.
- Actualice la documentacion de verificacion final para reflejar exactamente esta corrida.

## Deuda tecnica restante

- Extraer parte de la logica de cabecera y sidebar de `src/dashboard/components/DashboardShell.tsx` en subcomponentes con contratos mas pequenos.
- Reducir responsabilidad de `src/dashboard/DashboardPage.tsx`, especialmente en resolucion de estados de shell y wiring de mutaciones.
- Ampliar cobertura de tests para:
  - flujo OAuth callback
  - seleccion de guild
  - degradacion parcial visible en dashboard
  - mutaciones de configuracion e inbox
- Revisar y limpiar exports publicos no usados del dominio dashboard.
- Atender warnings de toolchain de Vite/Browserslist antes de staging final.

## Riesgos residuales

- No se ejecuto QA manual de navegador real en esta pasada, asi que siguen pendientes validaciones humanas de responsive, focus, auth real y mutaciones reales contra entorno conectado.
- La degradacion parcial esta bien resuelta para datasets opcionales, pero si fallan datasets criticos como `guild_configs`, `guild_inventory_snapshots` o `guild_ticket_inbox`, el snapshot sigue cayendo completo por diseno.
- El callback OAuth esta razonablemente robusto, pero conviene validar manualmente casos reales de `provider_token` ausente, expiracion de codigo y repeticion de login con distintos navegadores.

## Recomendacion final

**Listo para QA**

La base es suficientemente estable para continuar con QA manual y pruebas contra entorno real. No lo marcaria como "listo para staging" sin pasar primero la checklist manual de auth, callback, responsive y datasets degradados en navegador real.
