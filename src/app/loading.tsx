export default function Loading() {
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-20 flex flex-col items-center justify-center">
      <div className="w-7 h-7 border-2 border-rule dark:border-rule-dark border-t-crisis-red rounded-full animate-spin mb-4" />
      <p className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark">Cargando boletín…</p>
    </div>
  )
}
