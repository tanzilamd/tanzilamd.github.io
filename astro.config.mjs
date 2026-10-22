import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tanzilahmed.tech',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
