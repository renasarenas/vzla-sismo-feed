'use client'

import { useEffect, useState } from 'react'

type Earthquake = {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    url: string
  }
  geometry: {
    coordinates: [number, number, number] // lon, lat, depth
  }
}

export function SismosUSGS() {
  const [sismos, setSismos] = useState<Earthquake[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSismos = async () => {
      try {
        // Coordenadas aproximadas para Venezuela
        const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=0.6&maxlatitude=12.5&minlongitude=-73.4&maxlongitude=-59.8&limit=50&orderby=time'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Error al obtener los datos de USGS')
        const data = await res.json()
        setSismos(data.features || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setCargando(false)
      }
    }
    fetchSismos()
  }, [])

  const tiempoRelativo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'ahora mismo'
    if (min < 60) return `hace ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `hace ${h}h`
    return new Date(timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getMagColor = (mag: number) => {
    if (mag >= 5.0) return 'bg-red-500'
    if (mag >= 4.0) return 'bg-orange-500'
    if (mag >= 3.0) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h1 className="text-lg font-medium text-gray-900">
            Monitoreo Sísmico
          </h1>
        </div>
        <span className="text-xs text-gray-400">
          Fuente: USGS
        </span>
      </div>

      {cargando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : sismos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌍</p>
          <p className="text-sm">No se registraron sismos recientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sismos.map((s) => (
            <a
              key={s.id}
              href={s.properties.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${getMagColor(s.properties.mag)}`}>
                {s.properties.mag.toFixed(1)}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {s.properties.place}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    Profundidad: {s.geometry?.coordinates?.[2] ?? '?'} km
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {tiempoRelativo(s.properties.time)}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
