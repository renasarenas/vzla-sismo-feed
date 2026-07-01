// src/lib/sources.ts
// Fuentes verificadas y sus RSS feeds

export type Source = {
  nombre: string
  tipo: 'rss' | 'x_twitter' | 'oficial'
  url: string
  confiabilidad: 'alta' | 'media'
  idioma: 'es' | 'en'
}

export const FUENTES: Source[] = [
  // Agencias internacionales — máxima confiabilidad
  {
    nombre: 'Reuters América Latina',
    tipo: 'rss',
    url: 'https://feeds.reuters.com/reuters/latinAmericaNews',
    confiabilidad: 'alta',
    idioma: 'en',
  },
  {
    nombre: 'AP News',
    tipo: 'rss',
    url: 'https://rss.apnews.com/apf-latinamerica',
    confiabilidad: 'alta',
    idioma: 'en',
  },
  {
    nombre: 'BBC Mundo',
    tipo: 'rss',
    url: 'https://feeds.bbci.co.uk/mundo/rss.xml',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'CNN en Español',
    tipo: 'rss',
    url: 'https://cnnespanol.cnn.com/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  // Medios regionales verificados
  {
    nombre: 'Univisión Noticias',
    tipo: 'rss',
    url: 'https://www.univision.com/rss/feed',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'El Tiempo (Colombia)',
    tipo: 'rss',
    url: 'https://www.eltiempo.com/rss/mundo.xml',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'La Patilla',
    tipo: 'rss',
    url: 'https://lapatilla.com/feed/',
    confiabilidad: 'media',
    idioma: 'es',
  },
  // Medios venezolanos
  {
    nombre: 'El Nacional',
    tipo: 'rss',
    url: 'https://www.el-nacional.com/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'Efecto Cocuyo',
    tipo: 'rss',
    url: 'https://efectococuyo.com/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'Runrún.es',
    tipo: 'rss',
    url: 'https://runrun.es/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'Caraota Digital',
    tipo: 'rss',
    url: 'https://caraotadigital.net/feed/',
    confiabilidad: 'media',
    idioma: 'es',
  },
  {
    nombre: 'Tal Cual',
    tipo: 'rss',
    url: 'https://talcualdigital.com/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'El Universal Venezuela',
    tipo: 'rss',
    url: 'https://www.eluniversal.com/feed/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  // LATAM adicionales
  {
    nombre: 'Infobae Venezuela',
    tipo: 'rss',
    url: 'https://www.infobae.com/feeds/rss/america/venezuela/',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'NTN24',
    tipo: 'rss',
    url: 'https://www.ntn24.com/feed',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'DW Español',
    tipo: 'rss',
    url: 'https://rss.dw.com/rdf/rss-spa-all',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'VOA Noticias',
    tipo: 'rss',
    url: 'https://www.voanoticias.com/api/zrqotit$',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'BioBioChile',
    tipo: 'rss',
    url: 'https://www.biobiochile.cl/static/feed-rss',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  {
    nombre: 'Cooperativa',
    tipo: 'rss',
    url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml',
    confiabilidad: 'alta',
    idioma: 'es',
  },
  // Cobertura internacional en inglés
  {
    nombre: 'The Guardian Venezuela',
    tipo: 'rss',
    url: 'https://www.theguardian.com/world/venezuela/rss',
    confiabilidad: 'alta',
    idioma: 'en',
  },
  {
    nombre: 'Al Jazeera English',
    tipo: 'rss',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    confiabilidad: 'alta',
    idioma: 'en',
  },
  // USGS - Datos sísmicos oficiales
  {
    nombre: 'USGS Sismos',
    tipo: 'oficial',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
    confiabilidad: 'alta',
    idioma: 'en',
  },
  // x_twitter: sin entradas — instancias públicas de Nitter caídas, no ingresan datos
]

// Keywords mínimos para pre-filtrar antes de enviar a Groq
// (evitar gastar tokens en noticias obvias de otros temas)
export const KEYWORDS_REQUERIDOS = [
  // Español
  'venezuela', 'venezuel',
  // Estados venezolanos (todos, no solo los más golpeados) — para que noticias que
  // mencionan un estado sin usar una palabra genérica de desastre también pasen el pre-filtro.
  'la guaira', 'vargas', 'carabobo', 'yaracuy', 'caracas', 'distrito capital',
  'miranda', 'trujillo', 'aragua', 'falcón', 'falcon', 'lara', 'zulia',
  'mérida', 'merida', 'táchira', 'tachira', 'barinas', 'portuguesa', 'guárico', 'guarico',
  'anzoátegui', 'anzoategui', 'sucre', 'monagas', 'nueva esparta', 'apure',
  'bolívar', 'bolivar', 'amazonas', 'delta amacuro', 'cojedes',
  'morón', 'moron', 'san felipe',
  'terremoto', 'sismo', 'temblor', 'réplica', 'replica',
  'rescate', 'desaparecid', 'escombros', 'derrumb',
  // Inglés
  'earthquake', 'quake', 'aftershock', 'magnitude', 'seismic',
  'rescue', 'missing', 'rubble', 'collapse', 'relief',
]

export function preFiltroPasa(titulo: string, desc: string): boolean {
  const texto = `${titulo} ${desc}`.toLowerCase()
  return KEYWORDS_REQUERIDOS.some(kw => texto.includes(kw))
}

// Ciudades venezolanas conocidas → estado (zona) al que pertenecen.
// Se usa como respaldo determinístico cuando el fact-checker (LLM) no logra
// inferir una zona: si el titular/descripción menciona una de estas ciudades,
// la mapeamos directo a su estado sin depender del modelo.
export const CIUDAD_A_ESTADO: Record<string, string> = {
  // Distrito Capital
  'caracas': 'distrito_capital',
  // La Guaira
  'la guaira': 'la_guaira',
  'catia la mar': 'la_guaira',
  'maiquetía': 'la_guaira',
  'maiquetia': 'la_guaira',
  // Miranda
  'los teques': 'miranda',
  'guarenas': 'miranda',
  'guatire': 'miranda',
  'petare': 'miranda',
  'charallave': 'miranda',
  // Carabobo
  'valencia': 'carabobo',
  'puerto cabello': 'carabobo',
  'guacara': 'carabobo',
  'naguanagua': 'carabobo',
  // Yaracuy
  'san felipe': 'yaracuy',
  'chivacoa': 'yaracuy',
  'yaritagua': 'yaracuy',
  'morón': 'yaracuy',
  'moron': 'yaracuy',
  // Aragua
  'maracay': 'aragua',
  'la victoria': 'aragua',
  'cagua': 'aragua',
  'turmero': 'aragua',
  // Zulia
  'maracaibo': 'zulia',
  'cabimas': 'zulia',
  'ciudad ojeda': 'zulia',
  // Lara
  'barquisimeto': 'lara',
  'carora': 'lara',
  // Falcón
  'coro': 'falcon',
  'punto fijo': 'falcon',
  // Táchira
  'san cristóbal': 'tachira',
  'san cristobal': 'tachira',
  // Mérida
  'mérida': 'merida',
  'merida': 'merida',
  'el vigía': 'merida',
  'el vigia': 'merida',
  // Trujillo
  'valera': 'trujillo',
  // Barinas
  'barinas': 'barinas',
  // Portuguesa
  'guanare': 'portuguesa',
  'acarigua': 'portuguesa',
  // Cojedes
  'san carlos de austria': 'cojedes',
  // Guárico
  'san juan de los morros': 'guarico',
  'calabozo': 'guarico',
  // Apure
  'san fernando de apure': 'apure',
  // Anzoátegui
  'barcelona': 'anzoategui',
  'puerto la cruz': 'anzoategui',
  'lechería': 'anzoategui',
  'lecheria': 'anzoategui',
  'el tigre': 'anzoategui',
  // Sucre
  'cumaná': 'sucre',
  'cumana': 'sucre',
  'carúpano': 'sucre',
  'carupano': 'sucre',
  // Monagas
  'maturín': 'monagas',
  'maturin': 'monagas',
  // Nueva Esparta
  'porlamar': 'nueva_esparta',
  'isla de margarita': 'nueva_esparta',
  // Bolívar
  'ciudad bolívar': 'bolivar',
  'ciudad bolivar': 'bolivar',
  'ciudad guayana': 'bolivar',
  'puerto ordaz': 'bolivar',
  // Amazonas
  'puerto ayacucho': 'amazonas',
  // Delta Amacuro
  'tucupita': 'delta_amacuro',
}

// Busca nombres de ciudad conocidos en el texto y devuelve su estado.
// Ordena las claves por longitud descendente para que coincidencias más
// específicas ("puerto la cruz") ganen sobre las más cortas ("puerto cabello").
export function detectarZonaPorCiudad(texto: string): string | null {
  const t = texto.toLowerCase()
  const ciudades = Object.keys(CIUDAD_A_ESTADO).sort((a, b) => b.length - a.length)
  for (const ciudad of ciudades) {
    if (t.includes(ciudad)) return CIUDAD_A_ESTADO[ciudad]
  }
  return null
}
