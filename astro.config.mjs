import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://wikinb.kainnne.com',
  base: '/',
  integrations: [tailwind()],
  build: {
    // 內嵌樣式，避免部署後舊 HTML 指到已換 hash 的 .css 而整頁變素顏
    inlineStylesheets: 'always',
  },
  devToolbar: {
    enabled: false,
  },
});
