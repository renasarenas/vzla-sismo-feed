'use client'

import { useEffect, useState } from 'react'

type TagInfo = { label: string; hex: string; pillBg: string; pillFg: string; bar: string }

const TAG_META: Record<string, TagInfo> = {
  sismo:             { label: 'Sismo',             hex: '#CF1020', pillBg: 'bg-[#CF1020]/10', pillFg: 'text-[#8A0E15] dark:text-[#F09595]', bar: 'bg-[#CF1020]' },
  rescate:           { label: 'Rescate',           hex: '#F97316', pillBg: 'bg-[#F97316]/10', pillFg: 'text-[#9A3412] dark:text-[#FDBA74]', bar: 'bg-[#F97316]' },
  desaparecidos:     { label: 'Desaparecidos',     hex: '#A855F7', pillBg: 'bg-[#A855F7]/10', pillFg: 'text-[#6B21A8] dark:text-[#D8B4FE]', bar: 'bg-[#A855F7]' },
  puntos_acopio:     { label: 'Puntos de acopio',  hex: '#22C55E', pillBg: 'bg-[#22C55E]/10', pillFg: 'text-[#166534] dark:text-[#86EFAC]', bar: 'bg-[#22C55E]' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria', hex: '#3B82F6', pillBg: 'bg-[#3B82F6]/10', pillFg: 'text-[#1E40AF] dark:text-[#93C5FD]', bar: 'bg-[#3B82F6]' },
  replicas:          { label: 'Réplicas',          hex: '#EAB308', pillBg: 'bg-[#EAB308]/10', pillFg: 'text-[#854D0E] dark:text-[#FDE047]', bar: 'bg-[#EAB308]' },
  donaciones:        { label: 'Donaciones',        hex: '#14B8A6', pillBg: 'bg-[#14B8A6]/10', pillFg: 'text-[#115E59] dark:text-[#5EEAD4]', bar: 'bg-[#14B8A6]' },
  internacional:     { label: 'Internacional',     hex: '#94A3B8', pillBg: 'bg-[#94A3B8]/10', pillFg: 'text-[#334155] dark:text-[#CBD5E1]', bar: 'bg-[#94A3B8]' },
}

type CifraCampo = { valor: number | null; at: string | null; fuente: string | null }
type Stats = {
  total_aprobadas: number
  por_tag: Record<string, number>
  ultima_at: string | null
  cifras: {
    muertos: number | null; muertos_at: string | null; muertos_fuente: string | null
    heridos: number | null; heridos_at: string | null; heridos_fuente: string | null
    desaparecidos: number | null; desaparecidos_at: string | null; desaparecidos_fuente: string | null
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

function CifraCard({ label, campo, colorText }: { label: string; campo: CifraCampo; colorText: string }) {
  return (
    <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark border-l-[3px] border-l-crisis-red p-5">
      <p className={`font-serif text-4xl sm:text-5xl font-semibold tnum ${colorText}`}>
        {campo.valor != null ? campo.valor.toLocaleString('es-VE') : '—'}
      </p>
      <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mt-2">{label}</p>
      {campo.at && (
        <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark mt-2">
          {campo.fuente ? `${campo.fuente} · ` : ''}{tiempoRelativo(campo.at)}
        </p>
      )}
    </div>
  )
}

// Pure-CSS donut (conic-gradient) so the category mix reads at a glance instead
// of as a column of numbers — no charting library needed for one ring.
function DonaCategorias({ porTag, total }: { porTag: Record<string, number>; total: number }) {
  const entries = Object.entries(TAG_META).map(([tag, meta]) => ({ tag, meta, count: porTag[tag] ?? 0 }))
  let acc = 0
  const stops = entries.map(({ meta, count }) => {
    const pct = total > 0 ? (count / total) * 100 : 0
    const start = acc
    acc += pct
    return `${meta.hex} ${start}% ${acc}%`
  })
  const gradient = total > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(var(--tw-gradient-stops, #E2E1DC) 0% 100%)'

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <div
        className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shrink-0"
        style={{ background: gradient }}
        role="img"
        aria-label="Distribución de reportes por categoría"
      >
        <div className="absolute inset-[18%] rounded-full bg-paper dark:bg-paper-dark flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-semibold tnum">{total}</span>
          <span className="text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">reportes</span>
        </div>
      </div>
      <ul className="flex-1 min-w-[220px] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {entries.filter(e => e.count > 0).map(({ tag, meta, count }) => (
          <li key={tag} className="flex items-center justify-between gap-3 text-small">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.hex }} aria-hidden="true" />
              <span className="truncate text-ink dark:text-ink-dark">{meta.label}</span>
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
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0) // forces the "hace Xm" labels to re-render between fetches

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch('/api/stats', { signal: controller.signal })
        if (res.ok) setStats(await res.json())
      } catch { /* keep last known good stats */ } finally {
        setLoading(false)
      }
    }
    load()
    const refreshId = setInterval(load, 30_000)
    const tickId = setInterval(() => setTick(t => t + 1), 30_000)
    return () => { controller.abort(); clearInterval(refreshId); clearInterval(tickId) }
  }, [])

  const total = stats?.total_aprobadas ?? 0
  const porTag = stats?.por_tag ?? {}
  const cifras = stats?.cifras
  void tick // referenced only to trigger the periodic re-render for relative timestamps

  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-eyebrow uppercase text-crisis-red mb-3">Indicadores del boletín</p>
          <h1 className="font-serif text-display text-ink dark:text-ink-dark">Reportes verificados por sección</h1>
          <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose">
            Distribución de los reportes confirmados desde el sismo del 24 de junio de 2026.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">
          <span className={`w-1.5 h-1.5 rounded-full bg-crisis-red ${loading ? '' : 'animate-pulse'}`} />
          Actualiza solo · última {tiempoRelativo(stats?.ultima_at ?? null)}
        </div>
      </header>

      {/* Cifras del evento — mismos datos que el boletín, cifra más alta reportada
          por fuentes verificadas, no un conteo aparte. */}
      {cifras && (
        <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CifraCard label="Muertos (aprox.)" colorText="text-crisis-red" campo={{ valor: cifras.muertos, at: cifras.muertos_at, fuente: cifras.muertos_fuente }} />
          <CifraCard label="Heridos" colorText="text-crisis-red" campo={{ valor: cifras.heridos, at: cifras.heridos_at, fuente: cifras.heridos_fuente }} />
          <CifraCard label="Desaparecidos" colorText="text-crisis-red" campo={{ valor: cifras.desaparecidos, at: cifras.desaparecidos_at, fuente: cifras.desaparecidos_fuente }} />
        </section>
      )}

      <section className="mb-12 border-b border-rule dark:border-rule-dark pb-10">
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-5">Reportes verificados en total</h2>
        <DonaCategorias porTag={porTag} total={total} />
      </section>

      <section>
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Distribución por sección</h2>
        <div className="border-t border-ink dark:border-ink-dark">
          {Object.entries(TAG_META).map(([tag, meta]) => {
            const count = porTag[tag] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={tag} className="grid grid-cols-[1fr,auto] sm:grid-cols-[14rem,1fr,auto] items-center gap-4 py-4 border-b border-rule dark:border-rule-dark">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide w-fit ${meta.pillBg} ${meta.pillFg}`}>
                  {meta.label}
                </span>
                <div className="hidden sm:block h-1.5 bg-rule/60 dark:bg-rule-dark rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="font-serif text-headline text-ink dark:text-ink-dark tnum text-right tabular-nums">
                  {count} <span className="text-small text-ink-muted dark:text-ink-muted-dark">· {pct}%</span>
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
