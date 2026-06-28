import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const MapaSismos = nextDynamic(
  () => import('@/components/MapaSismos').then(m => m.MapaSismos),
  { ssr: false, loading: () => <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-14 text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Cargando mapa…</div> }
)

export default function MapaPage() {
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapaSismos />
    </>
  )
}
