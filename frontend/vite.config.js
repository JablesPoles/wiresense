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
      manifest: {
        name: "Energy Monitor Dashboard",
        short_name: "Wiresense",
        description:
          "Dashboard para monitoramento de consumo de energia em tempo real.",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        scope: "/", 
        start_url: "/wiresense", 
        id: "/",
        icons: [
          {
            src: "/icon-192x192.png", 
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap:true,
  },
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
