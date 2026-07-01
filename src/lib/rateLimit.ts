// src/lib/rateLimit.ts
// Limitador in-memory por IP (fixed window). Sin KV/Redis configurado en el
// proyecto, esto es una defensa best-effort: en Vercel cada instancia
// serverless tiene su propio módulo cargado, así que el conteo no se
// comparte entre instancias ni sobrevive un cold start. Igual frena scripts
// simples de abuso contra una misma instancia caliente.

const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(ip)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false

  bucket.count++
  return true
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() ?? 'unknown'
}
