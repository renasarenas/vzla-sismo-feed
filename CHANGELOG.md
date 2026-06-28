# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [0.2.0] — 2026-06-28

### Added

- Soporte de idioma en fuentes y noticias: campo `idioma: 'es' | 'en'` en el tipo `Fuente` y migración 004 que agrega la columna `idioma` a la tabla `noticias`
- 12 fuentes RSS nuevas: El Nacional, Efecto Cocuyo, Runrún.es, Caraota Digital, Tal Cual, El Universal Venezuela, Infobae Venezuela, NTN24, DW Español, VOA Noticias, BioBioChile, Cooperativa, The Guardian Venezuela, Al Jazeera English
- Filtro de idioma en la UI del feed: toggle ES / EN / Todos
- Pill "EN" en tarjetas de noticias en inglés
- Keywords en inglés en el pre-filtro: earthquake, quake, aftershock, tremor, seismic, magnitude, epicenter, fault, Richter, aftershocks, death toll, survivors, rubble, collapse, debris

### Fixed

- Cron de Vercel corregido de `0 0 * * *` (una vez al día) a `*/5 * * * *` (cada 5 minutos)

---

## [0.1.0] — 2026-06-25

### Added

- Feed principal con noticias verificadas en tiempo real vía Supabase Realtime (WebSocket, sin recargar la página)
- Pipeline de ingestión completo: RSS / USGS GeoJSON / Nitter → pre-filtro de keywords → Groq fact-checker (`llama-3.3-70b-versatile`) → Supabase
- 8 tags de categorización: `sismo`, `rescate`, `desaparecidos`, `puntos_acopio`, `ayuda_humanitaria`, `replicas`, `donaciones`, `internacional`
- Fuentes iniciales: Reuters América Latina, AP News, BBC Mundo, CNN en Español, Univisión Noticias, El Tiempo (Colombia), La Patilla, USGS Earthquake Hazards Program, cuentas X via Nitter (#TerremotoVenezuela, #SismoVenezuela)
- Auto-aprobación de datos USGS con confianza 99, sin pasar por el modelo (fuente oficial)
- Página de estadísticas por tag
- Mapa de sismos con Leaflet
- Directorio de emergencias venezolanas (Protección Civil, Bomberos, FUNVISIS)
- Modo oscuro
- PWA instalable en móvil (manifest + service worker)
- Paginación con infinite scroll
- Búsqueda por texto en el feed
