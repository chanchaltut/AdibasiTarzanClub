import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: isSsrBuild ? '.ssr' : 'dist',
    sourcemap: false,
    // The SSR bundle only feeds scripts/prerender.js; public/ is already in dist.
    copyPublicDir: !isSsrBuild,
  },
}))
