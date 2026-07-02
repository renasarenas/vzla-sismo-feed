'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { TAG_MUTED_PILL as TAG_PILL } from '@/lib/tags'

type NoticiaRail = {
  id: string
  titulo: string
  url: string
  tag: string
  publicado_at: string
}

function tiempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function RailCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-4">
      <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-3 flex items-center gap-2">{title}</p>
      {children}
    </div>
  )
}

function RailItem({ n }: { n: NoticiaRail }) {
  const meta = TAG_PILL[n.tag]
  return (
    <li className="pb-3 border-b border-rule dark:border-rule-dark last:pb-0 last:border-0">
      {meta && (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide mb-1.5 ${meta.bg} ${meta.fg}`}>
          {meta.label}
        </span>
      )}
      <a href={n.url} target="_blank" rel="noopener noreferrer" className="block font-serif text-sm leading-snug text-ink dark:text-ink-dark hover:text-crisis-red transition-colors">
        {n.titulo}
      </a>
      <span className="block font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark mt-1">{tiempoRelativo(n.publicado_at)}</span>
    </li>
  )
}

// Fills the dead margin next to the centered layout on ultra-wide screens (roughly
// 2050px+, where a max-w-8xl column leaves 300px+ of empty space on each side).
// Hidden entirely below that width, so phones/tablets/laptops are unaffected.
//
// Both lists are pulled from the same live /api/feed the rest of the site already
// uses — no invented "most read" ranking, since there's no view-tracking to back
// that up. Left = most recent reports overall; right = active tremor/tsunami alerts.
export function SideRails() {
  const pathname = usePathname()
  const [recientes, setRecientes] = useState<NoticiaRail[]>([])
  const [alertas, setAlertas] = useState<NoticiaRail[]>([])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch('/api/feed?limit=5', { signal: controller.signal }).then(r => r.ok ? r.json() : null),
      fetch('/api/feed?tag=replicas&limit=5', { signal: controller.signal }).then(r => r.ok ? r.json() : null),
    ]).then(([feed, replicas]) => {
      if (feed?.noticias) setRecientes(feed.noticias)
      if (replicas?.noticias) setAlertas(replicas.noticias)
    }).catch(() => {})
    return () => controller.abort()
  }, [pathname])

  if (recientes.length === 0 && alertas.length === 0) return null

  return (
    <>
      {recientes.length > 0 && (
        <aside className="hidden min-[2200px]:block fixed top-32 left-10 w-64 z-30">
          <RailCard title={<><span className="w-1.5 h-1.5 rounded-full bg-crisis-red animate-pulse" />Últimas actualizaciones</>}>
            <ul>{recientes.slice(0, 5).map(n => <RailItem key={n.id} n={n} />)}</ul>
          </RailCard>
        </aside>
      )}
      <aside className="hidden min-[2200px]:block fixed top-32 right-10 w-64 z-30">
        <RailCard title="Réplicas y alertas">
          {alertas.length > 0 ? (
            <ul>{alertas.slice(0, 5).map(n => <RailItem key={n.id} n={n} />)}</ul>
          ) : (
            <p className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark">Sin réplicas reportadas por ahora.</p>
          )}
        </RailCard>
      </aside>
    </>
  )
}
