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
    <section className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
        📸 Últimas imágenes del sismo
      </p>

      {cargando ? (
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[280px] h-48 bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {noticias.map(n => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-900 hover:bg-gray-800 transition-colors"
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
                  <span className="absolute top-2 left-2 bg-black/70 text-red-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {n.tag.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{n.titulo}</h3>
                <p className="text-xs text-gray-500">{n.fuente} · {tiempoRelativo(n.publicado_at)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

function tiempoRelativo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (isNaN(diff) || diff < 0) return ''
  if (diff < 60) return `${diff}m`
  if (diff < 1440) return `${Math.floor(diff / 60)}h`
  return `${Math.floor(diff / 1440)}d`
}
