import { defineConfig } from "vite";

export default defineConfig({
  base: "/",

  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js"
    }
  },

  server: {
    port: 5173
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});