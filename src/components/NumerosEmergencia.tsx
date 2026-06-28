'use client'

import { useState } from 'react'

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
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
      className={`flex flex-col p-3 rounded-lg border transition-colors ${
        isEmergency
          ? 'bg-crisis-red/5 dark:bg-crisis-red/10 border-crisis-red/10 dark:border-crisis-red/20 hover:bg-crisis-red/10 dark:hover:bg-crisis-red/20'
          : 'bg-surface dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <span className={`text-caption font-medium ${isEmergency ? 'text-crisis-red dark:text-crisis-red-light' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
      <span className={`text-lg font-bold ${isEmergency ? 'text-crisis-red-dark dark:text-crisis-red-light' : 'text-gray-900 dark:text-white'}`}>
        {number}
      </span>
    </a>
  )
}

export function NumerosEmergencia() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-crisis-red hover:bg-crisis-red-dark text-white px-5 py-3 shadow-lift transition-colors z-[60] flex items-center gap-2.5 text-eyebrow uppercase"
      >
        <PhoneIcon />
        <span className="hidden sm:inline">Emergencias</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ink/70 backdrop-blur-sm sm:p-4">
      <div className="bg-panel dark:bg-panel-dark w-full sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] sm:rounded-none shadow-2xl flex flex-col animate-fade-in border-t-4 border-crisis-red">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-rule dark:border-rule-dark shrink-0">
          <div>
            <p className="text-eyebrow uppercase text-crisis-red mb-1.5 flex items-center gap-2">
              <WarningIcon />
              Directorio de emergencia
            </p>
            <h2 className="font-serif text-headline text-ink dark:text-ink-dark">Líneas oficiales de atención</h2>
            <p className="text-caption text-ink-muted dark:text-ink-muted-dark mt-1">Toca un número para llamar</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark hover:bg-rule/50 dark:hover:bg-rule-dark/50 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Operadoras */}
          <section>
            <h3 className="text-caption font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Líneas Generales</h3>
            <div className="grid grid-cols-2 gap-2">
              <NumberCard href="tel:911" label="Movistar" number="911" variant="emergency" />
              <NumberCard href="tel:171" label="CANTV fijos" number="171" variant="emergency" />
              <NumberCard href="tel:112" label="Digitel" number="112" variant="emergency" />
              <NumberCard href="tel:*1" label="Movilnet" number="*1" variant="emergency" />
            </div>
          </section>

          {/* Protección Civil */}
          <section>
            <h3 className="text-caption font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Protección Civil</h3>
            <div className="space-y-2">
              <a href="tel:08005588427" className="flex justify-between items-center bg-surface dark:bg-gray-900 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors">
                <span className="text-small font-medium text-gray-700 dark:text-gray-200">Nacionales</span>
                <span className="text-small font-bold text-gray-900 dark:text-white">0800-5588427</span>
              </a>
              <a href="tel:04242075335" className="flex justify-between items-center bg-surface dark:bg-gray-900 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors">
                <span className="text-small font-medium text-gray-700 dark:text-gray-200">La Guaira</span>
                <span className="text-small font-bold text-gray-900 dark:text-white">0424-2075335</span>
              </a>
              <div className="bg-surface dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="block text-small font-medium text-gray-700 dark:text-gray-200 mb-2">Caracas (Central)</span>
                <div className="flex gap-2">
                  <a href="tel:02125751823" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 575-1823</a>
                  <a href="tel:02126318662" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 631-8662</a>
                </div>
              </div>
              <div className="bg-surface dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="block text-small font-medium text-gray-700 dark:text-gray-200 mb-2">Caracas (Libertador)</span>
                <div className="flex gap-2">
                  <a href="tel:08007253661" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">0800-725-3661</a>
                  <a href="tel:02125410830" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 541-0830</a>
                </div>
              </div>
            </div>
          </section>

          {/* Bomberos */}
          <section>
            <h3 className="text-caption font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Bomberos</h3>
            <div className="space-y-2">
              <div className="bg-surface dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="block text-small font-medium text-gray-700 dark:text-gray-200 mb-2">Caracas Metropolitana</span>
                <div className="flex gap-2">
                  <a href="tel:02125454545" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 545-4545</a>
                  <a href="tel:02125420243" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 542-0243</a>
                </div>
              </div>
              <div className="bg-surface dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="block text-small font-medium text-gray-700 dark:text-gray-200 mb-2">La Guaira</span>
                <div className="flex gap-2">
                  <a href="tel:02123327620" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 332-7620</a>
                  <a href="tel:02123310445" className="flex-1 text-center py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">(0212) 331-0445</a>
                </div>
              </div>
            </div>
          </section>

          {/* Seguridad y Especializados */}
          <section>
            <h3 className="text-caption font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Seguridad y Sismos</h3>
            <div className="space-y-2">
              <a href="tel:08007654242" className="flex justify-between items-center bg-surface dark:bg-gray-900 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors">
                <span className="text-small font-medium text-gray-700 dark:text-gray-200">Policía Nacional</span>
                <span className="text-small font-bold text-gray-900 dark:text-white">0800-765-4242</span>
              </a>
              <div className="bg-surface dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="block text-small font-medium text-gray-700 dark:text-gray-200 mb-2">FUNVISIS — Reporte de sismos</span>
                <a href="tel:08008362567" className="block text-center py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-small font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">0-800-TEMBLOR</a>
              </div>
            </div>
          </section>

          {/* Apps y Desaparecidos */}
          <section className="pb-4">
            <h3 className="text-caption font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Plataformas Oficiales</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <div>
                  <span className="block text-small font-bold text-blue-900 dark:text-blue-100">VENApp</span>
                  <span className="block text-caption text-blue-700 dark:text-blue-300">App oficial para reportar emergencias.</span>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <div>
                  <span className="block text-small font-bold text-purple-900 dark:text-purple-100">Desaparecidos Terremoto VE</span>
                  <span className="block text-caption text-purple-700 dark:text-purple-300">Web de registro y búsqueda de personas.</span>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
