const TAG_META: Record<string, { label: string; color: string }> = {
  sismo:             { label: 'Sismo',            color: 'bg-crisis-red' },
  rescate:           { label: 'Rescate',          color: 'bg-orange-600' },
  desaparecidos:     { label: 'Desaparecidos',    color: 'bg-purple-600' },
  puntos_acopio:     { label: 'Puntos de acopio', color: 'bg-emerald-600' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',color: 'bg-blue-600' },
  replicas:          { label: 'Réplicas',         color: 'bg-amber-500' },
  donaciones:        { label: 'Donaciones',       color: 'bg-teal-600' },
  internacional:     { label: 'Internacional',    color: 'bg-slate-500' },
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

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  let stats = { total_aprobadas: 0, por_tag: {} as Record<string, number>, ultima_at: null as string | null }
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/stats`, { cache: 'no-store' })
    if (res.ok) stats = await res.json()
  } catch { /* fail silently */ }

  const maxTag = Math.max(...Object.values(stats.por_tag), 1)
  const tagEntries = Object.entries(TAG_META)

  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-8">
        <p className="text-eyebrow uppercase text-crisis-red mb-3">Indicadores del boletín</p>
        <h1 className="font-serif text-display text-ink dark:text-ink-dark">Reportes verificados por sección</h1>
        <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose">
          Distribución de los reportes confirmados desde el sismo del 24 de junio de 2026.
        </p>
      </header>

      {/* Total destacado */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-x-12 gap-y-4 items-end border-b border-rule dark:border-rule-dark pb-10">
        <div>
          <p className="font-serif text-[clamp(4rem,12vw,8rem)] leading-none font-semibold text-ink dark:text-ink-dark tnum">{stats.total_aprobadas}</p>
          <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mt-3">Reportes verificados en total</p>
        </div>
        <div className="sm:text-right">
          <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-1">Última actualización</p>
          <p className="font-serif text-headline text-ink dark:text-ink-dark">{tiempoRelativo(stats.ultima_at)}</p>
        </div>
      </section>

      {/* Tabla por sección */}
      <section>
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Distribución por sección</h2>
        <div className="border-t border-ink dark:border-ink-dark">
          {tagEntries.map(([tag, { label, color }]) => {
            const count = stats.por_tag[tag] ?? 0
            const pct = Math.round((count / maxTag) * 100)
            return (
              <div key={tag} className="grid grid-cols-[1fr,auto] sm:grid-cols-[14rem,1fr,auto] items-center gap-4 py-4 border-b border-rule dark:border-rule-dark">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <span className="text-small text-ink dark:text-ink-dark truncate">{label}</span>
                </div>
                <div className="hidden sm:block h-1.5 bg-rule/60 dark:bg-rule-dark rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <span className="font-serif text-headline text-ink dark:text-ink-dark tnum text-right tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
