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
        const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=0.6&maxlatitude=12.5&minlongitude=-73.4&maxlongitude=-59.8&limit=50&orderby=time'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Error al obtener los datos de USGS')
        const data = await res.json()
        setSismos(data.features || [])
      } catch (err: any) {
        setError(err.message)
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

  const getMagStyle = (mag: number) => {
    if (mag >= 5.0) return { bg: 'bg-crisis-red', label: 'Mayor', text: 'text-white' }
    if (mag >= 4.0) return { bg: 'bg-crisis-amber', label: 'Moderado', text: 'text-gray-900' }
    if (mag >= 3.0) return { bg: 'bg-yellow-400', label: 'Leve', text: 'text-gray-900' }
    return { bg: 'bg-green-500', label: 'Menor', text: 'text-white' }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crisis-blue" />
          </span>
          <h1 className="text-title text-gray-900 dark:text-white">
            Monitoreo Sísmico
          </h1>
        </div>
        <span className="text-caption text-gray-400 dark:text-gray-500">
          Fuente: USGS
        </span>
      </header>

      {cargando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600 dark:text-red-400">
          <p className="text-small">{error}</p>
        </div>
      ) : sismos.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No se registraron sismos recientes</h3>
          <p className="text-small text-gray-500 dark:text-gray-400">El servicio de USGS no reporta actividad en la región en este momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sismos.map((s) => {
            const style = getMagStyle(s.properties.mag)
            return (
              <a
                key={s.id}
                href={s.properties.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start sm:items-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all"
              >
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0 ${style.bg} ${style.text}`}>
                  <span className="text-lg font-bold leading-none">{s.properties.mag.toFixed(1)}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wide mt-0.5">{style.label}</span>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-small font-medium text-gray-900 dark:text-white leading-snug truncate">
                    {s.properties.place}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-caption text-gray-500 dark:text-gray-400">
                      Profundidad: {s.geometry.coordinates[2]} km
                    </span>
                    <span className="text-caption text-gray-400 dark:text-gray-500">
                      {tiempoRelativo(s.properties.time)}
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
