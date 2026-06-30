'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

// Signature motif: a small seismogram trace. Used in the masthead and hero.
function Seismograph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" className={className} fill="none" aria-hidden="true" preserveAspectRatio="none">
      <path
        d="M0 12 H10 L13 12 L16 4 L19 20 L22 8 L25 16 L28 12 H40 L43 6 L46 18 L49 12 H64"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
    </svg>
  )
}

export function Navbar() {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  const links = [
    { href: '/', label: 'Boletín' },
    { href: '/mapa', label: 'Mapa sísmico' },
    { href: '/stats', label: 'Indicadores' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-paper/95 dark:bg-paper-dark/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      {/* Institutional alert rule — the single signature color cue. */}
      <div className="h-1 bg-crisis-red" />

      <div className="border-b border-rule dark:border-rule-dark">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-5 lg:gap-8">
          {/* Nameplate */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Seismograph className="w-9 h-5 text-crisis-red shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold tracking-tight text-ink dark:text-ink-dark">
                Sismo Venezuela
              </span>
              <span className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mt-0.5">
                Boletín de emergencia
              </span>
            </span>
          </Link>

          <span className="hidden sm:block h-6 w-px bg-rule dark:bg-rule-dark shrink-0" aria-hidden="true" />

          {/* Desktop nav — editorial uppercase, underline active state. Anchored next to
              the nameplate rather than floated to center; keeps the bar from reading empty
              on wide viewports. */}
          <nav className="hidden sm:flex items-center gap-7 shrink-0">
            {links.map(l => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-eyebrow uppercase py-5 transition-colors ${
                    active
                      ? 'text-ink dark:text-ink-dark'
                      : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute left-0 right-0 -bottom-px h-0.5 bg-crisis-red"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Portal target: page-level actions (alerts / export) render here on desktop.
              Populated by FeedNoticias when mounted; stays empty (and invisible) on pages
              that don't have feed actions, like /mapa and /stats. */}
          <div id="navbar-feed-actions" className="hidden sm:flex items-center gap-5 shrink-0" />

          <span className="hidden sm:block h-6 w-px bg-rule dark:bg-rule-dark shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              onClick={toggleDark}
              aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark hover:bg-rule/50 dark:hover:bg-rule-dark/50 transition-colors"
              whileTap={{ scale: 0.85, rotate: 15 }}
            >
              <ThemeIcon dark={dark} />
            </motion.button>
            <motion.button
              className="sm:hidden p-2 rounded text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark"
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-label="Menú"
              whileTap={{ scale: 0.85 }}
            >
              <MenuIcon open={menuOpen} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="sm:hidden border-b border-rule dark:border-rule-dark bg-paper dark:bg-paper-dark px-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="py-2">
              {links.map(l => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center text-eyebrow uppercase py-3 border-b border-rule/60 dark:border-rule-dark/60 last:border-0 ${
                      active ? 'text-crisis-red' : 'text-ink-muted dark:text-ink-muted-dark'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
