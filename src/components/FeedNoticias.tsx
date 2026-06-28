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

// Color text + left border per category. No pill backgrounds.
const TAG_META: Record<string, { label: string; border: string; text: string; short: string }> = {
  todos:             { label: 'Todas las categorías', border: 'border-l-[#444]',       text: 'text-ink-muted dark:text-ink-muted-dark', short: 'Todas'    },
  sismo:             { label: 'Sismo',                border: 'border-l-[#CF1020]',    text: 'text-[#CF1020]',                         short: 'Sismo'    },
  rescate:           { label: 'Rescate',              border: 'border-l-[#F97316]',    text: 'text-[#F97316]',                         short: 'Rescate'  },
  desaparecidos:     { label: 'Desaparecidos',        border: 'border-l-[#A855F7]',    text: 'text-[#A855F7]',                         short: 'Desap.'   },
  puntos_acopio:     { label: 'Puntos de acopio',     border: 'border-l-[#22C55E]',    text: 'text-[#22C55E]',                         short: 'Acopio'   },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',    border: 'border-l-[#3B82F6]',    text: 'text-[#3B82F6]',                         short: 'Ayuda'    },
  replicas:          { label: 'Réplicas',             border: 'border-l-[#EAB308]',    text: 'text-[#EAB308]',                         short: 'Réplicas' },
  donaciones:        { label: 'Donaciones',           border: 'border-l-[#14B8A6]',    text: 'text-[#14B8A6]',                         short: 'Donar'    },
  internacional:     { label: 'Internacional',        border: 'border-l-[#94A3B8]',    text: 'text-[#94A3B8]',                         short: 'Int.'     },
}

const LIMIT = 30

const RESUMEN_DATOS = [
  { num: 'M7.2 + M7.5',        label: 'Doblete sísmico',   red: false },
  { num: '40 seg',              label: 'Entre sismos',      red: false },
  { num: 'Yaracuy / Carabobo', label: 'Epicentro',         red: false },
  { num: '~920',               label: 'Muertos (aprox.)',  red: true  },
  { num: '~3.360',             label: 'Heridos',           red: true  },
  { num: '+50.000',            label: 'Desaparecidos',     red: true  },
]

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

function fuenteLabel(tipo: string, fuente: string) {
  if (tipo === 'x_twitter') return `@${fuente.replace(/^@/, '')}`
  if (tipo === 'oficial') return fuente
  return fuente
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

function EmptyState({ error, degraded }: { error?: boolean; degraded?: boolean }) {
  return (
    <div className="py-16 px-6 border border-rule dark:border-rule-dark border-l-[3px] border-l-[#CF1020] bg-panel dark:bg-panel-dark">
      <p className="font-mono text-[10px] uppercase tracking-widest text-crisis-red mb-3">
        {degraded ? 'Servicio en modo local' : error ? 'Sin conexión' : 'Sin registros'}
      </p>
      <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-lg mb-2">
        {degraded
          ? 'El boletín no está conectado a la base de datos'
          : error
            ? 'No se pudo cargar el boletín'
            : 'Aún no hay reportes en esta categoría'}
      </h3>
      <p className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark max-w-prose">
        {degraded
          ? 'Conecta Supabase para ver reportes verificados en tiempo real.'
          : error
            ? 'El servicio no está disponible. Revisa tu conexión o intenta más tarde.'
            : 'Cuando lleguen nuevos reportes verificados aparecerán aquí.'}
      </p>
    </div>
  )
}

function ResumenEvento() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-[#999] transition-colors"
      >
        <span>Resumen del evento</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
            {RESUMEN_DATOS.map(({ num, label, red }) => (
              <div key={label}>
                <p className={`font-mono text-xl font-bold ${red ? 'text-crisis-red' : 'text-ink dark:text-ink-dark'}`}>{num}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark mt-3">
            Cifras provisionales · 28 jun 2026 · Fuente: medios verificados
          </p>
        </>
      )}
    </div>
  )
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
  const [degraded, setDegraded] = useState(false)
  const [offset, setOffset] = useState(initialData?.length ?? 0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState<number | null>(null)
  const [nuevasCount, setNuevasCount] = useState(0)
  const [statsLabel, setStatsLabel] = useState<string>('')

  // Feature 1: copy feedback per card
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  // Feature 3: replica toast
  const [replicaToast, setReplicaToast] = useState<string | null>(null)
  // Feature 5: browser notifications
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission | 'unsupported'>('default')
  const notifPermisoRef = useRef<NotificationPermission | 'unsupported'>('default')
  // Feature 6: export feedback
  const [exportado, setExportado] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNewTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Keep notifPermisoRef in sync so the Supabase closure always reads current value
  useEffect(() => { notifPermisoRef.current = notifPermiso }, [notifPermiso])

  // Feature 5: detect notification support and current permission on mount
  useEffect(() => {
    if (typeof Notification === 'undefined') {
      setNotifPermiso('unsupported')
    } else {
      setNotifPermiso(Notification.permission)
    }
  }, [])

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
    setCargando(true)
    setError(null)
    setDegraded(false)
    try {
      const res = await fetch(buildUrl(tag, q, 0, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      setNoticias(items)
      setTotal(data.total ?? null)
      setOffset(items.length)
      setHasMore(items.length >= LIMIT)
      if (data.degraded) setDegraded(true)
    } catch {
      setError('No se pudo cargar el feed.')
      setNoticias([])
      setHasMore(false)
    } finally {
      setCargando(false)
      setNuevasCount(0)
    }
  }, [buildUrl, idiomaActivo])

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hasMore) return
    setCargandoMas(true)
    try {
      const res = await fetch(buildUrl(tagActivo, query, offset, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      if (items.length < LIMIT) setHasMore(false)
      setNoticias(prev => {
        const ids = new Set(prev.map(n => n.id))
        return [...prev, ...items.filter(n => !ids.has(n.id))]
      })
      setOffset(prev => prev + items.length)
      if (data.degraded) setDegraded(true)
    } catch { /* ignore */ } finally {
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
        if (query && !nueva.titulo.toLowerCase().includes(query.toLowerCase())) return
        setNoticias(prev => {
          if (prev.find(n => n.id === nueva.id)) return prev
          return [{ ...nueva, isNew: true, insertedAt: Date.now() }, ...prev]
        })
        setNuevasCount(c => c + 1)
        isNewTimers.current.push(setTimeout(() => {
          setNoticias(prev => prev.map(n => n.id === nueva.id ? { ...n, isNew: false } : n))
        }, 300_000))
        // Feature 3: replica toast + vibration
        if (nueva.tag === 'replicas') {
          setReplicaToast(nueva.titulo)
          navigator.vibrate?.(300)
          setTimeout(() => setReplicaToast(null), 8000)
        }
        // Feature 5: browser notification for replicas
        if (nueva.tag === 'replicas' && notifPermisoRef.current === 'granted') {
          new Notification('⚠ Réplica — Sismo Venezuela', {
            body: nueva.titulo,
            icon: '/icon-192.png',
          })
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      isNewTimers.current.forEach(clearTimeout)
      isNewTimers.current = []
    }
  }, [tagActivo, query, supabase])

  const isNuevo = (n: Noticia) => n.isNew && n.insertedAt && Date.now() - n.insertedAt < 300_000

  // Feature 6: export current feed to clipboard
  const handleExportar = useCallback(() => {
    const fecha = new Date().toLocaleDateString('es-VE', { dateStyle: 'full' } as Intl.DateTimeFormatOptions)
    const sep = '──────────────────────────────────────'
    const bloques = noticias.map(n =>
      `${sep}\n[${n.tag.toUpperCase()}] ${n.titulo}\n\n${n.fuente} · ${tiempoRelativo(n.publicado_at)}\n\n${n.url}`
    ).join('\n\n')
    const texto = `SISMO VENEZUELA — BOLETÍN VERIFICADO\n\n${fecha}\n\n${noticias.length} noticias verificadas\n\n${bloques}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).catch(() => {})
    }
    setExportado(true)
    setTimeout(() => setExportado(false), 2000)
  }, [noticias])

  const tagList = Object.entries(TAG_META)

  return (
    <>
      {/* Header compacto — una sola línea */}
      <div className="border-b border-rule dark:border-rule-dark px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-crisis-red animate-pulse shrink-0" />
          <span className="font-mono text-[11px] tracking-widest text-crisis-red uppercase shrink-0">En vivo</span>
          <span className="h-3 w-px bg-rule dark:bg-rule-dark shrink-0" />
          <span className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide truncate">
            Sismo Venezuela · 24 jun 2026
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {statsLabel && (
            <span className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide hidden sm:block tnum">
              {statsLabel}
            </span>
          )}
          {/* Feature 5: notification button */}
          {notifPermiso === 'default' && (
            <button
              onClick={() => Notification.requestPermission().then(p => setNotifPermiso(p))}
              className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors"
            >
              🔔 Activar alertas
            </button>
          )}
          {notifPermiso === 'granted' && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">
              🔔 Alertas activas
            </span>
          )}
          {/* Feature 6: export button */}
          <button
            onClick={handleExportar}
            className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors"
          >
            {exportado ? '✓ Copiado' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="border-b border-rule dark:border-rule-dark px-4 sm:px-6 pt-3">
        {/* Row 1: tags + idioma */}
        <div className="flex items-end gap-4">
          {/* Scroll horizontal de categorías */}
          <div className="flex gap-5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {tagList.map(([key, { short, text }]) => {
              const active = tagActivo === key
              return (
                <button
                  key={key}
                  onClick={() => setTagActivo(key)}
                  className={`font-mono text-[10px] uppercase tracking-widest shrink-0 pb-2.5 border-b-2 transition-colors ${
                    active
                      ? `border-crisis-red ${text}`
                      : 'border-transparent text-ink-muted dark:text-ink-muted-dark hover:text-[#999]'
                  }`}
                >
                  {short}
                </button>
              )
            })}
          </div>
          {/* Filtro de idioma */}
          <div className="flex gap-4 shrink-0 pb-2.5">
            {(['es', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setIdiomaActivo(idiomaActivo === lang ? 'todos' : lang)}
                className={`font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  idiomaActivo === lang
                    ? 'text-ink dark:text-ink-dark'
                    : 'text-ink-muted dark:text-ink-muted-dark hover:text-[#999]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        {/* Row 2: buscador */}
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="Buscar noticias…"
            className="w-full pl-5 pr-4 py-2.5 font-mono text-[11px] tracking-wide bg-transparent border-b border-rule dark:border-rule-dark text-ink dark:text-ink-dark placeholder-[#333] focus:border-[#555] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 sm:px-6 py-6">
        {/* Feature 2: widget resumen del evento */}
        <ResumenEvento />

        {query && total !== null && (
          <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark tracking-widest uppercase mb-4 tnum">
            {total} resultado{total !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Banner nuevas noticias */}
        {nuevasCount > 0 && (
          <button
            onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="w-full mb-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white bg-crisis-red hover:bg-crisis-red-dark transition-colors flex items-center justify-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {nuevasCount} nuevo{nuevasCount > 1 ? 's' : ''} reporte{nuevasCount > 1 ? 's' : ''} — ver arriba
          </button>
        )}

        {error && <EmptyState error />}

        {/* Grid de cards */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark border-l-[3px] border-l-[#333] p-4 animate-pulse">
                <div className="h-2.5 w-20 bg-[#2A2A2A] mb-3" />
                <div className="h-5 w-full bg-[#2A2A2A] mb-2" />
                <div className="h-4 w-3/4 bg-[#2A2A2A]" />
              </div>
            ))}
          </div>
        ) : noticias.length === 0 && !error ? (
          <EmptyState degraded={degraded} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {noticias.map(n => {
                const meta = TAG_META[n.tag]
                return (
                  <a
                    key={n.id}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group block bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark rounded-none
                      border-l-[3px] ${meta?.border ?? 'border-l-[#444]'}
                      p-4 hover:bg-[#1A1A1A] transition-colors
                      ${isNuevo(n) ? 'ring-1 ring-inset ring-[#CF1020]/30' : ''}
                    `}
                  >
                    {/* Primera línea: tag · fuente · tiempo */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${meta?.text ?? 'text-ink-muted dark:text-ink-muted-dark'}`}>
                        {meta?.short ?? n.tag}
                      </span>
                      <span className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark tracking-wide tnum truncate text-right">
                        {fuenteLabel(n.fuente_tipo, n.fuente)} · {tiempoRelativo(n.publicado_at)}
                      </span>
                    </div>

                    {/* Título */}
                    <h2 className="font-serif font-semibold text-[1.05rem] leading-snug text-ink dark:text-ink-dark group-hover:text-[#CF1020] transition-colors mb-2">
                      {n.titulo}
                    </h2>

                    {/* Descripción */}
                    {n.descripcion && (
                      <p className="text-xs text-ink-muted dark:text-ink-muted-dark line-clamp-2">
                        {n.descripcion}
                      </p>
                    )}

                    {isNuevo(n) && (
                      <span className="inline-block mt-1.5 font-mono text-[10px] uppercase tracking-widest text-crisis-red">
                        Nuevo
                      </span>
                    )}

                    {/* Feature 1: botones de compartir */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-3 pt-2 border-t border-rule dark:border-rule-dark">
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(n.titulo + '\n' + n.url)}`,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }}
                        className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors px-2 py-1"
                      >
                        WA
                      </button>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(
                            `https://t.me/share/url?url=${encodeURIComponent(n.url)}&text=${encodeURIComponent(n.titulo)}`,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }}
                        className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors px-2 py-1"
                      >
                        TG
                      </button>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(n.url).catch(() => {})
                          }
                          setCopiadoId(n.id)
                          setTimeout(() => setCopiadoId(prev => prev === n.id ? null : prev), 1500)
                        }}
                        className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors px-2 py-1"
                      >
                        {copiadoId === n.id ? '✓' : '🔗'}
                      </button>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Sentinel de infinite scroll */}
            <div ref={sentinelRef} className="py-8 text-center">
              {cargandoMas && (
                <div className="inline-block w-4 h-4 border border-[#333] border-t-crisis-red rounded-full animate-spin" />
              )}
              {!hasMore && noticias.length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">Fin del feed</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Feature 3: toast de réplica (fixed) */}
      {replicaToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md bg-[#EAB308] animate-fade-in">
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-widest font-bold text-black">
                ⚠ Réplica detectada
              </p>
              <p className="text-sm font-serif text-black mt-1 leading-snug">
                {replicaToast}
              </p>
            </div>
            <button
              onClick={() => setReplicaToast(null)}
              className="font-mono text-black text-lg leading-none shrink-0 hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
