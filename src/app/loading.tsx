// Page-level loading: seismograph trace drawing animation (matches the
// loading motif used across all cards and sections).
import { SismoTrace } from '@/components/CardImage'

export default function Loading() {
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-20 flex flex-col items-center justify-center gap-4">
      <SismoTrace animated className="w-40 h-12 text-crisis-red/50 dark:text-crisis-red/60" />
      <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Cargando boletín…</p>
    </div>
  )
}
