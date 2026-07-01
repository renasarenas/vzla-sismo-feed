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

// CSP: connect-src cubre Supabase (REST + Realtime wss) y Groq (llamado solo
// desde el servidor, pero se deja explícito por si se agrega fetch client-side).
// img-src usa https: amplio porque imagen_url viene de RSS externos arbitrarios.
// script-src necesita 'unsafe-inline': el App Router de Next.js hidrata usando
// <script> inline sin nonce (self.__next_f.push(...) para el payload de RSC/
// streaming) — sin esto el navegador bloquea esos scripts, React nunca
// hidrata y la página queda congelada en el fallback de loading.tsx para
// siempre. Endurecer esto requeriría CSP con nonce vía middleware; se deja
// unsafe-inline por ahora y se compensa con el resto de las directivas.
// style-src necesita 'unsafe-inline': framer-motion aplica animaciones via
// atributo style="" inline en cada render.
const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  // 'unsafe-eval' is required in development: Next.js webpack runtime uses eval() for
  // source maps and Fast Refresh. Without it, React cannot execute state updates in dev mode.
  // In production, Next.js uses static chunks — no eval() needed.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://earthquake.usgs.gov https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.arcgis.com https://*.arcgisonline.com",
  // Allow the ArcGIS WebScene iframe (arcgis.com) to be embedded
  "frame-src https://www.arcgis.com https://*.arcgis.com",
  "child-src https://www.arcgis.com https://*.arcgis.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
}

module.exports = withPWA(nextConfig)
