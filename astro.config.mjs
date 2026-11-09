import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Intended production origin. Used for canonical URLs and the sitemap.
// If you deploy to a staging URL, override with a noindex robots.txt on that host.
// PREVIEW_ALLOWED_HOSTS (comma-separated) permits the Arena preview proxy host
// for local production previews — no secrets are involved.
const previewAllowedHosts = (process.env.PREVIEW_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  site: 'https://commercial.obsidixz.pp.ua',
  server: {
    allowedHosts: previewAllowedHosts,
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.8,
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
