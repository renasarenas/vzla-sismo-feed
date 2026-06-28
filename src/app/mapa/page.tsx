import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const MapaSismos = nextDynamic(
  () => import('@/components/MapaSismos').then(m => m.MapaSismos),
  { ssr: false, loading: () => <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-gray-400">Cargando mapa…</div> }
)

export default function MapaPage() {
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapaSismos />
    </>
  )
}
