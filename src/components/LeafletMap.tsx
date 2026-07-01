'use client'

// This whole module is loaded once via next/dynamic({ ssr: false }) from MapaSismos.
// Importing react-leaflet's pieces normally (not each behind its own dynamic()) lets
// the Leaflet map mount as a single atomic React tree — staggering them as separate
// dynamic chunks left markers half-initialized when React StrictMode's mount→unmount→
// remount cycle hit mid-load, crashing Leaflet's internal removeIcon.
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle } from 'react-leaflet'
import L from 'leaflet'

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

export type Sismo = {
  id: string
  titulo: string
  url: string
  factcheck_confianza: number
  tsunami?: boolean
  lat: number
  lng: number
}

function parseMag(titulo: string): number {
  const match = titulo.match(/M(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 4
}

function magColor(mag: number): string {
  if (mag >= 6) return '#DC2626'
  if (mag >= 5) return '#EA580C'
  if (mag >= 4) return '#CA8A04'
  return '#16A34A'
}

function pulseIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="relative flex h-4 w-4">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background:${color}"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white" style="background:${color}"></span>
    </span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

let defaultIconReady = false
function ensureDefaultIcon() {
  if (defaultIconReady) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
  defaultIconReady = true
}

type Props = {
  sismos: Sismo[]
  outline: GeoJSON.GeoJsonObject | null
  dark: boolean
}

export default function LeafletMap({ sismos, outline, dark }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureDefaultIcon()
    setReady(true)
  }, [])

  const pulseIcons = useMemo(() => ({
    high: pulseIcon(magColor(6)),
    mid: pulseIcon(magColor(5)),
  }), [])

  if (!ready) return null

  return (
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
      {sismos.map(s => {
        const mag = parseMag(s.titulo)
        const icon = mag >= 6 ? pulseIcons.high : mag >= 5 ? pulseIcons.mid : undefined
        // Never pass icon={undefined} — that clobbers Leaflet's default icon with
        // undefined and crashes _initIcon. Omit the prop entirely so the default applies.
        const iconProp = icon ? { icon } : {}
        return (
          <Marker key={s.id} position={[s.lat, s.lng]} {...iconProp}>
            <Popup>
              <p className="font-medium text-sm">{s.titulo}</p>
              <p className="text-xs text-gray-500">{s.factcheck_confianza}% confianza</p>
              {s.tsunami && (
                <p className="text-xs font-semibold text-crisis-red mt-1">Alerta de tsunami</p>
              )}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-crisis-blue hover:underline block mt-1">
                Ver más
              </a>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
