# i18n Consistency Fixes

## Componentes afectados

- `src/App.tsx`
- `src/pages/LandingPage.tsx`
- `src/components/Hero.tsx`
- `src/components/Navbar.tsx`
- `src/components/LanguageSelector.tsx`
- `src/components/DocsSection.tsx`
- `src/components/LiveStats.tsx`
- `src/dashboard/DashboardPage.tsx`
- `src/dashboard/AuthCallbackPage.tsx`
- `src/dashboard/components/AuthCard.tsx`
- `src/dashboard/authCallbackFlow.ts`
- `src/dashboard/api/auth.ts`
- `src/hooks/useBotStats.ts`
- `src/i18n.ts`

## Textos movidos a traduccion

- Fallback de carga de la app.
- Skip link principal de la landing.
- Labels utilitarios de navbar para Docs, Status y Support.
- Labels accesibles del selector de idioma y separacion consistente entre variante desktop/mobile.
- Copy completa y CTA de `DocsSection`.
- Estados top-level del dashboard: acceso, carga, error y empty state.
- Mensajes de degradacion visible de LiveStats para distinguir fallback por config vs red/entorno.
- Textos visibles y accesibles del callback OAuth.
- Textos visibles del `AuthCard`.
- Mensajes de estado y error expuestos por el callback/auth API que llegan a UI.

## Idiomas revisados

- `en`
- `es`

## Pendientes

- El dashboard sigue teniendo mucho copy interna de modulos y shell avanzada solo en espanol; esta pasada cubrio solo las superficies top-level visibles que rompian consistencia inmediata con landing/auth.
- `site.webmanifest` permanece como asset estatico y no cambia por idioma.
