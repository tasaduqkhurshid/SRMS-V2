import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: [`.${process.env.ROOT_DOMAIN || 'sms.local'}`],
    watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === 'true' },
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
