'use client'

import { useState, useEffect, useRef } from 'react'

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}

type NumberCardProps = {
  href: string
  label: string
  number: string
  variant?: 'emergency' | 'default'
}

function NumberCard({ href, label, number, variant = 'default' }: NumberCardProps) {
  const isEmergency = variant === 'emergency'
  return (
    <a
      href={href}
      className={`group flex flex-col p-3.5 rounded-sm border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
        isEmergency
          ? 'bg-crisis-red/5 dark:bg-crisis-red/10 border-crisis-red/10 dark:border-crisis-red/20 hover:bg-crisis-red/10 dark:hover:bg-crisis-red/20 hover:border-crisis-red/30'
          : 'bg-panel dark:bg-panel-dark border-rule dark:border-rule-dark hover:bg-paper dark:hover:bg-paper-dark hover:border-ink/10 dark:hover:border-ink-dark/10'
      }`}
    >
      <span className={`text-caption font-sans font-semibold tracking-wide uppercase ${
        isEmergency ? 'text-crisis-red dark:text-crisis-red-light' : 'text-ink-muted dark:text-ink-muted-dark'
      }`}>
        {label}
      </span>
      <span className={`text-lg font-serif font-bold mt-1 transition-colors ${
        isEmergency ? 'text-crisis-red-dark dark:text-crisis-red-light' : 'text-ink dark:text-ink-dark group-hover:text-crisis-red dark:group-hover:text-crisis-red-light'
      }`}>
        {number}
      </span>
    </a>
  )
}

type NumberRowProps = {
  href: string
  label: string
  number: string
}

function NumberRow({ href, label, number }: NumberRowProps) {
  return (
    <a
      href={href}
      className="group flex justify-between items-center bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-3.5 rounded-sm hover:border-crisis-red/20 dark:hover:border-crisis-red/30 hover:bg-paper dark:hover:bg-paper-dark transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <span className="text-small font-sans text-ink/80 dark:text-ink-dark/80 group-hover:text-ink dark:group-hover:text-ink-dark font-medium">{label}</span>
      <span className="text-small font-serif font-bold text-ink dark:text-ink-dark group-hover:text-crisis-red dark:group-hover:text-crisis-red-light transition-colors">{number}</span>
    </a>
  )
}

type MultiNumberCardProps = {
  label: string
  numbers: { number: string; href: string }[]
}

function MultiNumberCard({ label, numbers }: MultiNumberCardProps) {
  return (
    <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-3.5 rounded-sm flex flex-col gap-2.5">
      <span className="text-small font-sans text-ink/80 dark:text-ink-dark/80 font-medium">{label}</span>
      <div className="flex gap-2">
        {numbers.map((item) => (
          <a
            key={item.number}
            href={item.href}
            className="flex-1 text-center py-2 bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark rounded-sm text-small font-serif font-bold text-ink dark:text-ink-dark hover:border-crisis-red/20 dark:hover:border-crisis-red/30 hover:bg-panel dark:hover:bg-panel-dark transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {item.number}
          </a>
        ))}
      </div>
    </div>
  )
}

function PlatformCard({ href, icon, title, description, badgeColor = 'blue' }: { href: string; icon: React.ReactNode; title: string; description: string; badgeColor?: 'blue' | 'purple' }) {
  const isBlue = badgeColor === 'blue'
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-3.5 rounded-sm hover:border-crisis-red/20 dark:hover:border-crisis-red/30 hover:bg-paper dark:hover:bg-paper-dark transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex items-center justify-center w-10 h-10 rounded-sm shrink-0 border transition-colors ${
          isBlue 
            ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/10 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-950/40' 
            : 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/10 group-hover:bg-purple-100/50 dark:group-hover:bg-purple-950/40'
        }`}>
          {icon}
        </div>
        <div>
          <span className="block text-small font-serif font-semibold text-ink dark:text-ink-dark">{title}</span>
          <span className="block text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">{description}</span>
        </div>
      </div>
      <span className="text-ink-muted dark:text-ink-muted-dark opacity-30 group-hover:opacity-100 group-hover:text-crisis-red transition-all">
        <ExternalLinkIcon />
      </span>
    </a>
  )
}

export function NumerosEmergencia() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  // Scroll lock when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Esc key to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* FAB — always in DOM, hidden via display when modal is open */}
      <button
        onClick={open}
        style={{ display: isOpen ? 'none' : 'flex' }}
        className="fixed bottom-5 right-5 bg-crisis-red hover:bg-crisis-red-light active:scale-95 hover:-translate-y-0.5 text-white px-5 py-3 shadow-lift z-[60] items-center gap-2.5 text-eyebrow uppercase rounded-sm border border-crisis-red-dark/20 transition-all duration-150"
      >
        <PhoneIcon />
        <span className="hidden sm:inline">Emergencias</span>
      </button>

      {/* Modal overlay — always in DOM, hidden via display when closed */}
      <div
        style={{ display: isOpen ? 'flex' : 'none' }}
        className="fixed inset-0 z-[1100] items-end sm:items-center justify-center p-0 sm:p-4"
      >
        {/* Backdrop */}
        <div
          onClick={close}
          className="absolute inset-0 bg-ink/50 backdrop-blur-md"
        />

        {/* Modal Content */}
        <div className="relative bg-panel dark:bg-panel-dark w-full sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-lg sm:rounded-sm shadow-2xl flex flex-col border-t-2 border-crisis-red overflow-hidden z-10 animate-pc-slide-up">
          {/* Drag Handle indicator for mobile */}
          <div className="flex justify-center py-2.5 sm:hidden shrink-0 bg-panel dark:bg-panel-dark">
            <div className="w-12 h-1 bg-rule dark:bg-rule-dark rounded-full opacity-60" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-rule dark:border-rule-dark shrink-0 bg-panel dark:bg-panel-dark">
            <div>
              <p className="text-eyebrow uppercase text-crisis-red mb-1.5 flex items-center gap-2 font-semibold">
                <WarningIcon />
                Directorio de emergencia
              </p>
              <h2 className="font-serif text-headline text-ink dark:text-ink-dark">Líneas oficiales de atención</h2>
              <p className="text-caption text-ink-muted dark:text-ink-muted-dark mt-1">Toca un número para llamar directamente</p>
            </div>
            <button
              onClick={close}
              className="p-2 text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark hover:bg-paper dark:hover:bg-paper-dark rounded-sm transition-colors border border-transparent hover:border-rule dark:hover:border-rule-dark"
              aria-label="Cerrar directorio"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 overflow-y-auto space-y-6 bg-panel dark:bg-panel-dark">
            {/* Líneas Generales */}
            <section className="space-y-3">
              <h3 className="text-eyebrow text-ink-muted dark:text-ink-muted-dark font-semibold">Líneas Generales</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <NumberCard href="tel:911" label="Movistar" number="911" variant="emergency" />
                <NumberCard href="tel:171" label="CANTV fijos" number="171" variant="emergency" />
                <NumberCard href="tel:112" label="Digitel" number="112" variant="emergency" />
                <NumberCard href="tel:*1" label="Movilnet" number="*1" variant="emergency" />
              </div>
            </section>

            <hr className="border-rule dark:border-rule-dark" />

            {/* Protección Civil */}
            <section className="space-y-3">
              <h3 className="text-eyebrow text-ink-muted dark:text-ink-muted-dark font-semibold">Protección Civil</h3>
              <div className="space-y-2.5">
                <NumberRow href="tel:08005588427" label="Nacionales (Central)" number="0800-5588427" />
                <NumberRow href="tel:04242075335" label="La Guaira" number="0424-2075335" />
                <MultiNumberCard label="Caracas (Central)" numbers={[
                  { number: "(0212) 575-1823", href: "tel:02125751823" },
                  { number: "(0212) 631-8662", href: "tel:02126318662" }
                ]} />
                <MultiNumberCard label="Caracas (Libertador)" numbers={[
                  { number: "0800-725-3661", href: "tel:08007253661" },
                  { number: "(0212) 541-0830", href: "tel:02125410830" }
                ]} />
              </div>
            </section>

            <hr className="border-rule dark:border-rule-dark" />

            {/* Bomberos */}
            <section className="space-y-3">
              <h3 className="text-eyebrow text-ink-muted dark:text-ink-muted-dark font-semibold">Bomberos</h3>
              <div className="space-y-2.5">
                <MultiNumberCard label="Caracas Metropolitana" numbers={[
                  { number: "(0212) 545-4545", href: "tel:02125454545" },
                  { number: "(0212) 542-0243", href: "tel:02125420243" }
                ]} />
                <MultiNumberCard label="La Guaira" numbers={[
                  { number: "(0212) 332-7620", href: "tel:02123327620" },
                  { number: "(0212) 331-0445", href: "tel:02123310445" }
                ]} />
              </div>
            </section>

            <hr className="border-rule dark:border-rule-dark" />

            {/* Seguridad y Reportes */}
            <section className="space-y-3">
              <h3 className="text-eyebrow text-ink-muted dark:text-ink-muted-dark font-semibold">Seguridad y Reportes</h3>
              <div className="space-y-2.5">
                <NumberRow href="tel:08007654242" label="Policía Nacional" number="0800-765-4242" />
                <div className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-3.5 rounded-sm flex flex-col gap-2.5">
                  <span className="text-small font-sans text-ink/80 dark:text-ink-dark/80 font-medium">FUNVISIS — Reporte de sismos</span>
                  <a
                    href="tel:08008362567"
                    className="block text-center py-2 bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark rounded-sm text-small font-serif font-bold text-ink dark:text-ink-dark hover:border-crisis-red/20 dark:hover:border-crisis-red/30 hover:bg-panel dark:hover:bg-panel-dark transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    0-800-TEMBLOR (0800-8362567)
                  </a>
                </div>
              </div>
            </section>

            <hr className="border-rule dark:border-rule-dark" />

            {/* Plataformas Oficiales */}
            <section className="pb-4 space-y-3">
              <h3 className="text-eyebrow text-ink-muted dark:text-ink-muted-dark font-semibold">Plataformas Oficiales</h3>
              <div className="space-y-2.5">
                <PlatformCard
                  href="https://venapp.gob.ve"
                  title="VENApp"
                  description="App oficial para reportar emergencias de infraestructura y civiles."
                  badgeColor="blue"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  }
                />
                <PlatformCard
                  href="https://sismo2026.gob.ve"
                  title="Desaparecidos Terremoto VE"
                  description="Registro civil y búsqueda activa de personas afectadas por el sismo."
                  badgeColor="purple"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  }
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

