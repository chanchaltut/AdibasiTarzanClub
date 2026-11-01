import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Serve admin.html for every /admin/... address (the admin panel is its own small app). */
const adminRoutes = () => {
  const rewrite = (req, res, next) => {
    if (req.url && /^\/admin(\/[^.]*)?(\?.*)?$/.test(req.url)) req.url = '/admin.html';
    next();
  };
  return {
    name: 'atc-admin-routes',
    configureServer: (server) => { server.middlewares.use(rewrite); },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite); },
  };
};

export default defineConfig(({ isSsrBuild, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), adminRoutes()],
    server: {
      port: 3000,
      open: true,
      // With no VITE_API_URL, "/api" is forwarded to the server running locally.
      proxy: env.VITE_API_URL ? undefined : { '/api': { target: env.DEV_API_TARGET || 'http://localhost:4000', changeOrigin: false } },
    },
    preview: {
      port: 4173,
      proxy: env.VITE_API_URL ? undefined : { '/api': { target: env.DEV_API_TARGET || 'http://localhost:4000', changeOrigin: false } },
    },
    build: {
      outDir: isSsrBuild ? '.ssr' : 'dist',
      sourcemap: false,
      // The SSR bundle only feeds scripts/prerender.js; public/ is already in dist.
      copyPublicDir: !isSsrBuild,
      rollupOptions: isSsrBuild ? undefined : {
        input: { main: 'index.html', admin: 'admin.html' },
      },
    },
  };
});
