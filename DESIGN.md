---
name: Venezuela Sismo
description: Dashboard de emergencia en tiempo real para sismos en Venezuela
colors:
  paper: "#F4F4F2"
  paper-dark: "#0D0D0D"
  panel: "#FFFFFF"
  panel-dark: "#161616"
  ink: "#17171A"
  ink-dark: "#E9E9E6"
  ink-muted: "#6B6B66"
  ink-muted-dark: "#9A9A93"
  rule: "#E2E1DC"
  rule-dark: "#2A2B31"
  crisis-red: "#CF1020"
typography:
  display:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontSize: "clamp(1.75rem, 2vw + 1rem, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.08
  body:
    fontFamily: "var(--font-sans), Inter, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

## Overview
El sistema visual de Venezuela Sismo adopta una estética editorial sobria y formal para transmitir urgencia, seriedad y confiabilidad en un contexto de crisis humanitaria. Evita las convenciones de plantillas SaaS contemporáneas e implementa contrastes elevados, espaciado rítmico y tipografía clásica inspirada en la prensa escrita.

## Colors
La paleta se fundamenta en un esquema cromático neutro frío y desaturado con un único acento de crisis institucional:
- **Paper**: Superficie base del sitio (`#F4F4F2` en claro, `#0D0D0D` en oscuro).
- **Panel**: Fondos para tarjetas o paneles contenedores (`#FFFFFF` en claro, `#161616` en oscuro).
- **Ink**: Texto principal de alto contraste (`#17171A` en claro, `#E9E9E6` en oscuro).
- **Ink Muted**: Textos secundarios e informativos (`#6B6B66` en claro, `#9A9A93` en oscuro).
- **Rule**: Líneas de separación e insets (`#E2E1DC` en claro, `#2A2B31` en oscuro).
- **Crisis Red**: Tono institucional de emergencia (`#CF1020`) para alertas e interacciones clave.

## Typography
El sistema tipográfico combina una serif con cuerpo para títulos editoriales y una sans limpia para texto funcional:
- **Newsreader (Serif)**: Utilizada para encabezados principales, nombres de organizaciones y títulos que requieren peso institucional.
- **Inter (Sans)**: Utilizada para cuerpos de lectura, descripciones y datos técnicos estructurados.
- **Eyebrow**: Texto pequeño con mayúsculas y espaciado expandido (`0.7rem`, espaciado `0.14em`, peso 600) para metadatos, usado deliberadamente y no como decoración repetitiva.

## Elevation
El portal es mayormente plano y descansa en la delimitación mediante bordes sutiles de color `rule`. Cuando se requiere profundidad:
- **Soft Shadow**: `0 1px 2px rgba(20,19,17,0.04), 0 6px 16px rgba(20,19,17,0.05)`
- **Lift Shadow**: `0 2px 4px rgba(20,19,17,0.04), 0 12px 28px rgba(20,19,17,0.10)`

## Components
### Tarjetas de Donación (Organizaciones)
- **Fondo**: `panel`
- **Borde**: `1px solid rule`
- **Esquinas**: `rounded.sm` (4px)
- **Padding**: `20px` (spacing.md + 4px)
- **Interacción**: Desplazamiento vertical sutil (`translateY(-4px)`) y cambio de color del título al acento `crisis-red` en hover.

### Tarjetas de Insumos
- **Fondo**: `panel`
- **Borde**: `1px solid rule`
- **Esquinas**: `rounded.sm` (4px)
- **Padding**: `20px`
- **Interacción**: Animación de escala sutil al pulsar y hover con fondo matizado.

## Do's and Don'ts
### Do's
- Mantener contrastes de color estricto superiores a 4.5:1.
- Respetar el uso de SVG geométricos sencillos para todos los iconos.
- Diseñar interfaces adaptadas al modo oscuro y claro de forma equivalente.
- Limitar el largo del párrafo en bodies a un máximo de 65–75 caracteres para facilitar la lectura.

### Don'ts
- **No usar bordes izquierdos coloreados gruesos (side-stripe borders)** en tarjetas ni alertas.
- **No usar emojis** como elementos decorativos o estructurales de navegación.
- **No aplicar gradientes decorativos** ni efectos de desenfoque de fondo (glassmorphism) innecesarios.
- **No sobrepasar esquinas redondeadas de 12px** en tarjetas principales para evitar el aspecto infantil de UI redondas.
