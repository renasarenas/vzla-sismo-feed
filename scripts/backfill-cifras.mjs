// scripts/backfill-cifras.mjs
// Recorre noticias YA aprobadas que se insertaron antes de que existiera la
// extraccion de cifras (cifra_muertos/heridos/desaparecidos todas null) y les
// pide a Groq que extraiga esos numeros del titulo/descripcion. No toca
// tag/zona/status — solo rellena las tres columnas de cifras.
//
// Correr una sola vez despues del deploy que agrego estas columnas, para
// poblar el historico. Las noticias nuevas ya las llenan solas via /api/ingest.
//
// Uso:
//   node --env-file=.env.local scripts/backfill-cifras.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GROQ_KEY = process.env.GROQ_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY || !GROQ_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o GROQ_API_KEY en el entorno.')
  console.error('Corré con: node --env-file=.env.local scripts/backfill-cifras.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const CIFRAS_PROMPT = `Analiza el siguiente titular y descripción de una noticia sobre el sismo de Venezuela del 24 de junio de 2026.
Si la noticia menciona explícitamente una cifra ACTUALIZADA de muertos, heridos o desaparecidos a NIVEL PAÍS (el balance nacional total, atribuido a fuente oficial o confiable, ej. "asciende a 1.943 el número de muertos"), extrae el número exacto como entero, sin puntos ni comas de miles.
Si la cifra es de un solo estado, municipio o localidad (ej. "el alcalde de Chacao reportó 58 fallecidos"), NO la uses — dejá el campo en null, porque no representa el total nacional.
Si no menciona una cifra nueva a nivel país, deja el campo en null. No inventes ni redondees.

Responde SOLO con JSON, sin texto adicional:
{"cifra_muertos": number|null, "cifra_heridos": number|null, "cifra_desaparecidos": number|null}`

async function extraerCifras(titulo, descripcion, intento = 1) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 100,
      messages: [
        { role: 'system', content: CIFRAS_PROMPT },
        { role: 'user', content: `TITULAR: ${titulo}\nDESCRIPCIÓN: ${descripcion ?? '(sin descripción)'}` },
      ],
    }),
  })
  if (res.status === 429 && intento <= 3) {
    const espera = 5000 * intento
    console.log(`    (429, reintentando en ${espera / 1000}s...)`)
    await new Promise(r => setTimeout(r, espera))
    return extraerCifras(titulo, descripcion, intento + 1)
  }
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)
  const data = await res.json()
  const text = data.choices[0]?.message?.content ?? ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function main() {
  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('id, titulo, descripcion')
    .eq('factcheck_status', 'aprobado')
    .is('cifra_muertos', null)
    .is('cifra_heridos', null)
    .is('cifra_desaparecidos', null)

  if (error) {
    console.error('Error consultando noticias:', error.message)
    process.exit(1)
  }

  console.log(`Procesando ${noticias.length} noticias aprobadas sin cifras...`)
  let actualizadas = 0

  for (const n of noticias) {
    try {
      const cifras = await extraerCifras(n.titulo, n.descripcion)
      const tieneAlgo = cifras.cifra_muertos != null || cifras.cifra_heridos != null || cifras.cifra_desaparecidos != null
      if (tieneAlgo) {
        const { error: updateError } = await supabase
          .from('noticias')
          .update({
            cifra_muertos: cifras.cifra_muertos ?? null,
            cifra_heridos: cifras.cifra_heridos ?? null,
            cifra_desaparecidos: cifras.cifra_desaparecidos ?? null,
          })
          .eq('id', n.id)
        if (updateError) {
          console.error(`  x ${n.titulo.slice(0, 60)}: ${updateError.message}`)
        } else {
          actualizadas++
          console.log(`  ok ${n.titulo.slice(0, 60)} ->`, cifras)
        }
      }
    } catch (err) {
      console.error(`  x ${n.titulo.slice(0, 60)}:`, err instanceof Error ? err.message : err)
    }
    // Pausa más larga que /api/ingest: acá corremos muchas llamadas seguidas
    // en poco tiempo y el free tier de Groq devuelve 429 si no se espacian.
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\nListo. ${actualizadas} noticias actualizadas con cifras.`)
}

main()
