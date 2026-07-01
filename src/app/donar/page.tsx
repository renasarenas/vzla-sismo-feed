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
  {
    nombre: 'Dona con Yummy',
    descripcion: 'Campaña de la súper-app venezolana Yummy para canalizar donaciones hacia la ayuda a los afectados por el sismo, con recaudación digital directa.',
    url: 'https://dona.yummyrides.com/',
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

function OrgCard({ org, index }: { org: Organizacion; index: number }) {
  const motionProps = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: 'easeOut' as const },
  }

  if (!org.url) {
    return (
      <motion.div
        {...motionProps}
        className="group relative block bg-panel/60 dark:bg-panel-dark/60 border border-rule dark:border-rule-dark p-5 h-full rounded-sm"
      >
        <span className="absolute top-5 right-4 font-mono text-[9px] uppercase tracking-widest text-ink-muted/70 dark:text-ink-muted-dark/70 bg-paper dark:bg-paper-dark px-1.5 py-0.5 rounded-sm">
          Socio local
        </span>
        <h3 className="font-serif font-semibold text-ink/70 dark:text-ink-dark/70 text-base mb-1.5 pr-16">
          {org.nombre}
        </h3>
        <p className="text-small text-ink-muted/80 dark:text-ink-muted-dark/80">
          {org.descripcion}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.a
      {...motionProps}
      href={org.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      className="group relative block bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5 h-full rounded-sm hover:border-crisis-red/30 dark:hover:border-crisis-red/40 hover:bg-ink/[0.01] dark:hover:bg-ink-dark/[0.01] hover:shadow-soft transition-all duration-200"
    >
      <span className="absolute top-5 right-4 text-ink-muted dark:text-ink-muted-dark opacity-30 group-hover:opacity-100 group-hover:text-crisis-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
        <ArrowIcon />
      </span>
      <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-base mb-1.5 pr-8 group-hover:text-crisis-red transition-colors">
        {org.nombre}
      </h3>
      <p className="text-small text-ink-muted dark:text-ink-muted-dark">
        {org.descripcion}
      </p>
    </motion.a>
  )
}

function InsumoCard({ item, index }: { item: string; index: number }) {
  const Icon = ICONO_POR_INSUMO[item] ?? IconCarton
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      className="group flex flex-col items-start gap-4 bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark
                 p-5 rounded-sm hover:border-crisis-red/30 dark:hover:border-crisis-red/40 hover:shadow-soft transition-all duration-200"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-md bg-paper dark:bg-paper-dark border border-rule dark:border-rule-dark text-ink-muted dark:text-ink-muted-dark shrink-0 group-hover:bg-crisis-red/10 group-hover:text-crisis-red group-hover:border-crisis-red/20 transition-all duration-200">
        <span className="w-5 h-5"><Icon /></span>
      </span>
      <span className="font-serif font-semibold text-ink dark:text-ink-dark leading-snug">{item}</span>
    </motion.div>
  )
}

export default function DonarPage() {
  const [imgOk, setImgOk] = useState(true)

  return (
    <main className="pb-12 lg:pb-16">
      {/* Hero: foto real de fondo con degradado hacia el fondo de la página. Si la
          imagen no carga (sin conexión, dominio caído), se oculta sola y queda un
          fondo sólido — no un ícono de imagen rota. */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-panel dark:bg-panel-dark border-b border-rule dark:border-rule-dark mb-10">
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/donar-hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-[1.02] dark:brightness-50 opacity-15 dark:opacity-25"
            onError={() => setImgOk(false)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/85 to-paper dark:via-paper-dark/85 dark:to-paper-dark" />
        <div className="relative z-10 h-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col justify-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-[10px] uppercase tracking-widest text-crisis-red mb-3 font-semibold"
          >
            Iniciativa Humanitaria
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-serif text-hero lg:text-masthead text-ink dark:text-ink-dark leading-none"
          >
            Guía para donar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-lead text-ink/75 dark:text-ink-dark/75 mt-3 max-w-prose"
          >
            Directorio verificado de organizaciones y requerimientos urgentes de ayuda humanitaria para los afectados por el sismo en Venezuela. Tocá cualquier recurso para acceder a los canales oficiales.
          </motion.p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Insumos */}
        <section className="mb-16">
          <div className="flex flex-col mb-6">
            <h2 className="font-serif text-display text-ink dark:text-ink-dark">
              Insumos prioritarios
            </h2>
            <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
              Alimentos no perecederos y suministros médicos esenciales solicitados en los centros de acopio.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {INSUMOS.map((item, i) => (
              <InsumoCard key={item} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Donaciones monetarias */}
        <section className="mb-16">
          <div className="flex flex-col mb-6">
            <h2 className="font-serif text-display text-ink dark:text-ink-dark">
              Dónde donar dinero
            </h2>
            <p className="text-small text-ink/75 dark:text-ink-dark/75 mt-1">
              Entidades internacionales y locales con despliegue activo sobre el terreno.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ORGANIZACIONES.map((org, i) => (
              <OrgCard key={org.nombre} org={org} index={i} />
            ))}
          </div>
        </section>

        {/* Fuentes y Seguridad */}
        <section className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-6 rounded-sm mb-12">
          <h3 className="font-serif font-semibold text-lg text-ink dark:text-ink-dark mb-2">
            Seguridad en la donación
          </h3>
          <p className="text-small text-ink/75 dark:text-ink-dark/75 max-w-prose mb-4">
            Antes de transferir fondos a cualquier campaña personal o de terceros no listados, verificá su legitimidad en{' '}
            <a href="https://donarseguro.com" target="_blank" rel="noopener noreferrer" className="text-crisis-red font-medium hover:underline">
              donarseguro.com
            </a>
            , una plataforma ciudadana dedicada a validar iniciativas de ayuda humanitaria para el terremoto de Venezuela.
          </p>
          <div className="border-t border-rule dark:border-rule-dark pt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark">
            <span>
              Fuentes oficiales y reportes:{' '}
              <a
                href="https://lga.lagranaldea.com/2026/06/28/guia-completa-para-ayudar-a-venezuela-tras-el-terremoto-donde-buscar-personas-como-donar-y-que-hacer/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ink dark:hover:text-ink-dark transition-colors"
              >
                La Gran Aldea
              </a>
              {' · '}
              <a
                href="https://alumnusb.org/ayuda-tras-terremoto/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ink dark:hover:text-ink-dark transition-colors"
              >
                AlumnUSB
              </a>
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
