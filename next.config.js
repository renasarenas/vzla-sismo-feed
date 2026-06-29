// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA solo en prod
  runtimeCaching: [
    {
      // Feed API: muestra lo cacheado mientras se actualiza en segundo plano.
      urlPattern: /^https?:\/\/.*\/api\/feed/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-feed',
        expiration: { maxEntries: 30, maxAgeSeconds: 60 },
      },
    },
    {
      // Stats API: misma estrategia que el feed.
      urlPattern: /^https?:\/\/.*\/api\/stats/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-stats',
        expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
      },
    },
    {
      // Páginas HTML para navegación offline.
      urlPattern: /^https?:\/\/.*\/(mapa|stats|\/)?$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages',
        expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
      },
    },
    {
      // Assets estáticos generados por Next.js.
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
      },
    },
    {
      // Imágenes, fuentes e iconos.
      urlPattern: /^https?:\/\/.*\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
      },
    },
    {
      // Tiles de mapas (OpenStreetMap, CartoDB) para que el mapa funcione offline.
      urlPattern: /^https:\/\/.*\.(tile\.openstreetmap\.org|basemaps\.cartocdn\.com)\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 604800 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
