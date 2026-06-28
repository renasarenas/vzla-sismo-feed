'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@supabase/supabase-js'
import type L from 'leaflet'

// react-leaflet pulls in leaflet at module load, which touches `window` and breaks SSR.
// We lazy-load each component with ssr:false so the chain never executes on the server.
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

type Sismo = {
  id: string
  titulo: string
  url: string
  factcheck_confianza: number
  lat: number
  lng: number
}

export function MapaSismos() {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
  const [sismos, setSismos] = useState<Sismo[]>([])

  useEffect(() => {
    // Leaflet touches `window` at import time, so it must be loaded client-side only.
    // The `import type` above is stripped at build time and keeps TS happy.
    import('leaflet').then((mod) => {
      const L = mod.default
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
    })

    supabase
      .from('noticias')
      .select('id, titulo, url, factcheck_confianza, lat, lng')
      .eq('fuente_tipo', 'oficial')
      .not('lat', 'is', null)
      .limit(100)
      .then(({ data }) => { if (data) setSismos(data as Sismo[]) })
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
        Mapa de sismos registrados
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {sismos.length} eventos registrados
      </p>
      <div style={{ height: '70vh' }} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={[10.48, -66.90]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {sismos.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup>
                <p className="font-medium text-sm">{s.titulo}</p>
                <p className="text-xs text-gray-500">{s.factcheck_confianza}% confianza</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                  Ver más →
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
