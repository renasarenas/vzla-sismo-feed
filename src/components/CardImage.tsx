'use client'

// Shared image lifecycle for news cards. While the (hotlinked, unoptimized)
// image decodes, the slot shows the skeleton shimmer plus the signature
// seismograph trace drawing itself in a loop — the same motif used by the
// masthead and the no-image placeholder. The image then crossfades in.
// On error: calls onError when the caller manages the failure (e.g. the
// boletín grid falls back to its text layout), otherwise renders the static
// placeholder in place.

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'

// Signature seismogram path (same trace as the Navbar masthead motif).
// pathLength=1 normalizes the dash math so the drawing animation works at
// any rendered size; vectorEffect keeps the stroke width constant when the
// viewBox is stretched with preserveAspectRatio="none".
export function SismoTrace({ className = '', animated = false, style }: { className?: string; animated?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 24" className={className} style={style} fill="none" aria-hidden="true" preserveAspectRatio="none">
      <path
        d="M0 12 H10 L13 12 L16 4 L19 20 L22 8 L25 16 L28 12 H40 L43 6 L46 18 L49 12 H64"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={animated ? 1 : undefined}
        className={animated ? 'sismo-draw' : undefined}
      />
    </svg>
  )
}

// Empty state for cards without a photo: seismogram chart paper — a fine
// theme-aware grid, the trace stretched across the full slot, and a small
// mono caption. Hovering the card tints the trace with the crisis accent,
// matching the previous placeholder behaviour.
export function SismoPlaceholder({ caption = 'Sin imagen' }: { caption?: string }) {
  return (
    <div className="absolute inset-0 sismo-paper bg-gradient-to-br from-paper/20 to-paper/60 dark:from-[#1C1C1F]/10 dark:to-[#1C1C1F]/40">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <SismoTrace className="w-full h-12 text-ink-muted/30 dark:text-ink-muted-dark/25 group-hover:text-crisis-red/30 transition-colors duration-500" />
      </div>
      <span className="absolute inset-x-0 bottom-2.5 text-center font-mono text-[9px] uppercase tracking-widest text-ink-muted/60 dark:text-ink-muted-dark/50 select-none">
        {caption}
      </span>
    </div>
  )
}

export default function CardImage({ src, alt, priority = false, sizes, imgClassName = '', onError }: {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
  imgClassName?: string
  onError?: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Images already in cache can complete before React attaches onLoad.
  // naturalWidth guards against cached *failures*, where complete is also true.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true)
  }, [])

  if (failed) return <SismoPlaceholder />

  return (
    <>
      {!loaded && (
        <>
          <div className="absolute inset-0 skeleton" style={{ zIndex: 5 }} />
          <div className="absolute inset-0 sismo-paper bg-gradient-to-br from-paper/20 to-paper/60 dark:from-[#1C1C1F]/10 dark:to-[#1C1C1F]/40" style={{ zIndex: 6 }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 7 }}>
            <SismoTrace animated className="w-40 h-12 text-crisis-red/50 dark:text-crisis-red/60" />
          </div>
        </>
      )}
      <NextImage
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => (onError ? onError() : setFailed(true))}
        className={`object-cover transition-[opacity,transform] duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </>
  )
}

export function getDotColorClass(tag: string): string {
  switch (tag) {
    case 'sismo':             return 'bg-[#CF1020] dark:bg-[#EF4444]'
    case 'rescate':           return 'bg-[#F97316] dark:bg-[#FB923C]'
    case 'desaparecidos':     return 'bg-[#A855F7] dark:bg-[#C084FC]'
    case 'puntos_acopio':     return 'bg-[#22C55E] dark:bg-[#4ADE80]'
    case 'ayuda_humanitaria': return 'bg-[#3B82F6] dark:bg-[#60A5FA]'
    case 'replicas':          return 'bg-[#EAB308] dark:bg-[#FACC15]'
    case 'donaciones':        return 'bg-[#14B8A6] dark:bg-[#2DD4BF]'
    case 'internacional':     return 'bg-[#94A3B8] dark:bg-[#CBD5E1]'
    default:                  return 'bg-ink-muted'
  }
}

const TAG_SHORT_NAMES: Record<string, string> = {
  todos: 'Todas',
  sismo: 'Sismo',
  rescate: 'Rescate',
  desaparecidos: 'Desap.',
  puntos_acopio: 'Acopio',
  ayuda_humanitaria: 'Ayuda',
  replicas: 'Réplicas',
  donaciones: 'Donar',
  internacional: 'Int.',
}

export function TagPill({ tag }: { tag: string }) {
  const shortName = TAG_SHORT_NAMES[tag] ?? tag
  const dotColor = getDotColorClass(tag)
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-paper/95 dark:bg-[#1C1C1F]/95 border border-rule dark:border-rule-strong text-ink dark:text-ink-dark rounded-sm shadow-sm backdrop-blur-sm shrink-0">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      {shortName.replace(/_/g, ' ')}
    </span>
  )
}
