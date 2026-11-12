import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Byggetidspunktet kan vises som versionsnummer (AppVersion).
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registreres i src/shared/pwa/registerServiceWorker.ts.
      injectRegister: false,
      // Kun app-skallen caches. Dykkene gemmes offline af Firestores
      // persistentLocalCache (src/firebase/config.ts).
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Dykkerloggen',
        short_name: 'Dykkerloggen',
        description: 'Din personlige dykkerlogbog med kort, luftforbrug og gamle logbøger',
        lang: 'da',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a1631',
        theme_color: '#0a1631',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  // MapLibre opretter sin egen web worker — udelukkes fra prebundling
  // (se shared/map/configureMapLibre.ts).
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  worker: {
    format: 'es',
  },
})
