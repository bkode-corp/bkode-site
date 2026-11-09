// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

/**
 * Canonical origin resolution order:
 * 1. SITE_URL (set once the custom domain exists)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (injected by Vercel at build time)
 * 3. localhost for dev
 */
const resolveSite = () => {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:4321';
};

export default defineConfig({
  site: resolveSite(),
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/api/') && !page.endsWith('/ai') }),
  ],
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      PUBLIC_WHATSAPP_NUMBER: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_CONTACT_EMAIL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_PUBLISHABLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
