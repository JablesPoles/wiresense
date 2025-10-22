// Importa a função para definir a configuração do Vite
import { defineConfig } from "vite";

// Plugin oficial do React para Vite
import react from "@vitejs/plugin-react";

// Plugin para suporte a Progressive Web App
import { VitePWA } from "vite-plugin-pwa";

// Utilitário do Node para resolver caminhos
import path from "path";

export default defineConfig({
  // Configuração de resolução de módulos
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // '@' aponta para a pasta src
    },
  },

  // Plugins usados pelo Vite
  plugins: [
    react(), // Plugin React
    VitePWA({
      registerType: "autoUpdate", // Atualiza o service worker automaticamente
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // Arquivos que serão cacheados
      },
      manifest: {
        name: "Energy Monitor Dashboard", // Nome completo do PWA
        short_name: "Wiresense", // Nome curto
        description:
          "Dashboard para monitoramento de consumo de energia em tempo real.", // Descrição do PWA
        theme_color: "#111827", // Cor do tema do navegador
        background_color: "#111827", // Cor de fundo da splash screen
        display: "standalone", // Faz o PWA abrir como app independente
        scope: "/", // Escopo do PWA
        start_url: "/wiresense", // URL inicial quando aberto como PWA
        id: "/", // ID do PWA
        icons: [
          {
            src: "/icon-192x192.png", // Ícone menor
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512x512.png", // Ícone maior
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  // Configurações de build
  build: {
    sourcemap:true, // Gera source maps para debugging
  },

  // Configuração do servidor de desenvolvimento
  server: {
    proxy: {
      // Proxy para chamadas à API do InfluxDB
      "/api/influx": {
        target: "http://localhost:8086", // Endereço real do Influx
        changeOrigin: true, // Altera o host de origem da requisição
        rewrite: (path) => path.replace(/^\/api\/influx/, ""), // Remove prefixo da URL
      },
    },
  },
});
