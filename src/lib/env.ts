export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'))
}

export function supabaseDegradedResponse() {
  return Response.json(
    { degraded: true, reason: 'supabase_not_configured', noticias: [], total: 0 },
    { status: 200 }
  )
}
