// Astro konfiguracija. Specifične podatke o ustanovi NE upisivati ovdje — sve je u src/config/site.ts.
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site.ts';

export default defineConfig({
  // Za objavu na podadresi (npr. GitHub Pages: korisnik.github.io/repozitorij) build dobiva
  // SITE_URL i BASE_PATH iz okruženja (.github/workflows/deploy.yml). Lokalno ostaje korijen "/".
  site: process.env.SITE_URL || site.url,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  // Fontovi se preuzimaju s Google Fonts pri buildu i poslužuju s vlastite domene (bez prijenosa IP adresa Googleu).
  // latin-ext je eksplicitno uključen radi č, ć, đ, š, ž.
  fonts: [
    {
      provider: fontProviders.google(),
      name: site.fonts.heading,
      cssVariable: '--astro-font-heading',
      weights: [600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: site.fonts.body,
      cssVariable: '--astro-font-body',
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
