import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // 1. Importe o plugin
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  plugins: [
    react(),
    // 2. Adicione e configure o plugin PWA
    VitePWA({
      // registerType: 'autoUpdate' faz com que o service worker se atualize automaticamente
      // quando uma nova versão do app é publicada.
      registerType: "autoUpdate",

      // 'manifest' é onde você define as informações do seu app.
      manifest: {
        name: "Energy Monitor Dashboard",
        short_name: "EnergyDash",
        description:
          "Dashboard para monitoramento de consumo de energia em tempo real.",
        theme_color: "#111827", // A cor de fundo do seu app (bg-gray-900)
        background_color: "#111827",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192x192.png", // Caminho para o ícone na pasta 'public'
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png", // Caminho para o ícone na pasta 'public'
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
