# 01 · Grilla de provincias en /calendario-escolar-2027/

Referencia visual en esta carpeta: index.html / index-desk.png / index-mob.png (estado actual, sin fechas) y publicado.html / publicado-*.png (con fechas; las fechas ahí son DE EJEMPLO, no usarlas).

En /calendario-escolar-2027/ reemplazá la tabla "Fechas clave por provincia" por una grilla de tarjetas por región. No cambies title, meta description, H1, canonical ni el JSON-LD existente. La bajada puede pasar a: "Elegí tu provincia para ver inicio de clases, vacaciones de invierno y fin del ciclo. Cargamos cada fecha cuando sale la resolución oficial del ministerio."

## Estructura
- Barra "{n} de 24 provincias con calendario oficial · actualizado el {fecha}", desde el mismo archivo de datos actual, con progreso #f4a531 sobre #fff4e2. Al lado, el único botón: "Armá tu planificador docente" → /planificador-docente-2027/.
- Barra sticky (fondo #eef7fd) con input "Buscá tu provincia" y chips: Todas / Centro / NOA / NEA / Cuyo / Patagonia / Ya publicadas. Filtro con JS chico (atributo hidden), sin librerías. Sin JS se ven las 24.
- Un <section> con <h2> por región (Centro 6, NOA 6, NEA 4, Cuyo 3, Patagonia 5). Adentro <ul> con <li><a href="/calendario-escolar-2027/{slug}/">: la tarjeta entera es el link.
- Tarjeta: nombre (19px bold #1d3557) y "Ver calendario →" en #4aa3df.
  - Sin datos: una sola línea gris "Sin resolución 2027 todavía".
  - Con datos: <dl> Inicio / Invierno / Fin en formato corto ("1 mar", "6–17 jul", "11 dic"), borde izquierdo #f4a531 y "Calendario oficial publicado".
  - Nada de "A confirmar" repetido ni badges.
- Estilo: Inter, tarjeta blanca, borde 1px #e5e7eb, radio 12px, sin sombra; hover borde #4aa3df. Escritorio grid repeat(auto-fill, minmax(240px,1fr)). Hasta 600px: una columna, nombre a la izquierda y flecha a la derecha, alto mínimo 56px.

## SEO / GEO / AEO
- Las 24 provincias como <a href> reales en el HTML que genera Astro (nada de onclick ni carga solo por JS).
- Texto del link = nombre de la provincia, con aria-label="Calendario escolar 2027 de {Provincia}".
- JSON-LD ItemList aparte del existente: 24 ListItem con position, name ("Calendario escolar 2027 {Provincia}") y url absoluta.
- Fechas en <time datetime="2027-03-01">.
- Mantener migas y links internos (planificador, efemérides, provincias). Un solo H1; regiones en H2.

## Accesibilidad
- Chips como <button aria-pressed>; input con <label> (puede ser visualmente oculto).
- aria-live="polite" con "Mostrando X provincias".
- Foco visible: outline 2px #4aa3df. Contraste AA. Zonas táctiles de 44px o más.

## Performance
- Sin imágenes; JS del filtro inline y diferido. CLS 0: reservá el alto de la barra.

## QA
- Probar en 390 y 1280 px. Lighthouse mobile igual o mejor que hoy. Validar el ItemList en Rich Results Test.
