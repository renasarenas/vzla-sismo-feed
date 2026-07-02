import nextDynamic from 'next/dynamic'
import { SismoTrace } from '@/components/CardImage'

export const dynamic = 'force-dynamic'

const MapaSwitcher = nextDynamic(
  () => import('@/components/MapaSwitcher').then(m => m.MapaSwitcher),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-20 flex flex-col items-center justify-center gap-4">
        <SismoTrace animated className="w-40 h-12 text-crisis-red/50 dark:text-crisis-red/60" />
        <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Cargando mapa…</p>
      </div>
    )
  }
)

export default function MapaPage() {
  // Leaflet's CSS is self-hosted via an import in src/app/layout.tsx (bundled
  // from node_modules), not a CDN <link> — the app's CSP restricts style-src to
  // 'self', which would block a unpkg stylesheet.
  return <MapaSwitcher />
}
