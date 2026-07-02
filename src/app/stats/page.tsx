'use client'

import { useEffect, useState } from 'react'
import { SismoTrace } from '@/components/CardImage'

const TAG_COLORS: Record<string, string> = {
  sismo: '#CF1020',
  rescate: '#F97316',
  desaparecidos: '#A855F7',
  puntos_acopio: '#22C55E',
  ayuda_humanitaria: '#3B82F6',
  replicas: '#EAB308',
  donaciones: '#14B8A6',
  internacional: '#94A3B8',
}

const TAG_META: Record<string, { label: string }> = {
  sismo:             { label: 'Sismo' },
  rescate:           { label: 'Rescate' },
  desaparecidos:     { label: 'Desaparecidos' },
  puntos_acopio:     { label: 'Puntos de acopio' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria' },
  replicas:          { label: 'Réplicas' },
  donaciones:        { label: 'Donaciones' },
  internacional:     { label: 'Internacional' },
}

type Stats = {
  total_aprobadas: number
  por_tag: Record<string, number>
  ultima_at: string | null
  cifras: {
    muertos: number | null
    muertos_at: string | null
    muertos_fuente: string | null
    heridos: number | null
    heridos_at: string | null
    heridos_fuente: string | null
    desaparecidos: number | null
    desaparecidos_at: string | null
    desaparecidos_fuente: string | null
  } | null
}

function tiempoRelativo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

// Pure-CSS donut (conic-gradient) so the category mix reads at a glance instead
// of as a column of numbers — no charting library needed for one ring. Uses the
// same TAG_COLORS dots as the section table below so both read as one palette.
function DonaCategorias({ porTag, total }: { porTag: Record<string, number>; total: number }) {
  const entries = Object.entries(TAG_META).map(([tag, { label }]) => ({
    tag,
    label,
    hex: TAG_COLORS[tag] ?? '#94A3B8',
    count: porTag[tag] ?? 0,
  }))
  let acc = 0
  const stops = entries.map(({ hex, count }) => {
    const pct = total > 0 ? (count / total) * 100 : 0
    const start = acc
    acc += pct
    return `${hex} ${start}% ${acc}%`
  })
  const gradient = total > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#9CA3AF 0% 100%)'

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <div
        className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shrink-0"
        style={{ background: gradient }}
        role="img"
        aria-label="Distribución de reportes por categoría"
      >
        <div className="absolute inset-[18%] rounded-full bg-paper dark:bg-paper-dark flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-semibold tnum text-ink dark:text-ink-dark">{total}</span>
          <span className="text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">reportes</span>
        </div>
      </div>
      <ul className="flex-1 min-w-[220px] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {entries.filter(e => e.count > 0).map(({ tag, label, hex, count }) => (
          <li key={tag} className="flex items-center justify-between gap-3 text-small">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: hex }} aria-hidden="true" />
              <span className="truncate text-ink dark:text-ink-dark">{label}</span>
            </span>
            <span className="font-mono text-ink-muted dark:text-ink-muted-dark tnum shrink-0">
              {count} · {total > 0 ? Math.round((count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  // tick forces the "hace Xm" labels to re-render between fetches
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store', signal: controller.signal })
        if (res.ok) setStats(await res.json())
      } catch { /* keep last known good stats */ }
    }
    load()
    const refreshId = setInterval(load, 30_000)
    const tickId = setInterval(() => setTick(t => t + 1), 30_000)
    return () => { controller.abort(); clearInterval(refreshId); clearInterval(tickId) }
  }, [])
  void tick // referenced only to trigger periodic re-render of relative timestamps

  const total = stats?.total_aprobadas ?? 0
  const porTag = stats?.por_tag ?? {}
  const cifras = stats?.cifras ?? null
  const ultimaAt = stats?.ultima_at ?? null
  const maxTag = Math.max(...Object.values(porTag), 1)
  const tagEntries = Object.entries(TAG_META)

  if (stats === null) {
    return (
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-32 flex flex-col items-center justify-center gap-4">
        <SismoTrace animated className="w-40 h-12 text-crisis-red/50 dark:text-crisis-red/60" />
        <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark animate-pulse animate-duration-1000">
          Cargando indicadores…
        </p>
      </main>
    )
  }


  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
      {/* Header */}
      <header className="border-b border-rule dark:border-rule-dark pb-6 mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="font-mono text-[10px] uppercase tracking-widest text-crisis-red mb-3 font-semibold">
            Monitoreo e Indicadores
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">
            <span className={`w-1.5 h-1.5 rounded-full bg-crisis-red ${stats ? 'animate-pulse' : ''}`} />
            Actualiza solo · última {tiempoRelativo(ultimaAt)}
          </div>
        </div>
        <h1 className="font-serif text-hero lg:text-masthead text-ink dark:text-ink-dark leading-none">
          Reportes verificados por sección
        </h1>
        <p className="text-lead text-ink/75 dark:text-ink-dark/75 mt-4 max-w-prose">
          Distribución de los reportes confirmados y balance oficial de daños desde el sismo del 24 de junio de 2026.
        </p>
      </header>

      {/* Balance de víctimas (si existen cifras cargadas) */}
      {cifras && (cifras.muertos !== null || cifras.heridos !== null || cifras.desaparecidos !== null) && (
        <section className="mb-14">
          <div className="flex flex-col mb-6">
            <h2 className="font-serif text-display text-ink dark:text-ink-dark">
              Balance oficial de daños
            </h2>
            <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
              Últimas cifras consolidadas extraídas de boletines oficiales de organismos de socorro.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fallecidos */}
            <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm flex flex-col justify-between shadow-soft">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark bg-paper dark:bg-paper-dark px-1.5 py-0.5 rounded-sm">
                  Fallecidos
                </span>
                <p className="font-serif text-hero lg:text-display text-ink dark:text-ink-dark mt-4 mb-2 font-semibold tnum">
                  {cifras.muertos !== null ? Intl.NumberFormat('es-VE').format(cifras.muertos) : '—'}
                </p>
              </div>
              {cifras.muertos_fuente && (
                <div className="font-mono text-[9px] text-ink-muted/80 dark:text-ink-muted-dark/80 uppercase tracking-wider">
                  Fuente: {cifras.muertos_fuente} · {tiempoRelativo(cifras.muertos_at)}
                </div>
              )}
            </div>

            {/* Heridos */}
            <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm flex flex-col justify-between shadow-soft">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark bg-paper dark:bg-paper-dark px-1.5 py-0.5 rounded-sm">
                  Heridos
                </span>
                <p className="font-serif text-hero lg:text-display text-ink dark:text-ink-dark mt-4 mb-2 font-semibold tnum">
                  {cifras.heridos !== null ? Intl.NumberFormat('es-VE').format(cifras.heridos) : '—'}
                </p>
              </div>
              {cifras.heridos_fuente && (
                <div className="font-mono text-[9px] text-ink-muted/80 dark:text-ink-muted-dark/80 uppercase tracking-wider">
                  Fuente: {cifras.heridos_fuente} · {tiempoRelativo(cifras.heridos_at)}
                </div>
              )}
            </div>

            {/* Desaparecidos */}
            <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 rounded-sm flex flex-col justify-between shadow-soft">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark bg-paper dark:bg-paper-dark px-1.5 py-0.5 rounded-sm">
                  Desaparecidos
                </span>
                <p className="font-serif text-hero lg:text-display text-ink dark:text-ink-dark mt-4 mb-2 font-semibold tnum">
                  {cifras.desaparecidos !== null ? Intl.NumberFormat('es-VE').format(cifras.desaparecidos) : '—'}
                </p>
              </div>
              {cifras.desaparecidos_fuente && (
                <div className="font-mono text-[9px] text-ink-muted/80 dark:text-ink-muted-dark/80 uppercase tracking-wider">
                  Fuente: {cifras.desaparecidos_fuente} · {tiempoRelativo(cifras.desaparecidos_at)}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Resumen del Boletín */}
      <section className="mb-14">
        <div className="flex flex-col mb-6">
          <h2 className="font-serif text-display text-ink dark:text-ink-dark">
            Reportes en el sistema
          </h2>
          <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
            Cantidad total de informaciones verificadas y consolidadas por el boletín.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-6 rounded-sm flex justify-between items-center shadow-soft">
            <div>
              <p className="font-serif text-[clamp(3.5rem,10vw,5.5rem)] leading-none font-semibold text-ink dark:text-ink-dark tnum">
                {total}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-muted/90 dark:text-ink-muted-dark/90 mt-3 font-semibold">
                Total de reportes aprobados
              </p>
            </div>
          </div>
          <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-6 rounded-sm flex flex-col justify-center shadow-soft">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mb-2">
              Último reporte verificado
            </span>
            <p className="font-serif text-headline text-ink dark:text-ink-dark">
              {tiempoRelativo(ultimaAt)}
            </p>
            <span className="font-mono text-[8px] text-ink-muted/70 dark:text-ink-muted-dark/70 uppercase tracking-widest mt-2">
              Ingesta automática cada 5 minutos
            </span>
          </div>
        </div>
      </section>

      {/* Mezcla por categoría — donut de un vistazo */}
      <section className="mb-14">
        <div className="flex flex-col mb-6">
          <h2 className="font-serif text-display text-ink dark:text-ink-dark">
            Mezcla por categoría
          </h2>
          <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
            Proporción de los reportes verificados según su categoría temática.
          </p>
        </div>
        <DonaCategorias porTag={porTag} total={total} />
      </section>

      {/* Tabla por sección */}
      <section className="mb-12">
        <div className="flex flex-col mb-6">
          <h2 className="font-serif text-display text-ink dark:text-ink-dark">
            Distribución por sección
          </h2>
          <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
            Volumen de informaciones publicadas clasificadas por categoría temática.
          </p>
        </div>
        <div className="border-t border-rule dark:border-rule-dark">
          {tagEntries.map(([tag, { label }]) => {
            const count = porTag[tag] ?? 0
            const pct = Math.round((count / maxTag) * 100)
            const tagColor = TAG_COLORS[tag] ?? '#94A3B8'
            return (
              <div
                key={tag}
                className="grid grid-cols-[1fr,auto] sm:grid-cols-[14rem,1fr,auto] items-center gap-4 py-4 border-b border-rule dark:border-rule-dark px-2 hover:bg-ink/[0.01] dark:hover:bg-ink-dark/[0.01] transition-colors rounded-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tagColor }}
                  />
                  <span className="text-small font-serif font-semibold text-ink dark:text-ink-dark truncate">
                    {label}
                  </span>
                </div>
                <div className="hidden sm:block h-1 bg-rule/50 dark:bg-rule-dark/50 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${pct}%`, backgroundColor: tagColor }}
                  />
                </div>
                <span className="font-serif text-headline text-ink dark:text-ink-dark tnum text-right tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
