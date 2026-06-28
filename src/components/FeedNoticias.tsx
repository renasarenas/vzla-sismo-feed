'use client'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

type Noticia = {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  fuente_tipo: 'rss' | 'x_twitter' | 'oficial'
  tag: string
  idioma: 'es' | 'en'
  publicado_at: string
  factcheck_confianza: number
  factcheck_status: string
  isNew?: boolean
  insertedAt?: number
}

const TAG_META: Record<string, { label: string; border: string; pill: string }> = {
  todos:             { label: 'Todos',            border: 'border-l-gray-300',   pill: '' },
  sismo:             { label: 'Sismo',            border: 'border-l-red-500',    pill: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  rescate:           { label: 'Rescate',          border: 'border-l-orange-500', pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  desaparecidos:     { label: 'Desaparecidos',    border: 'border-l-purple-500', pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  puntos_acopio:     { label: 'Puntos de acopio', border: 'border-l-green-500',  pill: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',border: 'border-l-blue-500',   pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  replicas:          { label: 'Réplicas',         border: 'border-l-yellow-500', pill: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  donaciones:        { label: 'Donaciones',       border: 'border-l-teal-500',   pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  internacional:     { label: 'Internacional',    border: 'border-l-slate-500',  pill: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
}

const LIMIT = 30

function tiempoRelativo(iso: string) {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
}

function iconoFuente(tipo: string) {
  if (tipo === 'x_twitter') return '𝕏'
  if (tipo === 'oficial') return '🏛️'
  return '📰'
}

export function FeedNoticias({ initialData }: { initialData?: Noticia[] }) {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [noticias, setNoticias] = useState<Noticia[]>(initialData ?? [])
  const [tagActivo, setTagActivo] = useState('todos')
  const [idiomaActivo, setIdiomaActivo] = useState<'todos' | 'es' | 'en'>('todos')
  const [query, setQuery] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const [cargando, setCargando] = useState(!initialData?.length)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(initialData?.length ?? 0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState<number | null>(null)
  const [nuevasCount, setNuevasCount] = useState(0)
  const [statsLabel, setStatsLabel] = useState<string>('')
  const [view, setView] = useState<'feed' | 'medios'>('feed')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNewTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const cargandoRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const d = await res.json()
        const ultima = d.ultima_at ? tiempoRelativo(d.ultima_at) : '—'
        setStatsLabel(`${d.total_aprobadas} noticias · última ${ultima}`)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const buildUrl = useCallback((tag: string, q: string, off: number, idioma: 'todos' | 'es' | 'en') => {
    const p = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
    if (tag !== 'todos') p.set('tag', tag)
    if (q) p.set('q', q)
    if (idioma !== 'todos') p.set('lang', idioma)
    return `/api/feed?${p}`
  }, [])

  const cargar = useCallback(async (tag: string, q: string) => {
    cargandoRef.current = true
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(buildUrl(tag, q, 0, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      setNoticias(items)
      setTotal(data.total ?? null)
      setOffset(items.length)
      setHasMore(items.length >= LIMIT)
    } catch {
      setError('No se pudo cargar el feed.')
      setNoticias([])
      setHasMore(false)
    } finally {
      cargandoRef.current = false
      setCargando(false)
      setNuevasCount(0)
    }
  }, [buildUrl, idiomaActivo])

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hasMore || cargandoRef.current) return
    setCargandoMas(true)
    try {
      const res = await fetch(buildUrl(tagActivo, query, offset, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) { setHasMore(false); return }
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      if (items.length < LIMIT) setHasMore(false)
      setNoticias(prev => {
        const ids = new Set(prev.map(n => n.id))
        return [...prev, ...items.filter(n => !ids.has(n.id))]
      })
      setOffset(prev => prev + items.length)
    } catch { setHasMore(false) } finally {
      setCargandoMas(false)
    }
  }, [buildUrl, tagActivo, query, offset, idiomaActivo, cargandoMas, hasMore])

  useEffect(() => { cargar(tagActivo, query) }, [tagActivo, query, idiomaActivo, cargar])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setQuery(queryInput.trim()), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [queryInput])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!hasMore) return
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) cargarMas()
    }, { rootMargin: '200px' })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [cargarMas, hasMore])

  useEffect(() => {
    const channel = supabase
      .channel(`noticias-feed-${tagActivo}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'noticias',
        filter: tagActivo !== 'todos' ? `tag=eq.${tagActivo}` : undefined,
      }, (payload) => {
        const nueva = payload.new as Noticia
        if (nueva.factcheck_status !== 'aprobado') return
        if (idiomaActivo !== 'todos' && nueva.idioma !== idiomaActivo) return
        if (query && !nueva.titulo.toLowerCase().includes(query.toLowerCase()) && !nueva.descripcion?.toLowerCase().includes(query.toLowerCase())) return
        setNoticias(prev => {
          if (prev.find(n => n.id === nueva.id)) return prev
          return [{ ...nueva, isNew: true, insertedAt: Date.now() }, ...prev]
        })
        setNuevasCount(c => c + 1)
        isNewTimers.current.push(setTimeout(() => {
          setNoticias(prev => prev.map(n => n.id === nueva.id ? { ...n, isNew: false } : n))
        }, 300_000))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      isNewTimers.current.forEach(clearTimeout)
      isNewTimers.current = []
    }
  }, [tagActivo, query, supabase, idiomaActivo])

  const isNuevo = (n: Noticia) => n.isNew && n.insertedAt && Date.now() - n.insertedAt < 300_000

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            Venezuela — Sismo 24 jun
          </h1>
        </div>
        {statsLabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-4">{statsLabel}</p>
        )}
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={queryInput}
          onChange={e => setQueryInput(e.target.value)}
          placeholder="Buscar noticias..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Query result label */}
      {query && total !== null && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {total} resultado{total !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Filtro de idioma */}
      <div className="flex gap-1 mb-3">
        {(['todos', 'es', 'en'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => setIdiomaActivo(lang)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              idiomaActivo === lang
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            {lang === 'todos' ? 'Todos' : lang === 'es' ? '🇻🇪 ES' : '🌐 EN'}
          </button>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setView('feed')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            view === 'feed'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Feed General
        </button>
        <button
          onClick={() => setView('medios')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            view === 'medios'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Medios Oficiales
        </button>
      </div>

      {view === 'feed' ? (
        <>
          {/* Banner de nuevas noticias */}
          {nuevasCount > 0 && (
            <button
              onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="w-full mb-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              ↑ {nuevasCount} nueva{nuevasCount > 1 ? 's' : ''} noticia{nuevasCount > 1 ? 's' : ''}
            </button>
          )}

          {/* Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {Object.entries(TAG_META).map(([key, { label, pill }]) => (
              <button
                key={key}
                onClick={() => setTagActivo(key)}
                className={`
                  whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${tagActivo === key
                    ? `bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100`
                    : pill
                      ? `${pill} border-transparent hover:opacity-80`
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-center text-sm text-red-500 py-4">{error}</p>}

          {/* Feed */}
          {cargando ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : noticias.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📡</p>
              <p className="text-sm">Sin noticias verificadas en esta categoría</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {noticias.map(n => {
                  const meta = TAG_META[n.tag]
                  return (
                    <a
                      key={n.id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        block p-4 rounded-xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800
                        border-l-[3px] ${meta?.border ?? 'border-l-gray-300'}
                        hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all
                        ${isNuevo(n) ? 'ring-2 ring-red-200 dark:ring-red-800 ring-offset-1' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {iconoFuente(n.fuente_tipo)} {n.fuente}
                        </span>
                        {n.idioma === 'en' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            EN
                          </span>
                        )}
                        {meta && meta.pill && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
                            {meta.label}
                          </span>
                        )}
                        {isNuevo(n) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                            NUEVO
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {tiempoRelativo(n.publicado_at)}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
                        {n.titulo}
                      </p>
                      {n.descripcion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {n.descripcion}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-0.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${n.factcheck_confianza}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {n.factcheck_confianza}% verificado
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
              {/* Sentinel + spinner */}
              <div ref={sentinelRef} className="py-4 text-center">
                {cargandoMas && (
                  <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                )}
                {!hasMore && noticias.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No hay más noticias</p>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
            <h3 className="text-sm font-bold text-blue-900 mb-1">Timeline de Medios Oficiales</h3>
            <p className="text-xs text-blue-700">Integración con perfiles verificados (ej. @Funvisis, @PCivil_Ve, etc.).</p>
          </div>
          <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
            {noticias
              .filter(n => n.fuente.startsWith('@'))
              .map((n) => {
                let icon = '📰'
                let colorClass = 'bg-blue-100'
                if (n.fuente.includes('PCivil_Ve') || n.fuente.includes('bomberos')) {
                  icon = '🚨'
                  colorClass = 'bg-orange-100'
                } else if (n.fuente.includes('CruzRoja')) {
                  icon = '🏥'
                  colorClass = 'bg-red-100'
                } else if (n.fuente.includes('Funvisis') || n.fuente.includes('usembassy') || n.fuente.includes('nayibbukele')) {
                  icon = '🏛️'
                  colorClass = 'bg-blue-100'
                } else {
                  icon = 'ℹ️'
                  colorClass = 'bg-gray-100'
                }
                return (
                  <div key={`timeline-${n.id}`} className="relative pl-6">
                    <span className={`absolute -left-3 top-0 w-6 h-6 rounded-full ${colorClass} border-4 border-white flex items-center justify-center text-[10px]`}>
                      {icon}
                    </span>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="block bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-900">{n.fuente}</span>
                        <span className="text-xs text-gray-400">{tiempoRelativo(n.publicado_at)}</span>
                      </div>
                      <p className="text-sm text-gray-800">{n.titulo}</p>
                      {n.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-3">{n.descripcion}</p>
                      )}
                      <div className="mt-2 text-[10px] text-blue-600 font-semibold bg-blue-50 inline-block px-2 py-0.5 rounded">
                        Verificado por cuenta oficial ({n.factcheck_confianza}%)
                      </div>
                    </a>
                  </div>
                )
              })}
            {noticias.filter(n => n.fuente.startsWith('@')).length === 0 && !cargando && (
              <div className="pl-6 text-sm text-gray-400 italic py-4">
                No hay actualizaciones recientes de las cuentas oficiales.
              </div>
            )}
            {cargando && (
              <div className="pl-6 space-y-3 py-4">
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
