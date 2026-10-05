import { defineConfig } from "vite";

export default defineConfig({
  base: "/admin/",

  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js"
    }
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});