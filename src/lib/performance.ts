import * as Sentry from '@sentry/react';

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function reportWebVitals(metric: WebVitalsMetric) {
  const rating = getRating(metric.name, metric.value);

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating,
      id: metric.id,
    });
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.metrics.distribution(metric.name, metric.value, {
      unit: metric.name === 'CLS' ? 'ratio' : 'millisecond',
    });
  }
}

export function measureDashboardLoad(guildId: string, startTime: number) {
  const duration = performance.now() - startTime;

  if (import.meta.env.DEV) {
    console.log(`[Performance] Dashboard load for ${guildId}:`, duration.toFixed(2), 'ms');
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.metrics.distribution('dashboard.load', duration, {
      unit: 'millisecond',
    });
  }

  return duration;
}

export function measureSnapshotFetch(guildId: string, startTime: number) {
  const duration = performance.now() - startTime;

  if (import.meta.env.DEV) {
    console.log(`[Performance] Snapshot fetch for ${guildId}:`, duration.toFixed(2), 'ms');
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.metrics.distribution('dashboard.snapshot.fetch', duration, {
      unit: 'millisecond',
    });
  }

  return duration;
}

export function trackModuleNavigation(from: string, to: string) {
  if (import.meta.env.DEV) {
    console.log(`[Navigation] ${from} → ${to}`);
  }

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Dashboard module: ${from} → ${to}`,
      level: 'info',
    });
  }
}

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const metrics = {
              dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcp: navEntry.connectEnd - navEntry.connectStart,
              request: navEntry.responseStart - navEntry.requestStart,
              response: navEntry.responseEnd - navEntry.responseStart,
              dom: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              load: navEntry.loadEventEnd - navEntry.loadEventStart,
            };

            if (import.meta.env.DEV) {
              console.log('[Performance] Navigation timing:', metrics);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Performance] Failed to initialize PerformanceObserver:', error);
      }
    }
  }
}
