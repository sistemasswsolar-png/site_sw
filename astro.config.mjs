import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://swsolar.com.br',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
