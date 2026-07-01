'use client'
import { useEffect, useState, useCallback, useRef, useMemo, type Dispatch, type SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import NextImage from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import { MapaVenezuelaSVG } from './MapaVenezuelaSVG'

type Noticia = {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  fuente_tipo: 'rss' | 'x_twitter' | 'oficial'
  tag: string
  zona: string | null
  idioma: 'es' | 'en'
  publicado_at: string
  factcheck_confianza: number
  factcheck_status: string
  imagen_url: string | null
  tsunami?: boolean
  isNew?: boolean
  insertedAt?: number
}

const ZONAS: { value: string; label: string }[] = [
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

// Forma de `cifras` en la respuesta de /api/stats: por cada tipo de víctima,
// la cifra no-nula más reciente entre las noticias aprobadas, con su fecha y fuente.
type CifrasStats = {
  muertos: number | null
  muertos_at: string | null
  muertos_fuente: string | null
  heridos: number | null
  heridos_at: string | null
  heridos_fuente: string | null
  desaparecidos: number | null
  desaparecidos_at: string | null
  desaparecidos_fuente: string | null
}

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

// Share controls (WhatsApp · Telegram · copy link) shared by both card
// variants (image-hero and text-only). Hover-revealed; the copy button swaps
// to a check for 1.5s after copying. e.preventDefault/stopPropagation keep the
// clicks from following the card's own href.
function CardShareRow({ n, copiadoId, setCopiadoId }: {
  n: Noticia
  copiadoId: string | null
  setCopiadoId: Dispatch<SetStateAction<string | null>>
}) {
  return (
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
        aria-label="Copiar enlace"
        className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors px-2 py-1"
      >
        {copiadoId === n.id ? <CheckIcon /> : <LinkIcon />}
      </button>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

// Same outline-icon vocabulary as ThemeIcon/MenuIcon in Navbar.tsx:
// 14px, stroke=currentColor, strokeWidth 2, round caps/joins, no fill.
function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function TsunamiIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h20" />
      <path d="M2 16c4.5-2 4.5-6 9-6s4.5 4 9 6" />
      <path d="M2 8c4.5 2 4.5 6 9 6s4.5-4 9-6" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21h14" />
      <path d="M12 17V4" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

const HINT_ACCIONES_KEY = 'sismo-hint-acciones-v1'

// One-time, dismissible feature hint pointing at the alerts/export controls.
// Shown once per browser (localStorage flag), never reappears once closed.
function HintAcciones() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(HINT_ACCIONES_KEY)) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(HINT_ACCIONES_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-rule dark:border-rule-dark bg-panel dark:bg-panel-dark">
      <p className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide leading-relaxed">
        Activá <strong className="text-ink dark:text-ink-dark font-semibold">alertas</strong> para enterarte de réplicas al instante, o <strong className="text-ink dark:text-ink-dark font-semibold">exportá</strong> el boletín completo — los botones están arriba.
      </p>
      <button
        onClick={dismiss}
        aria-label="Cerrar aviso"
        className="shrink-0 p-1 rounded text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark hover:bg-rule/50 dark:hover:bg-rule-dark/50 transition-colors"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

// Shared chrome for the alerts/export controls — border + hover-fill match the
// existing rule/ink-muted gray tokens, same hover treatment as the theme-toggle
// button in Navbar.tsx (hover:bg-rule/50).
// flex-1 + justify-center: on mobile the two controls share their row at equal
// width (an even pair instead of floating at opposite edges); on desktop the
// portal slot sizes to content, so flex-1 is a no-op there.
const ACTION_BUTTON_CLASS =
  'flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3.5 py-2.5 rounded border border-rule dark:border-rule-dark ' +
  'font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark ' +
  'hover:text-ink dark:hover:text-ink-dark hover:bg-rule/50 dark:hover:bg-rule-dark/50 transition-colors whitespace-nowrap'

// Alerts + export controls. Rendered inline on mobile (its usual spot in the
// live-status bar) and via portal into the navbar's action slot on desktop —
// see #navbar-feed-actions in Navbar.tsx. Same handlers, two render targets.
function FeedActionButtons({
  notifPermiso,
  onActivar,
  exportado,
  onExportar,
}: {
  notifPermiso: NotificationPermission | 'unsupported'
  onActivar: () => void
  exportado: boolean
  onExportar: () => void
}) {
  return (
    <>
      {notifPermiso === 'default' && (
        <button onClick={onActivar} className={ACTION_BUTTON_CLASS}>
          <BellIcon />
          Activar alertas
        </button>
      )}
      {notifPermiso === 'granted' && (
        <span className={`${ACTION_BUTTON_CLASS} hover:bg-transparent dark:hover:bg-transparent hover:text-ink-muted dark:hover:text-ink-muted-dark cursor-default`}>
          <BellIcon />
          Alertas activas
        </span>
      )}
      <button onClick={onExportar} className={ACTION_BUTTON_CLASS}>
        {exportado ? <CheckIcon /> : <ExportIcon />}
        {exportado ? 'Copiado' : 'Exportar'}
      </button>
    </>
  )
}

function EmptyState({ error, degraded }: { error?: boolean; degraded?: boolean }) {
  return (
    <div className="py-16 px-6 border border-rule dark:border-rule-dark rounded-sm bg-panel/40 dark:bg-panel-dark/20">
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

function ResumenEvento({ cifras }: { cifras: CifrasStats | null }) {
  const [open, setOpen] = useState(true)

  // Los tres campos de víctimas vienen de /api/stats: la cifra no-nula más
  // reciente extraída por el fact-checker entre las noticias aprobadas. Magnitud,
  // segundos y epicentro son hechos fijos del evento (no cambian) y quedan estáticos.
  const datos = [
    { num: 'M7.2 + M7.5', label: 'Doblete sísmico', red: false },
    { num: '40 seg', label: 'Entre sismos', red: false },
    { num: 'Yaracuy / Carabobo', label: 'Epicentro', red: false },
    { num: cifras?.muertos != null ? `~${cifras.muertos.toLocaleString('es-VE')}` : '~920', label: 'Muertos (aprox.)', red: true },
    { num: cifras?.heridos != null ? `~${cifras.heridos.toLocaleString('es-VE')}` : '~3.360', label: 'Heridos', red: true },
    { num: cifras?.desaparecidos != null ? `+${cifras.desaparecidos.toLocaleString('es-VE')}` : '+50.000', label: 'Desaparecidos', red: true },
  ]

  // Cada cifra es el máximo reportado — puede venir de noticias distintas, así
  // que mostramos la fecha del reporte más antiguo entre las tres (el "peor caso"
  // de desactualización), no la más nueva, para no dar una falsa sensación de novedad.
  const fechas = [cifras?.muertos_at, cifras?.heridos_at, cifras?.desaparecidos_at].filter(Boolean) as string[]
  const masVieja = fechas.length ? fechas.sort()[0] : null
  const footer = masVieja
    ? `Cifras máximas extraídas automáticamente de noticias verificadas · reportadas ${tiempoRelativo(masVieja)}`
    : 'Cifras provisionales · 28 jun 2026 · Fuente: medios verificados'

  return (
    <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-4 rounded-sm mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors"
      >
        <span>Resumen del evento</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-center">
          <div className="lg:col-span-8 grid grid-cols-2 gap-x-6 gap-y-4">
            {datos.map(({ num, label, red }) => (
              <div key={label} className="border-l border-rule dark:border-rule-dark pl-4 py-1">
                <p className={`font-mono text-xl sm:text-2xl font-bold ${red ? 'text-crisis-red' : 'text-ink dark:text-ink-dark'}`}>{num}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mt-0.5">{label}</p>
              </div>
            ))}
            <p className="col-span-2 font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark mt-2">
              {footer}
            </p>
          </div>
          <div className="lg:col-span-4 w-full max-w-[375px] mx-auto">
            <MapaVenezuelaSVG />
          </div>
        </div>
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
  const [zonaActiva, setZonaActiva] = useState('todos')
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
  const [cifras, setCifras] = useState<CifrasStats | null>(null)

  // Feature 1: copy feedback per card
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  // Cards whose imagen_url failed to load — they fall back to the text layout.
  const [failedImg, setFailedImg] = useState<Set<string>>(new Set())
  // Feature 3: replica toast
  const [replicaToast, setReplicaToast] = useState<string | null>(null)
  // Feature 5: browser notifications
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission | 'unsupported'>('default')
  const notifPermisoRef = useRef<NotificationPermission | 'unsupported'>('default')
  // Feature 6: export feedback
  const [exportado, setExportado] = useState(false)
  // Desktop portal target — the navbar's action slot, found after mount.
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null)

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
    setActionsSlot(document.getElementById('navbar-feed-actions'))
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const d = await res.json()
        const ultima = d.ultima_at ? tiempoRelativo(d.ultima_at) : '—'
        setStatsLabel(`${d.total_aprobadas} noticias · última ${ultima}`)
        setCifras(d.cifras ?? null)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const buildUrl = useCallback((tag: string, zona: string, q: string, off: number, idioma: 'todos' | 'es' | 'en') => {
    const p = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
    if (tag !== 'todos') p.set('tag', tag)
    if (zona !== 'todos') p.set('zona', zona)
    if (q) p.set('q', q)
    if (idioma !== 'todos') p.set('lang', idioma)
    return `/api/feed?${p}`
  }, [])

  const cargar = useCallback(async (tag: string, q: string) => {
    setCargando(true)
    setError(null)
    setDegraded(false)
    try {
      const res = await fetch(buildUrl(tag, zonaActiva, q, 0, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
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
  }, [buildUrl, idiomaActivo, zonaActiva])

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hasMore) return
    setCargandoMas(true)
    try {
      const res = await fetch(buildUrl(tagActivo, zonaActiva, query, offset, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
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
  }, [buildUrl, tagActivo, query, offset, idiomaActivo, zonaActiva, cargandoMas, hasMore])

  useEffect(() => { cargar(tagActivo, query) }, [tagActivo, query, idiomaActivo, zonaActiva, cargar])

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
          new Notification('Réplica — Sismo Venezuela', {
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
      <div className="border-b border-rule dark:border-rule-dark px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-crisis-red animate-pulse shrink-0" />
          <span className="font-mono text-[11px] tracking-widest text-crisis-red uppercase shrink-0">En vivo</span>
          <span className="h-3 w-px bg-rule dark:bg-rule-dark shrink-0" />
          <span className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide truncate">
            Sismo Venezuela · 24 jun 2026
          </span>
        </div>
        <div className="flex items-center sm:justify-end gap-4 shrink-0">
          {statsLabel && (
            <span className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide hidden sm:block tnum">
              {statsLabel}
            </span>
          )}
          {/* Mobile fallback — on desktop these render inside the navbar instead
              (see #navbar-feed-actions portal below). The outer bar stacks to its
              own row on mobile (flex-col), so this gets clean breathing room
              instead of wrapping awkwardly under the live-status line. */}
          <div className="sm:hidden flex items-center gap-3 w-full">
            <FeedActionButtons
              notifPermiso={notifPermiso}
              onActivar={() => Notification.requestPermission().then(p => setNotifPermiso(p))}
              exportado={exportado}
              onExportar={handleExportar}
            />
          </div>
        </div>
      </div>

      {actionsSlot && createPortal(
        <FeedActionButtons
          notifPermiso={notifPermiso}
          onActivar={() => Notification.requestPermission().then(p => setNotifPermiso(p))}
          exportado={exportado}
          onExportar={handleExportar}
        />,
        actionsSlot
      )}

      <HintAcciones />

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
                  className={`relative font-mono text-[10px] uppercase tracking-widest shrink-0 pb-2.5 transition-colors ${
                    active
                      ? text
                      : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                  }`}
                >
                  {short}
                  {active && (
                    <motion.span
                      layoutId="feed-tag-underline"
                      className="absolute left-0 right-0 -bottom-px h-0.5 bg-crisis-red"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
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
                    : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          {/* Filtro de zona */}
          <div className="shrink-0 pb-2">
            <label htmlFor="zona" className="sr-only">Zona geográfica</label>
            <select
              id="zona"
              value={zonaActiva}
              onChange={e => setZonaActiva(e.target.value)}
              className="font-mono text-[11px] uppercase tracking-widest bg-transparent text-ink dark:text-ink-dark border-b-2 border-rule dark:border-rule-dark pb-0.5 pr-6 focus:border-crisis-red focus:outline-none cursor-pointer"
            >
              {ZONAS.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
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
            className="w-full pl-5 pr-4 py-2.5 font-mono text-[11px] tracking-wide bg-transparent border-b border-rule dark:border-rule-dark text-ink dark:text-ink-dark placeholder-ink-muted/50 dark:placeholder-ink-muted-dark/50 focus:border-ink-muted/70 dark:focus:border-ink-muted-dark/70 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 sm:px-6 py-6">
        {/* Feature 2: widget resumen del evento */}
        <ResumenEvento cifras={cifras} />

        {query && total !== null && (
          <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark tracking-widest uppercase mb-4 tnum">
            {total} resultado{total !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Banner nuevas noticias */}
        <AnimatePresence>
          {nuevasCount > 0 && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="w-full overflow-hidden py-2 font-mono text-[11px] uppercase tracking-widest text-white bg-crisis-red hover:bg-crisis-red-dark transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {nuevasCount} nuevo{nuevasCount > 1 ? 's' : ''} reporte{nuevasCount > 1 ? 's' : ''} — ver arriba
            </motion.button>
          )}
        </AnimatePresence>

        {error && <EmptyState error />}

        {/* Grid de cards */}
        {cargando ? (
          // Mirrors the hero card (image block on top + text below) so the grid
          // doesn't reflow when the feed arrives.
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark rounded-sm overflow-hidden">
                {/* Image block on top mirrors the hero card (~82% carry an image). */}
                <div className="aspect-[16/10] w-full skeleton" />
                <div className="px-4 pt-2.5 pb-4">
                  <div className="h-2.5 w-28 rounded skeleton mb-3" />
                  <div className="h-3 w-full rounded skeleton mb-1.5" />
                  <div className="h-3 w-2/3 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : noticias.length === 0 && !error ? (
          <EmptyState degraded={degraded} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence initial={false}>
              {noticias.map((n, i) => {
                const meta = TAG_META[n.tag]
                const hasImage = Boolean(n.imagen_url) && !failedImg.has(n.id)
                return (
                  <motion.a
                    key={n.id}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    className={`
                      group block bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark rounded-sm
                      overflow-hidden hover:bg-ink/[0.01] dark:hover:bg-ink-dark/[0.01] hover:border-crisis-red/30 transition-all duration-200
                      ${isNuevo(n) ? 'ring-1 ring-inset ring-crisis-red/30' : ''}
                    `}
                  >
                    {hasImage ? (
                      // Variante con imagen: foto arriba, texto y titular abajo en el cuerpo de la tarjeta.
                      <>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-rule/40 dark:bg-[#0D0D0D]">
                          <NextImage
                            src={n.imagen_url as string}
                            alt={n.titulo}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                            onError={() => setFailedImg(prev => {
                              const s = new Set(prev)
                              s.add(n.id)
                              return s
                            })}
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                          />
                          {/* Tag chip sobre la foto */}
                          <span className={`absolute top-2.5 left-2.5 font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-panel/80 dark:bg-panel-dark/80 backdrop-blur-sm ${meta?.text ?? 'text-ink-muted dark:text-ink-muted-dark'}`}>
                            {meta?.short ?? n.tag}
                          </span>
                          {n.tsunami && (
                            <span className="absolute top-2.5 right-2.5 font-mono text-[10px] uppercase tracking-widest text-crisis-red flex items-center gap-1 px-1.5 py-0.5 bg-panel/80 dark:bg-panel-dark/80 backdrop-blur-sm" title="Alerta de tsunami">
                              <TsunamiIcon /> Tsunami
                            </span>
                          )}
                        </div>
                        <div className="px-4 pt-3.5 pb-4">
                          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark tracking-wide tnum">
                            <span className="truncate">{fuenteLabel(n.fuente_tipo, n.fuente)} · {tiempoRelativo(n.publicado_at)}</span>
                            {isNuevo(n) && <span className="ml-auto shrink-0 uppercase tracking-widest text-crisis-red">Nuevo</span>}
                          </div>
                          <h2 className="font-serif font-semibold text-[1.05rem] leading-snug text-ink dark:text-ink-dark group-hover:text-crisis-red transition-colors mb-2">
                            {n.titulo}
                          </h2>
                          {n.descripcion && (
                            <p className="text-xs text-ink-muted dark:text-ink-muted-dark line-clamp-2">{n.descripcion}</p>
                          )}
                          <CardShareRow n={n} copiadoId={copiadoId} setCopiadoId={setCopiadoId} />
                        </div>
                      </>
                    ) : (
                      // Variante solo-texto: noticias sin imagen o con imagen fallida.
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${meta?.text ?? 'text-ink-muted dark:text-ink-muted-dark'}`}>
                            {meta?.short ?? n.tag}
                          </span>
                          {n.tsunami && (
                            <span className="font-mono text-[10px] uppercase tracking-widest text-crisis-red flex items-center gap-1" title="Alerta de tsunami">
                              <TsunamiIcon /> Tsunami
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark tracking-wide tnum truncate text-right ml-auto">
                            {fuenteLabel(n.fuente_tipo, n.fuente)} · {tiempoRelativo(n.publicado_at)}
                          </span>
                        </div>
                        <h2 className="font-serif font-semibold text-[1.05rem] leading-snug text-ink dark:text-ink-dark group-hover:text-crisis-red transition-colors mb-2">
                          {n.titulo}
                        </h2>
                        {n.descripcion && (
                          <p className="text-xs text-ink-muted dark:text-ink-muted-dark line-clamp-2">{n.descripcion}</p>
                        )}
                        {isNuevo(n) && (
                          <span className="inline-block mt-1.5 font-mono text-[10px] uppercase tracking-widest text-crisis-red">Nuevo</span>
                        )}
                        <CardShareRow n={n} copiadoId={copiadoId} setCopiadoId={setCopiadoId} />
                      </div>
                    )}
                  </motion.a>
                )
              })}
              </AnimatePresence>
            </div>

            {/* Sentinel de infinite scroll */}
            <div ref={sentinelRef} className="py-8 text-center">
              {cargandoMas && (
                <div className="inline-block w-4 h-4 border border-rule dark:border-rule-dark border-t-crisis-red rounded-full animate-spin" />
              )}
              {!hasMore && noticias.length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">Fin del feed</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Feature 3: toast de réplica (fixed) */}
      <AnimatePresence>
        {replicaToast && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 24, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-1/2 z-50 w-[90vw] max-w-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-50 rounded-sm shadow-lg"
        >
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-widest font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangleIcon />
                Réplica detectada
              </p>
              <p className="text-sm font-serif mt-1 leading-snug">
                {replicaToast}
              </p>
            </div>
            <button
              onClick={() => setReplicaToast(null)}
              aria-label="Cerrar aviso de réplica"
              className="text-current shrink-0 hover:opacity-70 transition-opacity"
            >
              <CloseIcon />
            </button>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
