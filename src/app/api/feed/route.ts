// src/app/api/feed/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const TAGS_VALIDOS = [
  'sismo', 'rescate', 'desaparecidos', 'puntos_acopio',
  'ayuda_humanitaria', 'replicas', 'donaciones', 'internacional',
]

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { searchParams } = req.nextUrl
  const tag = searchParams.get('tag')
  const lang = searchParams.get('lang')
  const q = searchParams.get('q')?.trim()
  const raw = parseInt(searchParams.get('limit') ?? '30')
  const limit = Math.min(isNaN(raw) ? 30 : raw, 50)
  const rawOffset = parseInt(searchParams.get('offset') ?? '0')
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset

  const base = () => {
    let q2 = supabase
      .from('noticias')
      .select('id, titulo, descripcion, url, fuente, fuente_tipo, tag, idioma, publicado_at, factcheck_confianza, factcheck_status', { count: 'exact' })
      .eq('factcheck_status', 'aprobado')
    if (tag && TAGS_VALIDOS.includes(tag)) q2 = q2.eq('tag', tag)
    if (lang && (lang === 'es' || lang === 'en')) q2 = q2.eq('idioma', lang)
    if (q) {
      // Strip PostgREST delimiter characters and SQL LIKE wildcards (% matches everything, _ matches any char).
      const safeQ = q.replace(/[,()%_]/g, ' ').trim()
      if (safeQ) q2 = q2.or(`titulo.ilike.%${safeQ}%,descripcion.ilike.%${safeQ}%`)
    }
    return q2
  }

  const { data, error, count } = await base()
    .order('publicado_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ noticias: data ?? [], total: count ?? 0 }, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  })
}
