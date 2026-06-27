// src/lib/factchecker.ts
// Usa Groq (llama-3.3-70b) para verificar si una noticia es relevante al sismo de Venezuela
// y asignarle un tag. Solo pasan noticias aprobadas al feed.
// Groq es compatible con el formato OpenAI — gratis en https://console.groq.com

export type FactCheckResult = {
  status: 'aprobado' | 'rechazado' | 'dudoso'
  tag: string | null
  razon: string
  confianza: number
}

const SYSTEM_PROMPT = `Eres un verificador de noticias especializado en el doble sismo que ocurrió en Venezuela el 24 de junio de 2026.

CONTEXTO DEL EVENTO:
- Dos sismos: magnitud 7.2 y 7.5 con epicentro cerca de Morón/San Felipe, estado Yaracuy/Carabobo
- Ocurrieron con 40 segundos de diferencia (doblete sísmico)
- Zonas más afectadas: La Guaira, Caracas, Carabobo, Miranda, Trujillo
- Cifras actuales: ~920 muertos, ~3,360 heridos, +50,000 desaparecidos
- Estado de emergencia declarado por el gobierno venezolano

TU TAREA:
Analiza el titular y descripción de la noticia y determina:

1. ¿Es RELEVANTE al sismo de Venezuela del 24 de junio 2026?
   - RECHAZA si habla de otros países, otros sismos, o temas no relacionados
   - RECHAZA si parece desinformación, exageración sin fuente, o rumor sin verificar
   - MARCA COMO DUDOSA si la información no puede confirmarse fácilmente
   - APRUEBA si proviene de fuente confiable y es claramente sobre este evento

2. Asigna UNO de estos tags si es aprobada:
   - sismo: información general del sismo, magnitud, epicentro, datos técnicos
   - rescate: labores de búsqueda y rescate, equipos, supervivientes
   - desaparecidos: personas buscadas, plataformas de localización
   - puntos_acopio: centros de acopio, dónde llevar donaciones
   - ayuda_humanitaria: organizaciones de ayuda, distribución, refugios
   - replicas: sismos posteriores, aftershocks
   - donaciones: cómo donar, canales de donación monetaria
   - internacional: respuesta internacional, países que ayudan, diplomacia

CRITERIOS DE RECHAZO:
- Noticia de otro país o evento no relacionado
- Cifras de muertos sin fuente oficial o muy alejadas del rango conocido
- Contenido político venezolano no relacionado al sismo
- Especulación sin base
- Contenido duplicado o irrelevante

Responde SOLO con JSON, sin texto adicional:
{
  "status": "aprobado" | "rechazado" | "dudoso",
  "tag": "sismo" | "rescate" | "desaparecidos" | "puntos_acopio" | "ayuda_humanitaria" | "replicas" | "donaciones" | "internacional" | null,
  "razon": "explicación breve en español (máx 100 chars)",
  "confianza": 0-100
}`

export async function verificarNoticia(
  titulo: string,
  descripcion: string,
  fuente: string
): Promise<FactCheckResult> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 256,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `FUENTE: ${fuente}
TITULAR: ${titulo}
DESCRIPCIÓN: ${descripcion?.slice(0, 500) ?? '(sin descripción)'}`,
          },
        ],
      }),
    })

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`)

    const data = await res.json()
    // Formato OpenAI: choices[0].message.content (vs Anthropic: content[0].text)
    const text = data.choices[0]?.message?.content ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      status: parsed.status ?? 'dudoso',
      tag: parsed.tag ?? null,
      razon: parsed.razon ?? 'Sin razón',
      confianza: parsed.confianza ?? 50,
    }
  } catch (err) {
    console.error('[factchecker] Error:', err)
    // Si Groq falla, marcar como dudoso (no publicar)
    return {
      status: 'dudoso',
      tag: null,
      razon: 'Error en verificación automática',
      confianza: 0,
    }
  }
}
