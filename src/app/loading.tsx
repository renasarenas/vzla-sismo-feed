// Page-level loading: seismograph trace drawing animation (matches the
// loading motif used across all cards and sections).
import { SismoLoading } from '@/components/SismoLoading'

export default function Loading() {
  return (
    <SismoLoading
      caption="Cargando boletín…"
      className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-20 flex flex-col items-center justify-center gap-4"
    />
  )
}
