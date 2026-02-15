import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/DivorceDoc/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon-192.svg",
        "icon-512.svg",
        "apple-touch-icon.svg",
        "pdf.worker.min.mjs",
      ],
      manifest: {
        name: "DivorceDoc — Simulation du Divorce",
        short_name: "DivorceDoc",
        description:
          "Simulez votre prestation compensatoire, pension alimentaire et liquidation. Aucune donnée conservée.",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        orientation: "portrait",
        scope: "/DivorceDoc/",
        start_url: "/DivorceDoc/",
        lang: "fr",
        categories: ["finance", "utilities"],
        icons: [
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.svg",
            sizes: "180x180",
            type: "image/svg+xml",
            purpose: "apple touch icon",
          },
        ],
        screenshots: [
          {
            src: "/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            form_factor: "narrow",
            label: "DivorceDoc - Accueil",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,mjs}"],
        navigateFallback: "/DivorceDoc/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tessdata\.projectnaptha\.com\/.*$/,
            handler: "CacheFirst",
            options: {
              cacheName: "tesseract-languages",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
});
