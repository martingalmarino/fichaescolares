# Láminas para colorear — instrucciones para Cursor

Contexto: sitio Aulita (Astro + Tailwind). El texto le habla a docentes y familias, no a chicos.

## 1. Archivos
- Copiá `svg/*` a `public/laminas/`. Copiá `laminas.json` a `src/data/laminas.json`.
- `png/` queda solo como respaldo (no se publica).
- Los SVG tienen viewBox, sin width/height fijos, relleno negro. No los edites a mano.

## 2. Sacar lo viejo
- ELIMINÁ el generador actual que dibuja SVG con código para las láminas (componentes, utilidades y rutas). Borrá las importaciones y redirigí con 301 las URLs viejas a `/laminas/`.

## 3. Datos
- Cargá `laminas.json` (slug, titulo, categoria, efemerides, dificultad, alt, estado, origen, svg).
- Listá y generá páginas SOLO con `estado === "publicar"`. Las `revisar` (cabildo, escudo-nacional, casa-de-tucuman, hornero, flor-de-ceibo) no se generan ni aparecen en sitemap hasta que se reemplacen.
- Verificá vos las fechas de `efemerides` contra el calendario oficial antes de publicar (ej. 8/9 Día del Hornero, 22/11 ceibo: confirmalas).

## 4. Hub `/laminas/`
- H1 "Láminas patrias para colorear e imprimir", intro corta para docentes y familias.
- Filtros por categoría (Símbolos patrios, 25 de Mayo, 9 de Julio, San Martín, Tradiciones, Naturaleza) y por efeméride; también por dificultad. Filtro en cliente (isla Preact chica) con URL `?categoria=&efemeride=`.
- Grilla de tarjetas con la miniatura (`<img loading="lazy" decoding="async" alt=...>`), título, dificultad.
- Dentro del menú: categoría "Imprimibles" → "Láminas para colorear". En cada página de efeméride, bloque "Láminas para esta fecha".

## 5. Página por lámina `/laminas/[slug]/` (getStaticPaths)
- Vista A4 vertical lista para imprimir: título (editable), línea opcional "Nombre: ____ Fecha: ____" (switch), franja de texto editable (contenteditable o input) y el SVG centrado ocupando el resto de la hoja.
- Botones: "Imprimir" y "Descargar PDF" (ambos `window.print()`; en el PDF indicá "Guardar como PDF").
- CSS de impresión: `@page { size: A4 portrait; margin: 10mm; }`; en `@media print` ocultar header, footer, menú, botones, anuncios y todo lo que no sea la hoja.
- Debajo (no imprime): consejos de uso en el aula, láminas relacionadas (misma categoría/efeméride, 4), links a la ficha de la efeméride y a la sopa de letras de esa fecha.
- Schema JSON-LD: `ImageObject` (contentUrl, name, description=alt, encodingFormat image/svg+xml, creditText "Aulita", isAccessibleForFree) dentro de `CreativeWork` con `educationalUse`, `audience` (docentes/familias) y BreadcrumbList.
- Mencionar el origen en `/creditos`: "Ilustraciones generadas con IA y editadas por Aulita".

## 6. Medición y anuncios
- GA4: evento `lamina_imprimir` con `{slug, categoria, con_nombre}` al tocar Imprimir/PDF; `lamina_ver` opcional.
- AdSense: un bloque arriba de las relacionadas y uno en el hub entre filas; nunca dentro de la hoja A4 ni en impresión (`print:hidden`). No marcar el sitio como dirigido a niños.

## 7. Criterios de aceptación
- Solo se ven las láminas `publicar`. Imprimir da una hoja A4 limpia, sin cortes ni UI.
- Lighthouse: imágenes con alt, lazy en grillas, sin CLS (definir aspect-ratio con el viewBox).
