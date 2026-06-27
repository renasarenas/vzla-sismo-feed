import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Venezuela Sismo 24 jun — Feed verificado',
  description: 'Noticias verificadas en tiempo real sobre los sismos del 24 de junio de 2026 en Venezuela.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // lang="es" porque toda la app es en español
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
