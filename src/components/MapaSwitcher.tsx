'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import type { Sismo } from './LeafletMap'
import { MapaSismosView } from './MapaSismos'
import { MapaEdificios3DView } from './MapaEdificios3D'

type View = '2d' | '3d'

const TABS: { id: View; label: string; meta: string }[] = [
  { id: '2d', label: 'Mapa 2D', meta: 'Sismos · Venezuela' },
  { id: '3d', label: 'Vista 3D', meta: 'Edificios · Catia La Mar' },
]

const LEAD: Record<View, string> = {
  '2d': 'Ubicación geográfica de los sismos reportados por fuentes oficiales en todo el territorio.',
  '3d': 'Modelo tridimensional de la franja costera urbana de La Guaira, con foco en las estructuras de Catia La Mar.',
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

export function MapaSwitcher() {
  const supabase = useMemo(
    () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  )
  const [sismos, setSismos] = useState<Sismo[]>([])
  const [outline, setOutline] = useState<GeoJSON.GeoJsonObject | null>(null)
  const [view, setView] = useState<View>('2d')
  // The 3D iframe is heavy to (re)load, so once visited we keep it mounted and only
  // toggle visibility — switching tabs no longer reloads the ArcGIS scene.
  const [seen3d, setSeen3d] = useState(false)
  const dark = useDarkMode()

  useEffect(() => {
    supabase
      .from('noticias')
      .select('id, titulo, url, factcheck_confianza, tsunami, lat, lng, zona')
      .eq('fuente_tipo', 'oficial')
      .eq('factcheck_status', 'aprobado')
      .not('lat', 'is', null)
      .limit(100)
      .then(({ data }) => { if (data) setSismos(data as Sismo[]) })

    fetch('/data/venezuela.geojson')
      .then((r) => r.json())
      .then(setOutline)
      .catch((err) => console.error('[mapa] Error cargando contorno:', err))
  }, [supabase])

  useEffect(() => {
    if (view === '3d') setSeen3d(true)
  }, [view])

  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-6">
        <p className="text-eyebrow uppercase text-crisis-red mb-3">Cartografía sísmica</p>
        <h1 className="font-serif text-display text-ink dark:text-ink-dark">Mapa sísmico</h1>
        <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose min-h-[3.2em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-block"
            >
              {LEAD[view]}
            </motion.span>
          </AnimatePresence>
        </p>
      </header>

      {/* Tabs Menu */}
      <div className="flex items-end justify-between border-b border-rule dark:border-rule-dark mb-6">
        <div role="tablist" aria-label="Vistas del mapa" className="flex gap-8">
          {TABS.map((tab) => {
            const active = view === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setView(tab.id)}
                className="group relative pb-3 pt-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-crisis-red focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-paper-dark rounded-sm transition-all min-h-[44px]"
              >
                <span
                  className={`block text-small font-semibold transition-colors ${
                    active
                      ? 'text-ink dark:text-ink-dark'
                      : 'text-ink-muted dark:text-ink-muted-dark group-hover:text-ink dark:group-hover:text-ink-dark'
                  }`}
                >
                  {tab.label}
                </span>
                <span className="block text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">{tab.meta}</span>
                {active && (
                  <motion.span
                    layoutId="mapTabUnderline"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-crisis-red"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <span className="hidden sm:block pb-3 text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">
          Dos vistas disponibles
        </span>
      </div>

      <div>
        {view === '2d' && <MapaSismosView sismos={sismos} outline={outline} dark={dark} />}
        {/* Kept mounted after first visit; hidden (not unmounted) to avoid reloading the scene. */}
        <div className={view === '3d' ? 'block' : 'hidden'}>{seen3d && <MapaEdificios3DView />}</div>
      </div>
    </main>
  )
}
