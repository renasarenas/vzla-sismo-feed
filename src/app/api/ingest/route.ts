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
  requestOptions: { timeout: 8000 },
})

export async function GET(req: Request) {
  // Si CRON_SECRET no está definida, la comparación sería `authHeader !== "Bearer undefined"`,
  // lo que permite que cualquiera dispare el cron enviando ese header literal.
  if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
    return new Response('Server misconfiguration', { status: 500 })
  }

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
      const counts = await ingestUSGS(fuente.nombre)
      procesadas += counts.procesadas
      aprobadas += counts.aprobadas
      continue
    }

    try {
      const feed = await parser.parseURL(fuente.url)

      for (const item of feed.items.slice(0, 20)) {
        const titulo = item.title ?? ''
        const desc = item.contentSnippet ?? item.summary ?? ''
        const url = item.link ?? ''
        const pubDateRaw = new Date(item.pubDate ?? '')
        const pubDate = isNaN(pubDateRaw.getTime()) ? new Date() : pubDateRaw

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
        const { error: insertError } = await supabase.from('noticias').insert({
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

        if (insertError) {
          console.error('[ingest] Error insertando:', insertError.message)
          continue
        }
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
async function ingestUSGS(nombreFuente: string): Promise<{ procesadas: number; aprobadas: number }> {
  let procesadas = 0
  let aprobadas = 0
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`USGS error ${res.status}`)
    const data = await res.json()

    for (const feature of (data.features ?? [])) {
      const props = feature.properties
      const lugar: string = props.place ?? ''
      const mag: number = props.mag ?? 0

      // Solo sismos que sean en Venezuela Y de magnitud >= 4.0.
      // Con && la condición dejaría pasar cualquier sismo M4+ del mundo entero
      // (De Morgan: NOT A AND NOT B ≡ NOT(A OR B)); el || correcto exige ambas condiciones.
      if (!lugar.toLowerCase().includes('venezuela') || mag < 4.0) continue

      const url: string = props.url ?? ''
      if (!url) continue
      if (!props.time) continue
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

      procesadas++
      const { error: insertError } = await supabase.from('noticias').insert({
        titulo,
        descripcion: desc,
        url,
        fuente: nombreFuente,
        fuente_tipo: 'oficial',
        // La magnitud sola no define si algo es réplica — lo define la relación temporal
        // y espacial con el evento del 24 de junio. Clasificar réplicas correctamente
        // requeriría comparar epicentro y hora, lo que está fuera del scope de este MVP.
        tag: 'sismo',
        factcheck_status: 'aprobado', // USGS es fuente oficial, auto-aprobado
        factcheck_razon: 'Fuente oficial USGS',
        factcheck_confianza: 99,
        publicado_at: new Date(props.time).toISOString(),
      })
      if (insertError) {
        console.error('[ingest] Error insertando USGS:', insertError.message)
        continue
      }
      aprobadas++
    }
  } catch (err) {
    console.error('[ingest] Error USGS:', err)
  }
  return { procesadas, aprobadas }
}
