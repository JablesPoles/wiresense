// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  base: '/wiresense/',
  server: {
    proxy: {
      "/api/influx": {
        target: "http://localhost:8086",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/influx/, ""),
      },
    },
  },
});
