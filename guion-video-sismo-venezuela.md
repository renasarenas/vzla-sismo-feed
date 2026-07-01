# Guion — Sismo Venezuela (video 3-5 min)

**Título propuesto:** *Sismo Venezuela: la información también rescata*
**Tono:** serio, sobrio, informativo — sin golpes bajos ni música dramática exagerada. Se apoya en datos reales, no en efectismo.
**Idioma:** español (Venezuela).
**Formato de grabación:** capturas de pantalla del sitio (`vzla-sismo-feed.vercel.app`) navegando en vivo, no mockups estáticos — que se vea el scroll, los filtros funcionando, el mapa, las tarjetas de donación.

Cifras usadas abajo, tomadas en vivo del sitio al momento de escribir esto (van a seguir subiendo — actualizá antes de grabar si cambiaron):
- 106 noticias verificadas
- ~2.000 muertos (Caraota Digital), ~10.571 heridos (The Guardian Venezuela), +50.000 desaparecidos
- Doblete sísmico M7.2 + M7.5, 40 segundos de diferencia, epicentro Yaracuy/Carabobo
- Zona más afectada: La Guaira

---

## 0:00 – 0:20 — Cold open

**Pantalla:** Boletín (`/`) cargando, scroll lento por las primeras tarjetas de noticias. Sonido ambiente sutil, sin música todavía.

**Locución:**
> "24 de junio de 2026. Dos terremotos, cuarenta segundos de diferencia. Venezuela no volvió a ser la misma."

*(pausa de 1-2 segundos, corte a negro o fade)*

---

## 0:20 – 1:10 — La situación

**Pantalla:** Mapa sísmico (`/mapa`), zoom lento sobre los epicentros animados. Corte a los indicadores (`/stats`) mostrando el total de reportes.

**Locución:**
> "Magnitud 7.2 y 7.5, con epicentro entre Yaracuy y Carabobo. La Guaira, la zona más golpeada. Hasta hoy, casi dos mil muertos confirmados, más de diez mil heridos, y decenas de miles de personas todavía desaparecidas.
>
> Números que cambian todos los días — y que muchas veces llegan tarde, incompletos, o mezclados con rumores."

**Sugerencia visual:** overlay de texto (lower third) con las cifras clave mientras se dicen: "2.000 MUERTOS · 10.571 HERIDOS · +50.000 DESAPARECIDOS" en el estilo tipográfico rojo/mono del sitio.

---

## 1:10 – 1:50 — El problema

**Pantalla:** Split o corte rápido entre capturas de redes sociales genéricas (ruido, desinformación) y luego el feed del sitio ordenándose.

**Locución:**
> "Después de un desastre así, la información se vuelve un desastre aparte. Cifras infladas, videos viejos reciclados como si fueran de ahora, cadenas de WhatsApp sin fuente. Para las familias que buscan a alguien, o que necesitan saber dónde llevar ayuda, cada minuto perdido filtrando ruido, cuenta."

---

## 1:50 – 2:50 — El proyecto

**Pantalla:** Recorrido activo del boletín: escribir en el buscador, tocar un filtro de categoría (por ejemplo "Rescate"), abrir el selector de zona y elegir "La Guaira", mostrar cómo cambian los resultados en vivo.

**Locución:**
> "Sismo Venezuela es un boletín que filtra ese ruido. Cada noticia que entra —de más de veinte fuentes, en español e inglés— pasa por un verificador automático antes de publicarse: se revisa que sea real, que esté relacionada al sismo, y se clasifica por categoría y por estado.
>
> ¿Buscás noticias solo de Carabobo? Un filtro. ¿Solo sobre desaparecidos? Otro clic. El mapa muestra los epicentros y las alertas de tsunami en tiempo real. Y estos indicadores de acá —" *(mostrar `/stats`)* "— se actualizan solos, extraídos directamente de las noticias verificadas, no cifras puestas a mano."

**Sugerencia visual:** acelerar un poco el ritmo de corte acá (jump cuts cada 3-4 segundos) para transmitir "es rápido, es fácil de usar".

---

## 2:50 – 3:40 — Cómo ayudar

**Pantalla:** Navegar a `/donar`, mostrar el hero animado, scrollear por los insumos (tocar uno para que se vea el hover), tocar una tarjeta de organización para mostrar que abre el link real.

**Locución:**
> "Y si lo que buscás es ayudar, hay una sección dedicada: qué insumos hacen más falta ahora mismo, y una lista de organizaciones verificadas —de World Central Kitchen a Cáritas Venezuela— a las que podés donar directamente, un toque y estás en la página oficial."

---

## 3:40 – 4:10 — Cierre / llamado a la acción

**Pantalla:** Volver al boletín, plano general, texto final en pantalla con la URL.

**Locución:**
> "La información verificada no reemplaza la ayuda en el terreno. Pero puede ayudar a que esa ayuda llegue mejor, y más rápido. Sismo Venezuela — el boletín completo, en el link."

**Texto final en pantalla:** `vzla-sismo-feed.vercel.app` + logo/isotipo del sitio (el trazo de sismógrafo rojo del navbar).

---

## Notas para la edición en DaVinci Resolve

- **Ritmo:** cortes de 3-6 segundos en la sección del recorrido del producto (1:50-2:50); planos más largos (8-12 seg) en la intro y el cierre para que respire.
- **Color:** el sitio ya es oscuro con acento rojo (#CF1020 aprox.) — no hace falta gradear mucho, solo asegurate de que el rojo no queme (usa un vectorscope, mantenelo dentro de la línea de skin tone si agregás algún clip con personas).
- **Texto en pantalla:** replicá la tipografía del sitio si podés (serif para títulos, mono en mayúsculas para datos/labels) — le da coherencia de marca al video.
- **Subtítulos:** agregalos siempre, aunque el video lleve locución — gran parte del consumo en redes es sin audio.
- **Música:** algo sobrio, sin percusión dramática tipo trailer — algo ambiental/piano bajo funciona mejor para no caer en golpe bajo con un tema de muertos reales.
- **Zoom/Ken Burns en el mapa:** un leve zoom lento sobre los epicentros ayuda a que la captura de pantalla estática no se sienta plana.
- **Exportación:** si es para redes (Reels/TikTok/Shorts) armá también un recorte vertical 9:16 de los primeros 30-45 segundos como teaser aparte.

---

## Variante corta (si necesitás una versión de 30-45 seg para redes)

> "24 de junio. Dos terremotos, cuarenta segundos de diferencia. Casi dos mil muertos, más de diez mil heridos, decenas de miles desaparecidos — y la información, la mayoría de las veces, llega tarde o llena de ruido.
>
> Sismo Venezuela verifica cada noticia antes de publicarla, la ordena por zona y categoría, y te muestra dónde y cómo ayudar. Un boletín, sin ruido. Link en la bio."
