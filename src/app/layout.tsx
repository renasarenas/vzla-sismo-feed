import type { Metadata } from 'next'
import { Newsreader, Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { NumerosEmergencia } from '@/components/NumerosEmergencia'
import { OfflineBanner } from '@/components/OfflineBanner'

// Editorial pairing: a screen-optimized news serif for the masthead and
// headlines, a workhorse sans for UI, data and body copy.
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Venezuela Sismo 24 jun — Feed verificado',
  description: 'Noticias verificadas en tiempo real sobre los sismos del 24 de junio de 2026 en Venezuela.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Venezuela Sismo 24 jun — Feed verificado',
    description: 'Noticias verificadas en tiempo real sobre los sismos del 24 de junio de 2026 en Venezuela.',
    type: 'website',
    images: [{ url: '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${serif.variable} ${sans.variable}`}>
      <body className="bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark min-h-screen font-sans antialiased">
        <OfflineBanner />
        <Navbar />
        {children}
        <NumerosEmergencia />
      </body>
    </html>
  )
}
