// scripts/backfill-imagenes.mjs
// Recorre noticias aprobadas insertadas antes de que existiera la extraccion
// de imagen desde el RSS (imagen_url null) y les hace scraping de og:image /
// twitter:image al articulo original para rellenar la columna. El ingest ya
// no vuelve a tocar estas filas (dedupe por URL), asi que sin este backfill
// se quedan sin foto para siempre.
//
// Correr una sola vez para poblar el historico. Las noticias nuevas ya se
// llenan solas via /api/ingest (extraerImagenRSS).
//
// Uso:
//   node --env-file=.env.local scripts/backfill-imagenes.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  console.error('Corré con: node --env-file=.env.local scripts/backfill-imagenes.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const META_IMAGE_RE = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i

async function extraerImagenArticulo(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VzlaSismoFeedBot/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('text/html')) return null
  const html = await res.text()
  // Los meta og:image/twitter:image viven en <head>; nos quedamos con los
  // primeros 64KB para no regex-scanear bodies de varios MB.
  const head = html.slice(0, 65536)
  const match = head.match(META_IMAGE_RE)
  const src = match?.[1] ?? match?.[2] ?? null
  if (!src) return null
  try {
    const parsed = new URL(src)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return src
  } catch {
    return null
  }
}

async function main() {
  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('id, titulo, url')
    .eq('factcheck_status', 'aprobado')
    .is('imagen_url', null)

  if (error) {
    console.error('Error consultando noticias:', error.message)
    process.exit(1)
  }

  console.log(`Procesando ${noticias.length} noticias aprobadas sin imagen...`)
  let actualizadas = 0
  let sinImagen = 0

  for (const n of noticias) {
    try {
      const imagen_url = await extraerImagenArticulo(n.url)
      // Guardamos "" (cadena vacía) si no se encontró imagen para evitar procesarlo infinitamente en el query is('imagen_url', null)
      const { error: updateError } = await supabase
        .from('noticias')
        .update({ imagen_url: imagen_url ?? '' })
        .eq('id', n.id)
      if (updateError) {
        console.error(`  x ${n.titulo.slice(0, 60)}: ${updateError.message}`)
      } else if (imagen_url) {
        actualizadas++
        console.log(`  ok ${n.titulo.slice(0, 60)} -> ${imagen_url}`)
      } else {
        sinImagen++
        console.log(`  -- ${n.titulo.slice(0, 60)}: sin og:image en el articulo`)
      }
    } catch (err) {
      sinImagen++
      console.error(`  x ${n.titulo.slice(0, 60)}:`, err instanceof Error ? err.message : err)
    }
    // Espaciar requests: le pegamos a decenas de sitios externos distintos,
    // no queremos parecer un scraper agresivo.
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\nListo. ${actualizadas} actualizadas, ${sinImagen} sin imagen disponible.`)
}

main()
