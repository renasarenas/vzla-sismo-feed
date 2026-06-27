const TAG_META: Record<string, { label: string; color: string }> = {
  sismo:             { label: 'Sismo',            color: 'bg-red-500' },
  rescate:           { label: 'Rescate',          color: 'bg-orange-500' },
  desaparecidos:     { label: 'Desaparecidos',    color: 'bg-purple-500' },
  puntos_acopio:     { label: 'Puntos de acopio', color: 'bg-green-500' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',color: 'bg-blue-500' },
  replicas:          { label: 'Réplicas',         color: 'bg-yellow-500' },
  donaciones:        { label: 'Donaciones',       color: 'bg-teal-500' },
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Total destacado */}
      <div className="text-center mb-8">
        <p className="text-6xl font-bold text-gray-900 dark:text-white">{stats.total_aprobadas}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">noticias verificadas</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Última {tiempoRelativo(stats.ultima_at)}
        </p>
      </div>

      {/* Grid por tag */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(TAG_META).map(([tag, { label, color }]) => {
          const count = stats.por_tag[tag] ?? 0
          const pct = Math.round((count / maxTag) * 100)
          return (
            <div key={tag} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{count}</p>
              <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
