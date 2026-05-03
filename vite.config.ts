import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  appleTouchIconPath,
  defaultMetaTitle,
  faviconPath,
  manifestPath,
  normalizeSiteUrl,
} from './src/siteMetadata';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL);
  const isProd = mode === 'production';

  return {
    server: {
      allowedHosts: [
        '.squareweb.app',
        'ton618-web.squareweb.app'
      ]
    },
    test: {
      setupFiles: ['./src/test-setup.ts'],
      include: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'supabase/functions/**/*.test.ts',
      ],
      exclude: ['src/tests/**', 'tests/**', 'node_modules/**'],
    },
    plugins: [
      react(),
      {
        name: 'ton618-seo-assets',
        transformIndexHtml(html) {
          return html
            .replaceAll('__DEFAULT_META_TITLE__', defaultMetaTitle)
            .replaceAll('__FAVICON_PATH__', faviconPath)
            .replaceAll('__APPLE_TOUCH_ICON_PATH__', appleTouchIconPath)
            .replaceAll('__MANIFEST_PATH__', manifestPath);
        },
        generateBundle() {
          const sitemapPaths = ['/', '/terms', '/privacy', '/cookies'];
          const sitemap = siteUrl
            ? `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map((path) => {
    const location = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
    const priority = path === '/' ? '1.0' : '0.7';

    return `  <url>
    <loc>${location}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`
            : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>
`;
          const robots = `User-agent: *
Allow: /

${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : '# Set VITE_SITE_URL to emit the production sitemap URL.'}
`;

          this.emitFile({
            type: 'asset',
            fileName: 'sitemap.xml',
            source: sitemap,
          });

          this.emitFile({
            type: 'asset',
            fileName: 'robots.txt',
            source: robots,
          });
        },
      },
    ],
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      include: ['lucide-react'],
    },
    build: {
      chunkSizeWarningLimit: 500,
      sourcemap: isProd ? false : true,
      minify: 'terser',
      target: 'es2020',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('src/dashboard/')) {
                return 'dashboard-app';
              }
              return undefined;
            }

            if (
              id.includes('react-router') ||
              id.includes('react-dom') ||
              id.includes('\\node_modules\\react\\') ||
              id.includes('/node_modules/react/')
            ) {
              return 'react-vendor';
            }

            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }

            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }

            if (
              id.includes('@tanstack/react-query') ||
              id.includes('react-hook-form') ||
              id.includes('@hookform/resolvers') ||
              id.includes('zod')
            ) {
              return 'dashboard-vendor';
            }

            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }

            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }

            if (id.includes('@sentry')) {
              return 'sentry-vendor';
            }

            return undefined;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.');
            const ext = info?.[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|ttf|otf|eot/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
    },
  };
});
