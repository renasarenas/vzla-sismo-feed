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

// Each category carries an accent used as an editorial kicker (uppercase label
// in the accent colour) and a left rule on the article row — not a filled pill.
const TAG_META: Record<string, { label: string; border: string; dot: string; text: string; short: string }> = {
  todos:             { label: 'Todas las categorías', border: 'border-l-ink-muted/40', dot: 'bg-ink-muted',     text: 'text-ink-muted dark:text-ink-muted-dark', short: 'Todas' },
  sismo:             { label: 'Sismo',                border: 'border-l-crisis-red',   dot: 'bg-crisis-red',    text: 'text-crisis-red',                          short: 'Sismo' },
  rescate:           { label: 'Rescate',             border: 'border-l-orange-600',   dot: 'bg-orange-600',    text: 'text-orange-700 dark:text-orange-400',     short: 'Rescate' },
  desaparecidos:     { label: 'Desaparecidos',       border: 'border-l-purple-600',   dot: 'bg-purple-600',    text: 'text-purple-700 dark:text-purple-400',     short: 'Desap.' },
  puntos_acopio:     { label: 'Puntos de acopio',    border: 'border-l-emerald-600',  dot: 'bg-emerald-600',   text: 'text-emerald-700 dark:text-emerald-400',   short: 'Acopio' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',   border: 'border-l-blue-600',     dot: 'bg-blue-600',      text: 'text-blue-700 dark:text-blue-400',         short: 'Ayuda' },
  replicas:          { label: 'Réplicas',            border: 'border-l-amber-500',    dot: 'bg-amber-500',     text: 'text-amber-700 dark:text-amber-400',       short: 'Réplicas' },
  donaciones:        { label: 'Donaciones',          border: 'border-l-teal-600',     dot: 'bg-teal-600',      text: 'text-teal-700 dark:text-teal-400',         short: 'Donar' },
  internacional:     { label: 'Internacional',       border: 'border-l-slate-500',    dot: 'bg-slate-500',     text: 'text-slate-600 dark:text-slate-400',       short: 'Int.' },
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

function fuenteLabel(tipo: string, fuente: string) {
  if (tipo === 'x_twitter') return `@${fuente.replace(/^@/, '')}`
  if (tipo === 'oficial') return fuente
  return fuente
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

// Live indicator drawn as an animated seismogram, not a pulsing dot.
function LiveSeismo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[2px] h-3 ${className}`} aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="w-[2px] bg-crisis-red animate-seismo"
          style={{ height: '100%', animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  )
}

function EmptyState({ error, degraded }: { error?: boolean; degraded?: boolean }) {
  return (
    <div className="py-16 px-6 border-t-2 border-ink dark:border-ink-dark bg-panel dark:bg-panel-dark">
      <p className="text-eyebrow uppercase text-crisis-red mb-3">
        {degraded ? 'Servicio en modo local' : error ? 'Sin conexión' : 'Sin registros'}
      </p>
      <h3 className="font-serif text-headline text-ink dark:text-ink-dark mb-2">
        {degraded ? 'El boletín no está conectado a la base de datos' : error ? 'No se pudo cargar el boletín' : 'Aún no hay reportes en esta categoría'}
      </h3>
      <p className="text-small text-ink-muted dark:text-ink-muted-dark max-w-prose">
        {degraded
          ? 'El feed está en modo local. Conecta Supabase para ver reportes verificados en tiempo real.'
          : error
            ? 'El servicio de reportes no está disponible. Revisa tu conexión o vuelve a intentarlo más tarde.'
            : 'Cuando lleguen nuevos reportes verificados aparecerán aquí.'}
      </p>
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
  const [view, setView] = useState<'feed' | 'medios'>('feed')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNewTimers = useRef<ReturnType<typeof setTimeout>[]>([])

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
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      isNewTimers.current.forEach(clearTimeout)
      isNewTimers.current = []
    }
  }, [tagActivo, query, supabase])

  const isNuevo = (n: Noticia) => n.isNew && n.insertedAt && Date.now() - n.insertedAt < 300_000

  const tagList = Object.entries(TAG_META)

  return (
    <>
      {/* Alert strip — editorial, not a solid red bar */}
      <div className="border-b border-rule dark:border-rule-dark bg-panel dark:bg-panel-dark">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center gap-3 text-small">
          <span className="text-eyebrow uppercase text-crisis-red shrink-0">Alerta</span>
          <span className="h-3 w-px bg-rule dark:bg-rule-dark shrink-0" />
          <p className="text-ink-muted dark:text-ink-muted-dark truncate">
            Cobertura verificada en tiempo real del sismo del 24 de junio de 2026 en Venezuela.
          </p>
        </div>
      </div>

      {/* Masthead / hero */}
      <section className="border-b-2 border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 lg:pt-14 pb-6 lg:pb-8">
          <div className="flex items-center gap-3 mb-5">
            <LiveSeismo />
            <span className="text-eyebrow uppercase text-ink dark:text-ink-dark">En vivo</span>
            <span className="h-3 w-px bg-rule dark:bg-rule-dark" />
            <span className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Edición del 24 de junio de 2026</span>
          </div>
          <h1 className="font-serif text-masthead text-ink dark:text-ink-dark max-w-5xl text-balance">
            Terremoto del 24 de junio en Venezuela
          </h1>
          <p className="font-serif text-lead text-ink-muted dark:text-ink-muted-dark mt-4 max-w-prose">
            Reportes verificados, información oficial y recursos de emergencia para las personas afectadas, reunidos en un solo boletín.
          </p>
        </div>
        {/* Status dateline strip */}
        <div className="border-t border-rule dark:border-rule-dark">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-caption text-ink-muted dark:text-ink-muted-dark tnum">
            <span><span className="font-semibold text-ink dark:text-ink-dark">{total ?? '—'}</span> reportes verificados</span>
            <span className="hidden sm:inline h-3 w-px bg-rule dark:bg-rule-dark" />
            <span>{statsLabel || 'Conectando con fuentes oficiales…'}</span>
            <span className="hidden sm:inline h-3 w-px bg-rule dark:bg-rule-dark" />
            <span>Fuentes oficiales, medios y cuentas verificadas</span>
          </div>
        </div>
      </section>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar / editorial index */}
          <aside className="lg:w-64 xl:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-7">
              {/* Buscador */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  placeholder="Buscar en el boletín…"
                  className="w-full pl-9 pr-4 py-2.5 text-small rounded-none border-b border-rule-strong dark:border-rule-dark bg-transparent text-ink dark:text-ink-dark placeholder-ink-muted dark:placeholder-ink-muted-dark focus:border-crisis-red transition-colors"
                />
              </div>

              {/* Idioma */}
              <div>
                <h3 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-3">Idioma</h3>
                <div className="flex gap-5">
                  {(['todos', 'es', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setIdiomaActivo(lang)}
                      className={`text-small pb-0.5 border-b-2 transition-colors ${
                        idiomaActivo === lang
                          ? 'border-crisis-red text-ink dark:text-ink-dark font-medium'
                          : 'border-transparent text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                      }`}
                    >
                      {lang === 'todos' ? 'Todos' : lang === 'es' ? 'Español' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-3">Secciones</h3>
                <ul className="-mx-1">
                  {tagList.map(([key, { label, dot }]) => {
                    const active = tagActivo === key
                    return (
                      <li key={key}>
                        <button
                          onClick={() => setTagActivo(key)}
                          className={`group flex items-center gap-2.5 w-full text-left px-1 py-1.5 text-small transition-colors ${
                            active
                              ? 'text-ink dark:text-ink-dark font-medium'
                              : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? dot : 'bg-rule-strong/40 dark:bg-rule-dark group-hover:bg-ink-muted'}`} />
                          {label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Estado del servicio */}
              <div className="border-t border-rule dark:border-rule-dark pt-4">
                <h3 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-2">Estado del servicio</h3>
                <p className="text-caption text-ink-muted dark:text-ink-muted-dark leading-relaxed">
                  {statsLabel || 'Conectando con fuentes oficiales…'}
                </p>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <main className="flex-1 min-w-0">
            {/* Section switch */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-rule dark:border-rule-dark">
              <div className="flex gap-7">
                {([['feed', 'Boletín general'], ['medios', 'Medios oficiales']] as const).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`relative pb-3 text-eyebrow uppercase transition-colors ${
                      view === v
                        ? 'text-ink dark:text-ink-dark'
                        : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                    }`}
                  >
                    {label}
                    {view === v && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-crisis-red" />}
                  </button>
                ))}
              </div>
              {query && total !== null && (
                <p className="text-caption text-ink-muted dark:text-ink-muted-dark pb-3 tnum">
                  {total} resultado{total !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
                </p>
              )}
            </div>

            {view === 'feed' ? (
              <>
                {/* Banner de nuevas noticias */}
                {nuevasCount > 0 && (
                  <button
                    onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="w-full mb-6 py-2.5 text-eyebrow uppercase text-white bg-crisis-red hover:bg-crisis-red-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <LiveSeismo className="[&>span]:bg-white" />
                    {nuevasCount} nuevo{nuevasCount > 1 ? 's' : ''} reporte{nuevasCount > 1 ? 's' : ''} — ver arriba
                  </button>
                )}

                {error && <EmptyState error />}

                {/* Feed list */}
                {cargando ? (
                  <div className="divide-y divide-rule dark:divide-rule-dark border-y border-rule dark:border-rule-dark">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="py-6 animate-pulse">
                        <div className="h-3 w-32 bg-rule dark:bg-rule-dark mb-3" />
                        <div className="h-5 w-3/4 bg-rule dark:bg-rule-dark mb-2" />
                        <div className="h-4 w-1/2 bg-rule dark:bg-rule-dark" />
                      </div>
                    ))}
                  </div>
                ) : noticias.length === 0 && !error ? (
                  <EmptyState degraded={degraded} />
                ) : (
                  <>
                    <div className="border-t border-rule dark:border-rule-dark">
                      {noticias.map(n => {
                        const meta = TAG_META[n.tag]
                        return (
                          <a
                            key={n.id}
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                              group block border-b border-rule dark:border-rule-dark
                              border-l-2 ${meta?.border ?? 'border-l-transparent'}
                              pl-4 sm:pl-5 pr-2 py-6
                              hover:bg-panel dark:hover:bg-panel-dark transition-colors
                              ${isNuevo(n) ? 'bg-crisis-red/[0.03] dark:bg-crisis-red/[0.06]' : ''}
                            `}
                          >
                            {/* Dateline */}
                            <div className="flex items-center gap-2.5 mb-2 text-caption tnum">
                              {meta && (
                                <span className={`text-eyebrow uppercase ${meta.text}`}>
                                  {meta.label}
                                </span>
                              )}
                              <span className="h-3 w-px bg-rule dark:bg-rule-dark" />
                              <span className="font-medium text-ink-muted dark:text-ink-muted-dark">
                                {fuenteLabel(n.fuente_tipo, n.fuente)}
                              </span>
                              {n.idioma === 'en' && (
                                <span className="text-[10px] font-semibold tracking-wide px-1 py-px border border-rule-strong/40 dark:border-rule-dark text-ink-muted dark:text-ink-muted-dark">
                                  EN
                                </span>
                              )}
                              {isNuevo(n) && (
                                <span className="text-eyebrow uppercase text-crisis-red">Nuevo</span>
                              )}
                              <span className="text-ink-muted dark:text-ink-muted-dark ml-auto">
                                {tiempoRelativo(n.publicado_at)}
                              </span>
                            </div>
                            <h2 className="font-serif text-headline text-ink dark:text-ink-dark leading-snug mb-1.5 group-hover:text-crisis-red transition-colors text-balance">
                              {n.titulo}
                            </h2>
                            {n.descripcion && (
                              <p className="text-small text-ink-muted dark:text-ink-muted-dark line-clamp-2 max-w-prose mb-3">
                                {n.descripcion}
                              </p>
                            )}
                            <p className="text-caption text-ink-muted dark:text-ink-muted-dark tnum">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 align-middle" />
                              Verificación {n.factcheck_confianza}%
                            </p>
                          </a>
                        )
                      })}
                    </div>
                    {/* Sentinel + spinner */}
                    <div ref={sentinelRef} className="py-8 text-center">
                      {cargandoMas && (
                        <div className="inline-block w-5 h-5 border-2 border-rule dark:border-rule-dark border-t-crisis-red rounded-full animate-spin" />
                      )}
                      {!hasMore && noticias.length > 0 && (
                        <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Fin del boletín</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>
                <div className="border-l-2 border-crisis-blue pl-4 mb-6">
                  <h3 className="font-serif text-headline text-ink dark:text-ink-dark mb-1">Cronología de medios oficiales</h3>
                  <p className="text-small text-ink-muted dark:text-ink-muted-dark max-w-prose">Actualizaciones de cuentas verificadas como @Funvisis, @PCivil_Ve y @CruzRojaVe.</p>
                </div>
                <div className="relative border-l border-rule-strong/30 dark:border-rule-dark ml-2 space-y-6 pb-4">
                  {noticias
                    .filter(n => n.fuente.startsWith('@'))
                    .map((n) => {
                      let dotColor = 'bg-crisis-blue'
                      if (n.fuente.includes('PCivil_Ve') || n.fuente.includes('bomberos')) {
                        dotColor = 'bg-orange-600'
                      } else if (n.fuente.includes('CruzRoja')) {
                        dotColor = 'bg-crisis-red'
                      }
                      return (
                        <div key={`timeline-${n.id}`} className="relative pl-6">
                          <span className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-paper dark:ring-paper-dark ${dotColor}`} />
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="group block">
                            <div className="flex justify-between items-baseline mb-1 text-caption tnum">
                              <span className="font-semibold text-ink dark:text-ink-dark">{n.fuente}</span>
                              <span className="text-ink-muted dark:text-ink-muted-dark">{tiempoRelativo(n.publicado_at)}</span>
                            </div>
                            <p className="font-serif text-small text-ink dark:text-ink-dark group-hover:text-crisis-red transition-colors">{n.titulo}</p>
                            {n.descripcion && (
                              <p className="text-caption text-ink-muted dark:text-ink-muted-dark mt-1 line-clamp-3 max-w-prose">{n.descripcion}</p>
                            )}
                            <p className="mt-1.5 text-eyebrow uppercase text-crisis-blue">
                              Cuenta oficial · verificación {n.factcheck_confianza}%
                            </p>
                          </a>
                        </div>
                      )
                    })}
                  {noticias.filter(n => n.fuente.startsWith('@')).length === 0 && !cargando && (
                    <div className="pl-6 text-small text-ink-muted dark:text-ink-muted-dark italic py-4">
                      No hay actualizaciones recientes de las cuentas oficiales.
                    </div>
                  )}
                  {cargando && (
                    <div className="pl-6 space-y-4 py-2">
                      <div className="h-12 bg-rule/60 dark:bg-rule-dark/60 animate-pulse" />
                      <div className="h-12 bg-rule/60 dark:bg-rule-dark/60 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
