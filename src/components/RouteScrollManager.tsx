import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export default function RouteScrollManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    const route = location.pathname + location.search + location.hash;

    // Breadcrumbs for better Sentry triage
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: route,
        level: 'info',
      });
      Sentry.setTag('route', location.pathname);
      Sentry.setContext('navigation', {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    }

    if (location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search, location.hash]);

  return null;
}
