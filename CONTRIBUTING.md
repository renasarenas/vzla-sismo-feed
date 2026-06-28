# Guía de contribución

## Requisitos previos

- Node.js >= 20
- Cuenta en Supabase (gratuita) — https://supabase.com
- Cuenta en Groq (gratuita) — https://console.groq.com
- Cuenta en Vercel (gratuita) — https://vercel.com

## Setup local

1. Haz fork del repo y clona tu fork:
   ```bash
   git clone https://github.com/<tu-usuario>/vzla-sismo-feed.git
   cd vzla-sismo-feed
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de variables de entorno y rellena los valores:
   ```bash
   cp .env.example .env.local
   ```
   Ver la sección de variables en el README para saber qué poner en cada campo.

4. Aplica las migraciones de base de datos: abre el SQL Editor de tu proyecto en Supabase y ejecuta los archivos en `supabase/migrations/` en orden numérico (001, 002, 003, 004…).

5. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Para probar el ingestor manualmente en desarrollo (no requiere header de autorización):
   ```bash
   curl http://localhost:3000/api/ingest
   ```

## Cómo agregar una nueva fuente RSS

Solo hay que agregar una entrada al array `FUENTES` en `src/lib/sources.ts`:

```ts
{
  nombre: 'Nombre legible de la fuente',
  tipo: 'rss',           // 'rss' | 'x_twitter' | 'oficial'
  url: 'https://ejemplo.com/feed/',
  confiabilidad: 'alta', // 'alta' | 'media'
  idioma: 'es',          // 'es' | 'en'
},
```

Antes de agregar, verifica que la URL devuelve XML válido: `curl -s <url> | head -5` debe mostrar un elemento `<rss>` o `<feed>`.

## Convenciones de commits

Usar [Conventional Commits](https://www.conventionalcommits.org/) en minúsculas:

| Prefijo | Cuándo usarlo |
|---------|---------------|
| `feat(scope): descripción` | Nueva funcionalidad |
| `fix(scope): descripción` | Corrección de bug |
| `docs: descripción` | Solo cambios de documentación |
| `chore: descripción` | Mantenimiento, dependencias, configuración |

Un commit por feature. No usar `git add .` si hay cambios mezclados en distintas features — stagear los archivos uno por uno.

## Proceso de PR

1. Crea una rama desde `master` con nombre descriptivo:
   ```bash
   git checkout -b feat/nombre-de-la-feature
   ```

2. Un PR por feature o fix.

3. El build de CI debe pasar antes de pedir review. Puedes verificarlo localmente:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

4. Asigna a `renasarenas` como reviewer.
