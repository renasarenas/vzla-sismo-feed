// src/lib/sources.ts
// Fuentes verificadas y sus RSS feeds

export type Source = {
  nombre: string
  tipo: 'rss' | 'x_twitter' | 'oficial'
  url: string
  confiabilidad: 'alta' | 'media'
}

export const FUENTES: Source[] = [
  // Agencias internacionales — máxima confiabilidad
  {
    nombre: 'Reuters América Latina',
    tipo: 'rss',
    url: 'https://feeds.reuters.com/reuters/latinAmericaNews',
    confiabilidad: 'alta',
  },
  {
    nombre: 'AP News',
    tipo: 'rss',
    url: 'https://rss.apnews.com/apf-latinamerica',
    confiabilidad: 'alta',
  },
  {
    nombre: 'BBC Mundo',
    tipo: 'rss',
    url: 'https://feeds.bbci.co.uk/mundo/rss.xml',
    confiabilidad: 'alta',
  },
  {
    nombre: 'CNN en Español',
    tipo: 'rss',
    url: 'https://cnnespanol.cnn.com/feed/',
    confiabilidad: 'alta',
  },
  // Medios regionales verificados
  {
    nombre: 'Univisión Noticias',
    tipo: 'rss',
    url: 'https://www.univision.com/rss/feed',
    confiabilidad: 'alta',
  },
  {
    nombre: 'El Tiempo (Colombia)',
    tipo: 'rss',
    url: 'https://www.eltiempo.com/rss/mundo.xml',
    confiabilidad: 'alta',
  },
  // USGS - Datos sísmicos oficiales
  {
    nombre: 'USGS Sismos',
    tipo: 'oficial',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
    confiabilidad: 'alta',
  },
  // Nitter (X/Twitter sin API de pago) — confiabilidad media, necesita más fact-check
  {
    nombre: 'X #TerremotoVenezuela',
    tipo: 'x_twitter',
    url: 'https://nitter.net/search/rss?q=%23TerremotoVenezuela&f=tweets',
    confiabilidad: 'media',
  },
  {
    nombre: 'X #SismoVenezuela',
    tipo: 'x_twitter',
    url: 'https://nitter.net/search/rss?q=%23SismoVenezuela&f=tweets',
    confiabilidad: 'media',
  },
]

// Keywords mínimos para pre-filtrar antes de enviar a Claude
// (evitar gastar tokens en noticias obvias de otros temas)
export const KEYWORDS_REQUERIDOS = [
  'venezuela', 'venezuel',
  'la guaira', 'carabobo', 'yaracuy', 'caracas', 'morón', 'moron',
  'terremoto', 'sismo', 'temblor', 'réplica', 'replica',
  'rescate', 'desaparecid', 'escombros', 'derrumb',
]

export function preFiltroPasa(titulo: string, desc: string): boolean {
  const texto = `${titulo} ${desc}`.toLowerCase()
  return KEYWORDS_REQUERIDOS.some(kw => texto.includes(kw))
}
