// src/app/api/ingest/route.ts
// Cron job: jala RSS, pre-filtra, manda a Claude, guarda en Supabase
// Llamado por Vercel Cron cada 5 minutos (ver vercel.json)

import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import { FUENTES, preFiltroPasa } from '@/lib/sources'
import { verificarNoticia } from '@/lib/factchecker'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role para escribir
)

const parser = new Parser({
  customFields: { item: ['media:content', 'enclosure'] },
})

export async function GET(req: Request) {
  // Verificar que es el cron de Vercel (o dev local)
  const authHeader = req.headers.get('authorization')
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 })
  }

  let procesadas = 0
  let aprobadas = 0
  let rechazadas = 0
  let duplicadas = 0

  for (const fuente of FUENTES) {
    // USGS se maneja aparte (GeoJSON, no RSS)
    if (fuente.url.includes('usgs.gov')) {
      await ingestUSGS(fuente.nombre)
      continue
    }

    try {
      const feed = await parser.parseURL(fuente.url)

      for (const item of feed.items.slice(0, 20)) {
        const titulo = item.title ?? ''
        const desc = item.contentSnippet ?? item.summary ?? ''
        const url = item.link ?? ''
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

        if (!url || !titulo) continue

        // 1. Pre-filtro por keywords (gratis, rápido)
        if (!preFiltroPasa(titulo, desc)) continue

        // 2. Verificar duplicado en DB
        // maybeSingle() devuelve null (sin error) cuando no hay filas.
        // single() en cambio lanza error tanto por "sin filas" como por fallo real de DB,
        // lo que hace que un error silencioso se confunda con "no existe" y se inserte igual.
        const { data: existe, error: checkError } = await supabase
          .from('noticias')
          .select('id')
          .eq('url', url)
          .maybeSingle()

        if (checkError) {
          console.error('[ingest] Error chequeando duplicado:', checkError.message)
          continue
        }
        if (existe) { duplicadas++; continue }

        procesadas++

        // 3. Fact-check con Claude
        const resultado = await verificarNoticia(titulo, desc, fuente.nombre)

        // 4. Guardar en Supabase (todas, incluyendo rechazadas para auditoría)
        await supabase.from('noticias').insert({
          titulo,
          descripcion: desc.slice(0, 500),
          url,
          fuente: fuente.nombre,
          fuente_tipo: fuente.tipo,
          tag: resultado.tag ?? 'sismo',
          factcheck_status: resultado.status,
          factcheck_razon: resultado.razon,
          factcheck_confianza: resultado.confianza,
          publicado_at: pubDate.toISOString(),
        })

        if (resultado.status === 'aprobado') aprobadas++
        else rechazadas++

        // Rate limit: no spamear la API de Claude
        await new Promise(r => setTimeout(r, 300))
      }
    } catch (err) {
      console.error(`[ingest] Error procesando ${fuente.nombre}:`, err)
    }
  }

  return Response.json({
    ok: true,
    procesadas,
    aprobadas,
    rechazadas,
    duplicadas,
    timestamp: new Date().toISOString(),
  })
}

// Ingesta especial para datos sísmicos del USGS (GeoJSON)
async function ingestUSGS(nombreFuente: string) {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
    )
    const data = await res.json()

    for (const feature of data.features) {
      const props = feature.properties
      const lugar: string = props.place ?? ''
      const mag: number = props.mag ?? 0

      // Solo sismos en Venezuela o el Caribe relacionados
      if (!lugar.toLowerCase().includes('venezuela') && mag < 4.0) continue

      const url = props.url
      const titulo = `Sismo M${mag.toFixed(1)} — ${lugar}`
      const desc = `Magnitud ${mag}, profundidad ${feature.geometry?.coordinates?.[2] ?? '?'} km. Hora UTC: ${new Date(props.time).toISOString()}`

      // maybeSingle() devuelve null (sin error) cuando no hay filas.
      // single() lanza error tanto por "sin filas" como por fallo real de DB,
      // lo que hace que un error silencioso se confunda con "no existe" y se inserte igual.
      const { data: existe, error: checkError } = await supabase
        .from('noticias')
        .select('id')
        .eq('url', url)
        .maybeSingle()

      if (checkError) {
        console.error('[ingest] Error chequeando duplicado:', checkError.message)
        continue
      }
      if (existe) continue

      await supabase.from('noticias').insert({
        titulo,
        descripcion: desc,
        url,
        fuente: nombreFuente,
        fuente_tipo: 'oficial',
        tag: mag >= 4.5 ? 'replicas' : 'sismo',
        factcheck_status: 'aprobado', // USGS es fuente oficial, auto-aprobado
        factcheck_razon: 'Fuente oficial USGS',
        factcheck_confianza: 99,
        publicado_at: new Date(props.time).toISOString(),
      })
    }
  } catch (err) {
    console.error('[ingest] Error USGS:', err)
  }
}
