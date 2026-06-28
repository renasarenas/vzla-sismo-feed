![CI](https://github.com/renasarenas/vzla-sismo-feed/actions/workflows/ci.yml/badge.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Build4Venezuela](https://img.shields.io/badge/Hackathon-Build4Venezuela-red)

# Venezuela Sismo — Feed de noticias verificadas

Feed en tiempo real de noticias verificadas sobre el doblete sísmico del 24 de junio de 2026 en Venezuela.

🔴 En vivo: https://vzla-sismo-feed.vercel.app

---

## El evento

El 24 de junio de 2026 ocurrieron dos sismos con apenas 40 segundos de diferencia: magnitud 7.2 y 7.5, con epicentro cerca de Morón y San Felipe (Yaracuy/Carabobo). Las zonas más afectadas fueron La Guaira, Caracas, Carabobo, Miranda y Trujillo. Cifras actuales: ~920 muertos, ~3.360 heridos, más de 50.000 desaparecidos. El gobierno venezolano declaró estado de emergencia.

Este proyecto existe para agregar en un solo lugar las noticias verificadas sobre el evento, filtrando desinformación y ruido automaticamente.

---

## Cómo funciona

```
RSS / USGS GeoJSON / Nitter
           │
           ▼
  [Pre-filtro keywords]   ← sin costo, sin latencia
           │ pasa
           ▼
  [Groq fact-checker]     ← llama-3.3-70b verifica relevancia, asigna tag, da confianza 0-100
           │ aprobado
           ▼
  [Supabase]              ← todas las noticias se guardan; RLS expone solo las aprobadas
           │
           ▼
  [Supabase Realtime]     ← push por WebSocket al browser cuando llega algo nuevo
           │
           ▼
  [Feed]                  ← se actualiza solo, sin recargar
```

Un cron en Vercel dispara el pipeline cada 5 minutos.

---

## Los dos filtros

**Pre-filtro de keywords.** Antes de llamar a cualquier API, cada noticia pasa por una lista de palabras clave: nombres de estados venezolanos, términos sísmicos, palabras de rescate. Si ninguna aparece en el titular ni en la descripción, la noticia se descarta en el momento. Elimina entre el 70% y el 80% del volumen entrante sin gastar un solo token.

**Groq fact-checker.** Las noticias que pasan el pre-filtro se envían a `llama-3.3-70b-versatile` con un system prompt que describe el evento en detalle: fechas, magnitudes, epicentro, cifras conocidas. El modelo devuelve un JSON con tres campos: `status` (aprobado / rechazado / dudoso), `tag` (categoría de la noticia) y `confianza` (0–100). Solo las noticias con `status = aprobado` llegan al feed público. Las rechazadas y dudosas se guardan en la base de datos para auditoría, pero Row Level Security de Supabase impide que el cliente las vea.

El USGS es la excepción: sus datos sísmicos se auto-aprueban con confianza 99 sin pasar por el modelo, porque son fuente oficial.

---

## Tags

| Tag | Qué cubre |
|-----|-----------|
| `sismo` | Datos técnicos: magnitud, epicentro, profundidad, hora |
| `rescate` | Labores de búsqueda y rescate, equipos, supervivientes |
| `desaparecidos` | Personas buscadas, plataformas de localización |
| `puntos_acopio` | Centros de donación en especie, dónde llevar ayuda |
| `ayuda_humanitaria` | ONG, refugios, distribución de ayuda |
| `replicas` | Aftershocks y sismos posteriores al doblete principal |
| `donaciones` | Cómo donar dinero, canales verificados |
| `internacional` | Respuesta de otros países, ayuda exterior, diplomacia |

---

## Fuentes

**Alta confiabilidad** — aprobadas con menor scrutiny del modelo:

- Reuters América Latina
- AP News
- BBC Mundo
- CNN en Español
- Univisión Noticias
- El Tiempo (Colombia)
- El Nacional
- Efecto Cocuyo
- Runrún.es
- Tal Cual
- El Universal Venezuela
- Infobae Venezuela
- NTN24
- DW Español
- VOA Noticias
- The Guardian Venezuela
- Al Jazeera English
- USGS Earthquake Hazards Program (auto-aprobado, sin fact-check)
- @Funvisis
- @PCivil_Ve
- @CruzRojaVe
- @MariaCorinaYA
- @nayibbukele
- @usembassyve

**Confiabilidad media** — el modelo aplica criterios más estrictos antes de aprobar:

- La Patilla
- Caraota Digital
- BioBioChile
- Cooperativa
- @UHN_Plus
- @OrlvndoA
- @EmmaRincon
- X #TerremotoVenezuela (via Nitter RSS)
- X #SismoVenezuela (via Nitter RSS)

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Anon key pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Service role key (solo servidor) |
| `GROQ_API_KEY` | Sí | API key de Groq (gratuita en console.groq.com) |
| `CRON_SECRET` | Sí (prod) | Secret para proteger `/api/ingest` — generar con `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública del deploy (ej: https://vzla-sismo-feed.vercel.app) |

---

## Deploy rápido

1. Fork de este repo
2. Crear proyecto en Supabase y correr las migraciones en `supabase/migrations/` en orden numérico
3. Obtener una API key gratuita en https://console.groq.com
4. Deploy en Vercel conectando el fork; agregar todas las variables de entorno del paso anterior
5. En Vercel → Settings → Cron Jobs, verificar que el cron de `/api/ingest` aparece activo

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para instrucciones de setup local y convenciones del proyecto.

---

## Hackathon

Este proyecto fue desarrollado para [Build4Venezuela](https://build4venezuela.org) en respuesta al doblete sísmico del 24 de junio de 2026.

---

## Licencia

MIT — ver [LICENSE](LICENSE).
