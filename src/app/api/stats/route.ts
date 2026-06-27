import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const TAGS = ['sismo', 'rescate', 'desaparecidos', 'puntos_acopio', 'ayuda_humanitaria', 'replicas', 'donaciones', 'internacional']

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [totalRes, ultimaRes, ...tagResults] = await Promise.all([
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('factcheck_status', 'aprobado'),
    supabase.from('noticias').select('publicado_at').eq('factcheck_status', 'aprobado').order('publicado_at', { ascending: false }).limit(1).maybeSingle(),
    ...TAGS.map(tag =>
      supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('factcheck_status', 'aprobado').eq('tag', tag)
    ),
  ])

  const por_tag: Record<string, number> = {}
  TAGS.forEach((tag, i) => { por_tag[tag] = tagResults[i].count ?? 0 })

  return Response.json({
    total_aprobadas: totalRes.count ?? 0,
    por_tag,
    ultima_at: ultimaRes.data?.publicado_at ?? null,
  }, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
  })
}
