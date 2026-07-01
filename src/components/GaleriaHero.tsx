'use client'

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { motion } from 'framer-motion'

export interface NoticiaGaleria {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  tag: string | null
  publicado_at: string
  imagen_url: string
}

// Same hue-per-category convention as FeedNoticias' TAG_META, kept local since
// this component only needs the hex (for the translucent badge over photos),
// not the full label/border/pill class set.
const TAG_HEX: Record<string, string> = {
  sismo: '#CF1020',
  rescate: '#F97316',
  desaparecidos: '#A855F7',
  puntos_acopio: '#22C55E',
  ayuda_humanitaria: '#3B82F6',
  replicas: '#EAB308',
  donaciones: '#14B8A6',
  internacional: '#94A3B8',
}

// Purely presentational now — `noticias` is a slice of the same deduped list
// FeedNoticias builds the hero package and curated sections from, so nothing
// here can repeat a story already shown elsewhere on the page.
export default function GaleriaHero({ noticias, cargando }: { noticias: NoticiaGaleria[]; cargando: boolean }) {
  if (!cargando && noticias.length === 0) return null

  return (
    <section className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 mb-2 border-b border-rule dark:border-rule-dark">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mb-4">
        <GalleryIcon />
        Últimas imágenes del sismo
      </p>

      {cargando ? (
        <div className="flex gap-4 pb-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="w-[300px] flex-shrink-0 rounded-lg overflow-hidden bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark"
            >
              <div className="aspect-video w-full skeleton" />
              <div className="p-4">
                <div className="min-h-[2.5rem] mb-1.5 space-y-1.5">
                  <div className="h-3 w-full rounded skeleton" />
                  <div className="h-3 w-2/3 rounded skeleton" />
                </div>
                <div className="h-2.5 w-1/2 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {noticias.map((n) => (
            <motion.a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-[300px] flex-shrink-0 rounded-lg overflow-hidden bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <GaleriaImagen src={n.imagen_url} alt={n.titulo} tag={n.tag} />
              <div className="p-4">
                <h3 className="font-serif font-semibold text-sm text-ink dark:text-ink-dark line-clamp-2 min-h-[2.5rem] mb-1.5">{n.titulo}</h3>
                <p className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide truncate">{n.fuente} · {tiempoRelativo(n.publicado_at)}</p>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  )
}

// Gallery thumbnail with its own load lifecycle: a shimmering skeleton holds the
// aspect-video slot until the image decodes, then the image fades in over it. On
// error the whole slot is removed (the card keeps just its title/meta), matching
// the previous behaviour. The mount check catches images already in cache, whose
// onLoad can fire before React attaches the handler.
function GaleriaImagen({ src, alt, tag }: { src: string; alt: string; tag: string | null }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  if (failed) return null

  const hex = (tag && TAG_HEX[tag]) || '#444444'

  return (
    <div className="relative aspect-video w-full bg-panel dark:bg-panel-dark">
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <NextImage
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        unoptimized
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {tag && (
        <span
          className="absolute top-2 left-2 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md border border-white/25 shadow-sm"
          style={{ backgroundColor: `${hex}80` }}
        >
          {tag.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  )
}

// Same outline-icon vocabulary as the rest of the app (BellIcon, ExportIcon,
// ThemeIcon): stroke=currentColor, strokeWidth 2, round caps, no fill.
function GalleryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function tiempoRelativo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (isNaN(diff) || diff < 0) return ''
  if (diff < 60) return `${diff}m`
  if (diff < 1440) return `${Math.floor(diff / 60)}h`
  return `${Math.floor(diff / 1440)}d`
}
