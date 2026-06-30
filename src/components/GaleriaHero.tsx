'use client'

import { useEffect, useState } from 'react'
import NextImage from 'next/image'

interface NoticiaGaleria {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  tag: string | null
  publicado_at: string
  imagen_url: string  // guaranteed non-null by .not('imagen_url','is',null) + empty-string filter in ingest
}

export default function GaleriaHero() {
  const [noticias, setNoticias] = useState<NoticiaGaleria[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/feed?galeria=true', { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setNoticias(data.noticias ?? []))
      .catch(() => {})
      .finally(() => setCargando(false))
    return () => controller.abort()
  }, [])

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
            <div key={i} className="min-w-[280px] h-48 bg-[#2A2A2A] rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {noticias.map(n => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-lg overflow-hidden bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <div className="relative aspect-video w-full">
                <NextImage
                  src={n.imagen_url}
                  alt={n.titulo}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
                />
                {n.tag && (
                  <span className="absolute top-2 left-2 bg-black/70 text-crisis-red text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {n.tag.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-sm text-ink dark:text-ink-dark line-clamp-2 mb-1.5">{n.titulo}</h3>
                <p className="font-mono text-[11px] text-ink-muted dark:text-ink-muted-dark tracking-wide">{n.fuente} · {tiempoRelativo(n.publicado_at)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
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
