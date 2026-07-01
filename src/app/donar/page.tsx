'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const INSUMOS = [
  'Leche en polvo',
  'Proteínas enlatadas',
  'Granos secos',
  'Harina de maíz precocida',
  'Pasta',
  'Avena en hojuelas',
  'Galletas saladas',
  'Puré de papa deshidratado',
  'Mantequilla de maní',
  'Huevos en polvo deshidratados',
  'Aceite vegetal',
  'Cubos de caldo',
  'Sal y azúcar',
  'Barras de supervivencia',
]

type Organizacion = {
  nombre: string
  descripcion: string
  url?: string
}

const ORGANIZACIONES: Organizacion[] = [
  {
    nombre: 'World Central Kitchen',
    descripcion: 'Chef José Andrés — ya desplegada en Venezuela distribuyendo comidas calientes a familias afectadas y rescatistas. Comprometió un millón de dólares de su fundación.',
    url: 'https://donate.wck.org/team/835442',
  },
  {
    nombre: 'Cáritas Venezuela',
    descripcion: 'Décadas de presencia en el país. Despliegue de emergencia inmediato vía su red diocesana, con centros de acopio en varias zonas afectadas.',
    url: 'https://caritas.org.ve',
  },
  {
    nombre: 'Global Empowerment Mission',
    descripcion: 'Movilizada en alianza con I Love Venezuela, su socio local de largo plazo en el país.',
    url: 'https://globalempowermentmission.org/mission/venezuela-earthquakes',
  },
  {
    nombre: 'Hogar Bambi Venezuela',
    descripcion: 'Trabaja con niñas, niños y adolescentes en Venezuela. Acepta donaciones en dólares.',
    url: 'https://hogarbambi.org/donar-ahora',
  },
  {
    nombre: 'Fundación AmCham',
    descripcion: 'Cámara Venezolano-Americana — fondo específico para el terremoto, cobro vía Stripe desde fuera de Venezuela.',
  },
  {
    nombre: 'We Love Foundation',
    descripcion: 'I Love Venezuela — con base en Miami, distribuye fondos a grupos verificados: kits médicos, agua y comida.',
  },
  {
    nombre: 'GoFundMe',
    descripcion: 'Emergency Relief for Venezuela — campaña de recaudación abierta para asistencia de emergencia.',
    url: 'https://gofundme.com',
  },
  {
    nombre: 'JustGiving',
    descripcion: 'Healing Venezuela — apoya hospitales, médicos y servicios de rescate en el país.',
    url: 'https://justgiving.com/campaign/venezuelaearthquake2026',
  },
  {
    nombre: 'People in Need',
    descripcion: 'SOS Venezuela — ONG internacional con apelación dedicada al terremoto.',
    url: 'https://peopleinneed.net',
  },
  {
    nombre: 'ACNUR — USA for UNHCR',
    descripcion: 'La Agencia de la ONU para Refugiados está activa en Venezuela. En algunos períodos ofreció triplicar donaciones mensuales.',
    url: 'https://unhcr.org',
  },
  {
    nombre: 'Somos AlumnUSB',
    descripcion: 'Comunidad de egresados de la USB canalizando apoyo de forma ágil y directa hacia familias afectadas.',
    url: 'https://alumnusb.org/ayuda-tras-terremoto/',
  },
]

// Iconos simples y geométricos (24px, stroke=currentColor, strokeWidth 1.8) — cada uno
// asignado a propósito por tipo de insumo, no por posición, para que se lean de un vistazo.
function IconCarton() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10l2 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8l2-4Z" />
      <path d="M7 4l5 3.2 5-3.2" />
    </svg>
  )
}
function IconLata() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="7" width="12" height="13" rx="1.5" />
      <ellipse cx="12" cy="7" rx="6" ry="2" />
      <path d="M6 11h12" />
    </svg>
  )
}
function IconGrano() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M12 6c-2 0-3 1-3 2s1 2 3 2" /><path d="M12 6c2 0 3 1 3 2s-1 2-3 2" />
      <path d="M12 11c-2 0-3 1-3 2s1 2 3 2" /><path d="M12 11c2 0 3 1 3 2s-1 2-3 2" />
    </svg>
  )
}
function IconGota() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c4 5 6 8.5 6 11.5a6 6 0 0 1-12 0C6 11.5 8 8 12 3Z" />
    </svg>
  )
}
function IconGalleta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <circle cx="9" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconFrasco() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="9" width="10" height="11" rx="1.5" />
      <rect x="8" y="5" width="8" height="4" rx="1" />
    </svg>
  )
}
function IconCubo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M6 12h12" /><path d="M12 6v12" />
    </svg>
  )
}
function IconPasta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0" />
      <path d="M4 16c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0" />
    </svg>
  )
}

// Mapa explícito insumo → ícono (en vez de ciclar por posición, que asignaba íconos
// que no correspondían al alimento).
const ICONO_POR_INSUMO: Record<string, () => JSX.Element> = {
  'Leche en polvo': IconCarton,
  'Proteínas enlatadas': IconLata,
  'Granos secos': IconGrano,
  'Harina de maíz precocida': IconCarton,
  'Pasta': IconPasta,
  'Avena en hojuelas': IconGrano,
  'Galletas saladas': IconGalleta,
  'Puré de papa deshidratado': IconCarton,
  'Mantequilla de maní': IconFrasco,
  'Huevos en polvo deshidratados': IconCarton,
  'Aceite vegetal': IconGota,
  'Cubos de caldo': IconCubo,
  'Sal y azúcar': IconFrasco,
  'Barras de supervivencia': IconCubo,
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" /><path d="M7 7h10v10" />
    </svg>
  )
}

function OrgCard({ org }: { org: Organizacion }) {
  const base = `
    group relative block bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark
    border-l-[3px] border-l-crisis-red p-5 h-full transition-colors
  `
  const motionProps = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.25, ease: 'easeOut' as const },
  }

  if (!org.url) {
    return (
      <motion.div {...motionProps} className={`${base} opacity-80`}>
        <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-base mb-1.5 pr-5">{org.nombre}</h3>
        <p className="text-small text-ink-muted dark:text-ink-muted-dark">{org.descripcion}</p>
        <span className="absolute top-5 right-4 font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">
          Sin link
        </span>
      </motion.div>
    )
  }
  return (
    <motion.a
      {...motionProps}
      href={org.url}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className={`${base} hover:bg-[#1A1A1A] active:bg-[#1A1A1A]`}
    >
      <span className="absolute top-5 right-4 text-ink-muted dark:text-ink-muted-dark opacity-0 group-hover:opacity-100 group-active:opacity-100 group-hover:text-crisis-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
        <ArrowIcon />
      </span>
      <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-base mb-1.5 pr-5 group-hover:text-crisis-red transition-colors">
        {org.nombre}
      </h3>
      <p className="text-small text-ink-muted dark:text-ink-muted-dark">{org.descripcion}</p>
    </motion.a>
  )
}

function InsumoCard({ item }: { item: string }) {
  const Icon = ICONO_POR_INSUMO[item] ?? IconCarton
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-start gap-3 bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark
                 border-l-[3px] border-l-crisis-red px-4 py-5 hover:bg-crisis-red/[0.08] hover:border-l-crisis-red
                 transition-colors"
    >
      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-crisis-red/10 text-crisis-red shrink-0 group-hover:bg-crisis-red group-hover:text-white transition-colors">
        <span className="w-6 h-6"><Icon /></span>
      </span>
      <span className="font-serif font-semibold text-ink dark:text-ink-dark leading-snug">{item}</span>
    </motion.div>
  )
}

export default function DonarPage() {
  const [imgOk, setImgOk] = useState(true)

  return (
    <main className="pb-10 lg:pb-14">
      {/* Hero: foto real de fondo con degradado hacia el fondo de la página. Si la
          imagen no carga (sin conexión, dominio caído), se oculta sola y queda un
          fondo sólido — no un ícono de imagen rota. */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-panel dark:bg-panel-dark">
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="https://commons.wikimedia.org/wiki/Special:FilePath/GuLong_canned_food_on_the_shelf.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgOk(false)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-paper/85 to-paper dark:from-black/40 dark:via-paper-dark/85 dark:to-paper-dark" />
        <div className="relative z-10 h-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col justify-end pb-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-eyebrow uppercase text-crisis-red mb-3"
          >
            Cómo ayudar
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-serif text-display text-ink dark:text-ink-dark"
          >
            Guía para donar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose"
          >
            Insumos más necesitados y organizaciones verificadas que están canalizando ayuda a Venezuela. Tocá cualquier tarjeta para abrir la página oficial.
          </motion.p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Insumos */}
        <section className="mb-14">
          <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Insumos más necesitados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {INSUMOS.map((item) => (
              <InsumoCard key={item} item={item} />
            ))}
          </div>
        </section>

        {/* Donaciones monetarias */}
        <section className="mb-14">
          <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Dónde donar dinero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {ORGANIZACIONES.map((org) => (
              <OrgCard key={org.nombre} org={org} />
            ))}
          </div>
        </section>

        {/* Fuentes */}
        <section className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mb-2">Verificar más organizaciones</p>
          <p className="text-small text-ink-muted dark:text-ink-muted-dark max-w-prose mb-3">
            Antes de donar a una campaña que no reconozcas, revisá su trayectoria en{' '}
            <a href="https://donarseguro.com" target="_blank" rel="noopener noreferrer" className="text-crisis-red hover:underline">
              donarseguro.com
            </a>
            , un directorio de campañas legítimas para el terremoto de Venezuela.
          </p>
          <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark">
            Fuentes:{' '}
            <a
              href="https://lga.lagranaldea.com/2026/06/28/guia-completa-para-ayudar-a-venezuela-tras-el-terremoto-donde-buscar-personas-como-donar-y-que-hacer/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink dark:hover:text-ink-dark"
            >
              La Gran Aldea
            </a>
            {' · '}
            <a
              href="https://alumnusb.org/ayuda-tras-terremoto/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink dark:hover:text-ink-dark"
            >
              AlumnUSB
            </a>
          </p>
        </section>
      </div>
    </main>
  )
}
