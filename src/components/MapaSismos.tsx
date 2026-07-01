'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import type { Sismo } from './LeafletMap'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

// Zones list for the select filter (matching FeedNoticias)
const ZONAS = [
  { value: 'todos', label: 'Toda Venezuela' },
  { value: 'la_guaira', label: 'La Guaira' },
  { value: 'caracas', label: 'Caracas' },
  { value: 'miranda', label: 'Miranda' },
  { value: 'carabobo', label: 'Carabobo' },
  { value: 'yaracuy', label: 'Yaracuy' },
  { value: 'trujillo', label: 'Trujillo' },
  { value: 'aragua', label: 'Aragua' },
  { value: 'falcon', label: 'Falcón' },
  { value: 'lara', label: 'Lara' },
  { value: 'zulia', label: 'Zulia' },
  { value: 'merida', label: 'Mérida' },
  { value: 'tachira', label: 'Táchira' },
  { value: 'barinas', label: 'Barinas' },
  { value: 'portuguesa', label: 'Portuguesa' },
  { value: 'guarico', label: 'Guárico' },
  { value: 'anzoategui', label: 'Anzoátegui' },
  { value: 'sucre', label: 'Sucre' },
  { value: 'monagas', label: 'Monagas' },
  { value: 'nueva_esparta', label: 'Nueva Esparta' },
  { value: 'apure', label: 'Apure' },
  { value: 'bolivar', label: 'Bolívar' },
  { value: 'amazonas', label: 'Amazonas' },
  { value: 'delta_amacuro', label: 'Delta Amacuro' },
  { value: 'cojedes', label: 'Cojedes' },
]

const MAG_LEGEND = [
  { id: 'm6', label: 'M ≥ 6', color: '#DC2626', desc: 'Sismos mayores' },
  { id: 'm5', label: 'M 5–6', color: '#EA580C', desc: 'Sismos moderados' },
  { id: 'm4', label: 'M 4–5', color: '#CA8A04', desc: 'Sismos ligeros' },
  { id: 'm3', label: 'M < 4', color: '#16A34A', desc: 'Micro sismos' },
] as const

type Props = {
  sismos: Sismo[]
  outline: GeoJSON.GeoJsonObject | null
  dark: boolean
}

function parseMag(titulo: string): number {
  const match = titulo.match(/M(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 4
}

export function MapaSismosView({ sismos, outline, dark }: Props) {
  const [activeMags, setActiveMags] = useState<string[]>(['m6', 'm5', 'm4', 'm3'])
  const [selectedZona, setSelectedZona] = useState<string>('todos')
  const [selectedSismo, setSelectedSismo] = useState<Sismo | null>(null)

  // Toggle magnitude filters
  const handleToggleMag = (id: string) => {
    setActiveMags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Filter sismos based on magnitude and zone
  const filteredSismos = useMemo(() => {
    return sismos.filter((s) => {
      // 1. Magnitude Filter
      const mag = parseMag(s.titulo)
      let magMatch = false
      if (mag >= 6) magMatch = activeMags.includes('m6')
      else if (mag >= 5) magMatch = activeMags.includes('m5')
      else if (mag >= 4) magMatch = activeMags.includes('m4')
      else magMatch = activeMags.includes('m3')

      if (!magMatch) return false

      // 2. Zone Filter
      if (selectedZona !== 'todos') {
        if (s.zona) {
          return s.zona.toLowerCase() === selectedZona.toLowerCase()
        }
        // Fallback: match string in title
        const titleLower = s.titulo.toLowerCase()
        const zoneClean = selectedZona.replace('_', ' ').toLowerCase()
        return titleLower.includes(zoneClean)
      }

      return true
    })
  }, [sismos, activeMags, selectedZona])

  // Deselect if filtered sismo is no longer visible
  const finalSelectedSismo = useMemo(() => {
    if (!selectedSismo) return null
    const isStillVisible = filteredSismos.some((s) => s.id === selectedSismo.id)
    return isStillVisible ? selectedSismo : null
  }, [selectedSismo, filteredSismos])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Map Column */}
      <div className="flex-1 relative isolate min-h-[50vh] lg:min-h-[72vh] h-[65vh] lg:h-[72vh] border border-rule dark:border-rule-dark bg-panel dark:bg-panel-dark overflow-hidden rounded-sm">
        <LeafletMap
          sismos={filteredSismos}
          outline={outline}
          dark={dark}
          selectedSismo={finalSelectedSismo}
          onSelectSismo={setSelectedSismo}
        />
        
        {/* Mobile Info Overlay (Just counter & status) */}
        <div className="absolute top-3 left-3 z-[400] lg:hidden bg-panel/90 dark:bg-panel-dark/90 backdrop-blur-sm border border-rule dark:border-rule-dark px-3 py-1.5 rounded-sm shadow-soft flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-crisis-red uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis-red opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-crisis-red" />
            </span>
            En vivo
          </span>
          <span className="text-xs text-ink-muted dark:text-ink-muted-dark border-l border-rule dark:border-rule-dark pl-3">
            <span className="font-semibold text-ink dark:text-ink-dark">{filteredSismos.length}</span> sismos
          </span>
        </div>
      </div>

      {/* Sidebar Control Panel Column */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {/* Info & Filters Panel */}
        <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm shadow-soft flex flex-col gap-5">
          <header className="border-b border-rule dark:border-rule-dark pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-headline text-ink dark:text-ink-dark">Panel de Control</h2>
              <span className="inline-flex items-center gap-1.5 text-eyebrow uppercase text-crisis-red">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis-red opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-crisis-red" />
                </span>
                En vivo
              </span>
            </div>
            <p className="text-caption text-ink-muted dark:text-ink-muted-dark mt-1">
              Visualización y filtrado de actividad sísmica verificada.
            </p>
          </header>

          {/* Records Counter */}
          <div className="flex items-center justify-between bg-paper dark:bg-paper-dark p-3 border border-rule dark:border-rule-dark rounded-sm">
            <span className="text-small text-ink-muted dark:text-ink-muted-dark">Eventos en mapa:</span>
            <span className="text-small font-bold text-ink dark:text-ink-dark tnum">
              {filteredSismos.length} <span className="font-normal text-ink-muted dark:text-ink-muted-dark">de {sismos.length}</span>
            </span>
          </div>

          {/* Zone Selector */}
          <div>
            <label htmlFor="map-zona" className="block text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-1.5">
              Filtrar por Estado
            </label>
            <div className="relative">
              <select
                id="map-zona"
                value={selectedZona}
                onChange={(e) => setSelectedZona(e.target.value)}
                className="w-full bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark text-small px-3 py-2 rounded-sm outline-none focus:ring-1 focus:ring-crisis-red text-ink dark:text-ink-dark appearance-none cursor-pointer"
              >
                {ZONAS.map((z) => (
                  <option key={z.value} value={z.value} className="bg-panel dark:bg-panel-dark text-ink dark:text-ink-dark">
                    {z.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted dark:text-ink-muted-dark">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Interactive Magnitudes Filter */}
          <div>
            <span className="block text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-2">
              Rangos de Magnitud
            </span>
            <div className="flex flex-col gap-2">
              {MAG_LEGEND.map((m) => {
                const isActive = activeMags.includes(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => handleToggleMag(m.id)}
                    className={`flex items-center justify-between text-left p-2 rounded-sm border transition-all text-small hover:border-ink/20 dark:hover:border-ink-dark/20 ${
                      isActive
                        ? 'bg-paper dark:bg-paper-dark border-rule dark:border-rule-dark text-ink dark:text-ink-dark'
                        : 'bg-transparent border-transparent text-ink-muted dark:text-ink-muted-dark opacity-50'
                    }`}
                    title={m.desc}
                    aria-label={`Filtrar por ${m.label}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ background: m.color }}
                      />
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-caption text-ink-muted dark:text-ink-muted-dark font-normal hidden sm:inline">
                        · {m.desc}
                      </span>
                    </div>
                    {/* Checkbox state */}
                    <div className={`h-4 w-4 border rounded-sm flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'border-crisis-red bg-crisis-red text-white'
                        : 'border-rule dark:border-rule-dark'
                    }`}>
                      {isActive && (
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark mt-2">
              * Haz clic en las magnitudes para filtrarlas en el mapa.
            </p>
          </div>
        </div>

        {/* Selected Sismo Detail Panel */}
        <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm shadow-soft min-h-[14rem] flex flex-col">
          <h3 className="font-serif text-headline text-ink dark:text-ink-dark border-b border-rule dark:border-rule-dark pb-3 mb-4">
            Detalle del Evento
          </h3>
          
          <AnimatePresence mode="wait">
            {finalSelectedSismo ? (
              <motion.div
                key={finalSelectedSismo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <h4 className="font-serif text-headline text-crisis-red leading-tight">
                    {finalSelectedSismo.titulo}
                  </h4>
                  
                  {finalSelectedSismo.tsunami && (
                    <div className="bg-crisis-red/10 border border-crisis-red/30 px-3 py-2 rounded-sm text-crisis-red text-caption font-bold flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                      ALERTA DE TSUNAMI ACTIVA
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                    <div>
                      <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">
                        Confianza
                      </span>
                      <span className="text-small font-bold text-ink dark:text-ink-dark">
                        {finalSelectedSismo.factcheck_confianza}% (Verificado)
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">
                        Estado / Zona
                      </span>
                      <span className="text-small font-bold text-ink dark:text-ink-dark capitalize">
                        {finalSelectedSismo.zona ? finalSelectedSismo.zona.replace('_', ' ') : 'N/D'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">
                        Coordenadas
                      </span>
                      <span className="text-small font-mono text-ink dark:text-ink-dark">
                        {finalSelectedSismo.lat.toFixed(4)}, {finalSelectedSismo.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={() => {
                      // Triggering component-level flyTo is handled by state updating
                      // We recreate object reference to force ChangeView to run useEffect again
                      setSelectedSismo({ ...finalSelectedSismo })
                    }}
                    className="w-full bg-paper hover:bg-rule/40 dark:bg-paper-dark dark:hover:bg-rule-dark/40 border border-rule dark:border-rule-dark text-ink dark:text-ink-dark text-small font-semibold py-2 px-3 rounded-sm flex items-center justify-center gap-2 transition-colors focus:ring-1 focus:ring-crisis-red outline-none"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Centrar en mapa
                  </button>

                  <a
                    href={finalSelectedSismo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-crisis-red hover:bg-crisis-red-light text-white text-center text-small font-semibold py-2 px-3 rounded-sm flex items-center justify-center gap-2 transition-colors focus:ring-1 focus:ring-crisis-red outline-none"
                  >
                    Ver reporte oficial
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                    </svg>
                  </a>
                  
                  <button
                    onClick={() => setSelectedSismo(null)}
                    className="w-full text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark text-caption font-semibold py-1.5 transition-colors"
                  >
                    Limpiar selección
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-4"
              >
                <svg className="h-8 w-8 text-ink-muted/50 dark:text-ink-muted-dark/50 stroke-current fill-none mb-3" viewBox="0 0 24 24" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-small text-ink-muted dark:text-ink-muted-dark">
                  Haz clic en un sismo del mapa para ver los detalles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
