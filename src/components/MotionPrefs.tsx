'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { MotionConfig } from 'framer-motion'

type Pref = 'auto' | 'on' | 'off'

const STORAGE_KEY = 'sismo-motion-pref'

type Ctx = { pref: Pref; reduced: boolean; cycle: () => void }

const MotionPrefContext = createContext<Ctx>({ pref: 'auto', reduced: false, cycle: () => {} })

// Combines the OS-level "reduce motion" accessibility setting with lightweight
// device/connection heuristics (RAM, CPU cores, save-data / slow connection), so
// animations turn themselves off on hardware where they'd just be jank — without
// requiring anyone to go find a settings toggle first. `pref` lets a person
// override that guess in either direction (force on, force off).
function dispositivoLimitado(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any
  if (nav.deviceMemory && nav.deviceMemory <= 4) return true
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true
  const conn = nav.connection
  if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return true
  return false
}

export function MotionPrefProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPref] = useState<Pref>('auto')
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Pref | null) ?? 'auto'
    setPref(stored)
  }, [])

  useEffect(() => {
    setReduced(pref === 'off' ? true : pref === 'on' ? false : dispositivoLimitado())
  }, [pref])

  const cycle = useCallback(() => {
    setPref(prev => {
      const order: Pref[] = ['auto', 'on', 'off']
      const next = order[(order.indexOf(prev) + 1) % order.length]
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <MotionPrefContext.Provider value={{ pref, reduced, cycle }}>
      {/* MotionConfig reducedMotion="always" makes every framer-motion component
          in the tree skip straight to its end state — one switch disables motion
          app-wide instead of threading a flag through every component. */}
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionPrefContext.Provider>
  )
}

export function useMotionPref() {
  return useContext(MotionPrefContext)
}

function BellSlashPath() {
  return (
    <>
      <path d="M6 8a6 6 0 0 1 10.3-4.2" />
      <path d="M17.6 12.9c.3.9.6 1.6.9 2.1.5.9 2 2 2 2H10" />
      <path d="M6 8v0c0 4.5-1.5 6.5-2 7h6" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  )
}

// Compact icon-only control for the navbar — mirrors ThemeIcon's visual weight
// (17px, stroke=currentColor) so the two toggles read as a pair.
export function MotionToggleButton() {
  const { pref, reduced, cycle } = useMotionPref()
  const label =
    pref === 'auto' ? `Animaciones: auto (${reduced ? 'desactivadas' : 'activadas'})`
    : pref === 'on' ? 'Animaciones: activadas'
    : 'Animaciones: desactivadas'

  return (
    <button
      onClick={cycle}
      aria-label={`${label} — tocar para cambiar`}
      title={label}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark border border-rule dark:border-rule-dark hover:bg-rule/50 dark:hover:bg-rule-dark/50 transition-colors whitespace-nowrap"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {reduced ? <BellSlashPath /> : <path d="M13 3v7h7l-9 11v-7H4z" />}
      </svg>
      {pref === 'auto' ? 'Auto' : pref === 'on' ? 'On' : 'Off'}
    </button>
  )
}
