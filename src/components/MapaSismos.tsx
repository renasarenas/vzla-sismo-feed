'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@supabase/supabase-js'
import type L from 'leaflet'

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

// react-leaflet pulls in leaflet at module load, which touches `window` and breaks SSR.
// We lazy-load each component with ssr:false so the chain never executes on the server.
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(m => m.GeoJSON), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false })

type Sismo = {
  id: string
  titulo: string
  url: string
  factcheck_confianza: number
  lat: number
  lng: number
}

function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const update = () => setDark(root.classList.contains('dark'))
    update()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          update()
          break
        }
      }
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return dark
}

export function MapaSismos() {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
  const [sismos, setSismos] = useState<Sismo[]>([])
  const dark = useDarkMode()

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
      .eq('factcheck_status', 'aprobado')
      .not('lat', 'is', null)
      .limit(100)
      .then(({ data }) => { if (data) setSismos(data as Sismo[]) })

    fetch('/data/venezuela.geojson')
      .then(r => r.json())
      .then(setOutline)
      .catch(err => console.error('[mapa] Error cargando contorno:', err))
  }, [supabase])

  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-6">
        <p className="text-eyebrow uppercase text-crisis-red mb-3">Mapa sísmico</p>
        <h1 className="font-serif text-display text-ink dark:text-ink-dark">
          Eventos registrados por fuentes oficiales
        </h1>
        <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose">
          Ubicación geográfica de los sismos reportados. {sismos.length} registros disponibles.
        </p>
      </header>
      <div style={{ height: '70vh' }} className="overflow-hidden border border-rule-strong/30 dark:border-rule-dark">
        <MapContainer
          center={[10.48, -66.90]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution={dark ? DARK_TILES.attribution : LIGHT_TILES.attribution}
            url={dark ? DARK_TILES.url : LIGHT_TILES.url}
          />
          {outline && (
            <GeoJSON
              data={outline}
              style={{
                color: '#CF1020',
                weight: 2,
                fillColor: '#CF1020',
                fillOpacity: 0.04,
              }}
            />
          )}
          {sismos.map(s => {
            const mag = parseMag(s.titulo)
            return (
              <Circle
                key={`heat-${s.id}`}
                center={[s.lat, s.lng]}
                radius={Math.max(15000, mag * 15000)}
                pathOptions={{
                  color: magColor(mag),
                  fillColor: magColor(mag),
                  fillOpacity: 0.25,
                  weight: 1,
                }}
              />
            )
          })}
          {sismos.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup>
                <p className="font-medium text-sm">{s.titulo}</p>
                <p className="text-xs text-gray-500">{s.factcheck_confianza}% confianza</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-crisis-blue hover:underline">
                  Ver más
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </main>
  )
}
