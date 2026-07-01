import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/env'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const TAGS = ['sismo', 'rescate', 'desaparecidos', 'puntos_acopio', 'ayuda_humanitaria', 'replicas', 'donaciones', 'internacional']

// Campos de cifras de víctimas que el fact-checker extrae por noticia (ver
// src/lib/factchecker.ts). "cifra" más "resumen" da nombre a la clave de salida.
const CAMPOS_CIFRAS = ['cifra_muertos', 'cifra_heridos', 'cifra_desaparecidos'] as const

function degradedResponse() {
  const por_tag: Record<string, number> = {}
  TAGS.forEach(tag => { por_tag[tag] = 0 })
  return Response.json(
    { degraded: true, reason: 'supabase_not_configured', total_aprobadas: 0, por_tag, ultima_at: null, cifras: null },
    { status: 200 }
  )
}

export async function GET(req: Request) {
  if (!checkRateLimit(getClientIp(req), 60, 60_000)) {
    return new Response('Too many requests', { status: 429 })
  }
  if (!isSupabaseConfigured()) return degradedResponse()

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

  // Para cada tipo de cifra, tomamos el valor MÁS ALTO reportado entre las
  // noticias aprobadas — el fact-checker ya filtra que sea una cifra oficial a
  // nivel país (no un balance local), y los balances oficiales de un desastre
  // prácticamente nunca bajan, así que el máximo es el dato correcto a mostrar.
  const cifraResults = await Promise.all(
    CAMPOS_CIFRAS.map(campo =>
      supabase
        .from('noticias')
        .select(`${campo}, publicado_at, fuente`)
        .eq('factcheck_status', 'aprobado')
        .not(campo, 'is', null)
        .order(campo, { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  )

  const [muertosRes, heridosRes, desaparecidosRes] = cifraResults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fila = (r: any) => r.data as { publicado_at: string; fuente: string; [k: string]: unknown } | null
  const muertos = fila(muertosRes)
  const heridos = fila(heridosRes)
  const desaparecidos = fila(desaparecidosRes)

  const cifras = (muertos || heridos || desaparecidos) ? {
    muertos: muertos?.cifra_muertos ?? null,
    muertos_at: muertos?.publicado_at ?? null,
    muertos_fuente: muertos?.fuente ?? null,
    heridos: heridos?.cifra_heridos ?? null,
    heridos_at: heridos?.publicado_at ?? null,
    heridos_fuente: heridos?.fuente ?? null,
    desaparecidos: desaparecidos?.cifra_desaparecidos ?? null,
    desaparecidos_at: desaparecidos?.publicado_at ?? null,
    desaparecidos_fuente: desaparecidos?.fuente ?? null,
  } : null

  return Response.json({
    total_aprobadas: totalRes.count ?? 0,
    por_tag,
    ultima_at: ultimaRes.data?.publicado_at ?? null,
    cifras,
  }, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
  })
}
