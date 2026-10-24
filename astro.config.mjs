import { defineConfig } from 'astro/config';
import socialCards from './integrations/social-cards.mjs';

export default defineConfig({
  site: 'https://tanzilahmed.tech',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [socialCards()],
});
