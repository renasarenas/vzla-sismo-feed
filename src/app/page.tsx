import { FeedNoticias } from '@/components/FeedNoticias'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialData: any[] = []
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/feed`)
    if (res.ok) {
      const data = await res.json()
      initialData = data.noticias ?? []
    }
  } catch {
    // fail silently — el cliente carga el feed por su cuenta
  }
  return (
    <div className="max-w-8xl mx-auto">
      <FeedNoticias initialData={initialData} />
    </div>
  )
}
