import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApi } from './server/api.mjs';

export default defineConfig({
  plugins: [react(), {
    name: 'cardsmith-share-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        if (!pathname.startsWith('/api/')) return next();
        if (await handleApi(req, res, pathname) === false) next();
      });
    },
  }],
  base: './',
});
