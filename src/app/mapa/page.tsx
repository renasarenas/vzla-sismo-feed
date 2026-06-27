import { MapaSismos } from '@/components/MapaSismos'

export const dynamic = 'force-dynamic'

export default function MapaPage() {
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapaSismos />
    </>
  )
}
