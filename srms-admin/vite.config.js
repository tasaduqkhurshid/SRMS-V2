import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    cacheDir: path.resolve('/tmp/vite-cache-srms-admin'),
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [`.${process.env.ROOT_DOMAIN || 'sms.local'}`],
    watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === 'true' },
    port: 5173,
    proxy: { '/api': { target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000', changeOrigin: false } },
  },
});
