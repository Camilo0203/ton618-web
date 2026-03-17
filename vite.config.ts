import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '');
  const socialImageUrl = siteUrl ? `${siteUrl}/social-preview.png` : '/social-preview.png';

  return {
    plugins: [
      react(),
      {
        name: 'ton618-seo-assets',
        transformIndexHtml(html) {
          return html
            .replaceAll('__SITE_URL__', siteUrl)
            .replaceAll('__SOCIAL_IMAGE_URL__', socialImageUrl);
        },
        generateBundle() {
          const sitemap = siteUrl
            ? `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
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
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
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
              return 'ui-vendor';
            }

            return undefined;
          },
        },
      },
    },
  };
});
