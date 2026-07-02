'use client'

// Shared loading block: centered flex-col wrapper + animated seismogram trace
// + caption. This exact block was copy-pasted across loading.tsx, mapa/page.tsx,
// stats/page.tsx, MapaEdificios3D.tsx and SismosUSGS.tsx — consolidated here so
// there's a single place to tweak the loading motif.
import { SismoTrace } from './CardImage'

export function SismoLoading({
  caption,
  className = 'flex flex-col items-center justify-center gap-4',
  captionClassName = 'text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark',
}: {
  caption: string
  className?: string
  captionClassName?: string
}) {
  return (
    <div className={className}>
      <SismoTrace animated className="w-40 h-12 text-crisis-red/50 dark:text-crisis-red/60" />
      <p className={captionClassName}>{caption}</p>
    </div>
  )
}
