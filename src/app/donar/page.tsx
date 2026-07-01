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
  if (!org.url) {
    return (
      <div className={`${base} opacity-80`}>
        <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-base mb-1.5 pr-5">{org.nombre}</h3>
        <p className="text-small text-ink-muted dark:text-ink-muted-dark">{org.descripcion}</p>
        <span className="absolute top-5 right-4 font-mono text-[9px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark">
          Sin link
        </span>
      </div>
    )
  }
  return (
    <a
      href={org.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} hover:bg-[#1A1A1A] active:bg-[#1A1A1A]`}
    >
      <span className="absolute top-5 right-4 text-ink-muted dark:text-ink-muted-dark opacity-0 group-hover:opacity-100 group-active:opacity-100 group-hover:text-crisis-red transition-opacity">
        <ArrowIcon />
      </span>
      <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-base mb-1.5 pr-5 group-hover:text-crisis-red transition-colors">
        {org.nombre}
      </h3>
      <p className="text-small text-ink-muted dark:text-ink-muted-dark">{org.descripcion}</p>
    </a>
  )
}

export default function DonarPage() {
  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-10">
        <p className="text-eyebrow uppercase text-crisis-red mb-3">Cómo ayudar</p>
        <h1 className="font-serif text-display text-ink dark:text-ink-dark">Guía para donar</h1>
        <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose">
          Insumos más necesitados y organizaciones verificadas que están canalizando ayuda a Venezuela tras el sismo del 24 de junio de 2026. Tocá cualquier tarjeta para abrir la página oficial.
        </p>
      </header>

      {/* Insumos */}
      <section className="mb-14">
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Insumos más necesitados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {INSUMOS.map(item => (
            <div
              key={item}
              className="flex items-center gap-2.5 bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark border-l-[3px] border-l-crisis-red px-4 py-3.5"
            >
              <span className="text-small text-ink dark:text-ink-dark leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Donaciones monetarias */}
      <section className="mb-14">
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Dónde donar dinero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {ORGANIZACIONES.map(org => (
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
    </main>
  )
}
