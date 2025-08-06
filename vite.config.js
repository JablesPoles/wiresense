// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },

  // ▼▼▼ ADICIONE ESTA SEÇÃO INTEIRA ▼▼▼
  server: {
    proxy: {
      // Qualquer requisição que comece com /api/influx...
      "/api/influx": {
        // ...será redirecionada para o seu servidor InfluxDB real
        target: "http://localhost:8086",
        // Necessário para que o InfluxDB aceite a requisição
        changeOrigin: true,
        // Remove o prefixo /api/influx antes de enviar a requisição
        rewrite: (path) => path.replace(/^\/api\/influx/, ""),
      },
    },
  },
  // ▲▲▲ FIM DA SEÇÃO ADICIONADA ▲▲▲

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Energy Monitor Dashboard",
        short_name: "EnergyDash",
        description:
          "Dashboard para monitoramento de consumo de energia em tempo real.",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.png",
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
});
