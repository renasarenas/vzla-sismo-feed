# Venezuela Sismo — Feed de noticias verificadas

![Estado: Activo](https://img.shields.io/badge/Estado-Activo-success?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

Feed en tiempo real de noticias verificadas sobre sismos en Venezuela.
Stack: **Next.js 14 · Supabase · Tailwind CSS · Claude API (fact-checking)**

---

## ⚙️ Cómo funciona

| Etapa | Descripción |
| :--- | :--- |
| **1. Ingesta** | Monitoreo de fuentes en tiempo real (RSS / USGS / Nitter). |
| **2. Filtrado** | Aplicación de palabras clave para determinar relevancia inmediata. |
| **3. Fact-Checking** | Análisis mediante Claude/Groq para asignar estado de veracidad y etiquetas. |

---

## ✨ Características Principales

* **Realtime:** Actualizaciones instantáneas en el cliente mediante Supabase Realtime.
* **Robustez de Ingesta:** Sistema de prevención de duplicados mediante `.maybeSingle()`.
* **Validación Estricta:** Filtrado en el feed basado en `factcheck_status !== 'aprobado'` para evitar falsos positivos.

---

## 🚀 Configuración Local

Sigue estos pasos para correr el proyecto en tu máquina:

```bash
# 1. Clonar el repositorio
git clone [https://github.com/renasarenas/vzla-sismo-feed.git](https://github.com/renasarenas/vzla-sismo-feed.git)

# 2. Entrar a la carpeta
cd vzla-sismo-feed

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno (Añade tus credenciales reales aquí)
cp .env.example .env.local

# 5. Ejecutar el servidor de desarrollo
npm run dev
