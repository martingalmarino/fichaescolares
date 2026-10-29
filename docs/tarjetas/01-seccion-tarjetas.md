# Prompt para Cursor: sección "Tarjetas educativas para imprimir" (PDF descargables)

## Contexto
Aulita.com.ar (Astro en Vercel). Hay que sumar una sección nueva de **tarjetas educativas en PDF listas para descargar**: 6 juegos, cada uno con su página. Los PDF y las miniaturas ya están hechos; **no hay que generar PDF en el navegador**: son archivos estáticos.

Usá los patrones que ya existen en el repo: el mismo `BaseLayout`, header, migas, footer y tokens de Tailwind (`azul`, `celeste`, `celeste-50`, `sol`, `borde`, `muted`, `rounded-card`, `shadow-card`). La sección de **/laminas/** (hub + `/laminas/[slug]/` armados desde datos) es el modelo más parecido: copiá su estructura.

Mockups de referencia, en esta misma carpeta: `mockups/hub.html` (+ `hub-desk.png`, `hub-mob.png`) y `mockups/set-abecedario.html` (+ `set-abecedario-desk.png`, `set-abecedario-mob.png`). Los mockups son guía de diseño, no código para copiar tal cual.

## 1. Archivos
- Copiá `docs/tarjetas/pdf/*.pdf` a `public/pdf/tarjetas/` (mismo nombre: `tarjetas-<slug>-aulita.pdf`).
- Copiá `docs/tarjetas/thumbs/*.webp` a `public/tarjetas/` (`<slug>-portada.webp`, `<slug>-pagina-1.webp`, `<slug>-pagina-2.webp`; vocales no tiene `pagina-2`). Son de 600 px de ancho, aprox. 600×849.

## 2. Datos (agregar un juego = agregar un objeto, nada más)
Crear `src/data/tarjetas.ts` con un array tipado `TARJETAS: SetTarjetas[]`:

```ts
type SetTarjetas = {
  slug: string;            // "abecedario"
  titulo: string;          // nombre corto para cards y migas: "Abecedario"
  h1: string;
  title: string;           // <title>
  description: string;     // meta description
  intro: string;           // párrafo answer-first bajo el H1
  pdf: string;             // "/pdf/tarjetas/tarjetas-abecedario-aulita.pdf"
  pesoKB: number;
  paginas: number;         // incluye la portada
  tarjetas: number;        // con contenido
  enBlanco: number;        // "Mi tarjeta"
  nivel: string;           // "Inicial y 1.º grado"
  area: "Lectoescritura" | "Matemática" | "Conocimiento del mundo";
  chips: string[];
  keywords: string[];
  contenido: { titulo: string; items: string[] };   // bloque "Qué trae"
  usos: { titulo: string; texto: string }[];        // "Cómo usarlas en el aula"
  faqs: { q: string; a: string }[];
  relacionados: string[];  // slugs de otros juegos
  enlacesAulita: { href: string; texto: string; detalle: string }[];
  imagenes: { src: string; alt: string }[];
  fechaPublicacion: string; // "2026-10-29"
};
```

Las rutas leen solo de este archivo (`getStaticPaths` desde `TARJETAS`). El hub, el sitemap y los relacionados se arman solos.

## 3. Rutas
- `src/pages/tarjetas-educativas/index.astro`: hub.
- `src/pages/tarjetas-educativas/[slug].astro`: página de cada juego.
- Barra final en todas las URL (como el resto del sitio). Canonical absoluto `https://www.aulita.com.ar/tarjetas-educativas/…/`.

> URL elegida: `/tarjetas-educativas/` y no `/tarjetas-para-imprimir/` ni `/flashcards/`. En Google Argentina, "tarjetas para imprimir" sugiere sobre todo tarjetas de saludo (día del maestro, día de la madre, día del amigo); "tarjetas educativas" sugiere "para imprimir pdf", "para niños" y "de números", que es justo esta intención. "Flashcards" se busca más para inglés, medicina y estudio. "para imprimir" va en H1 y title.

## 4. Hub `/tarjetas-educativas/`
- **title:** `Tarjetas educativas para imprimir en PDF gratis | Aulita`
- **meta description:** `Tarjetas educativas para imprimir gratis en PDF: abecedario, vocales, sílabas, números del 1 al 20, colores y formas, días y meses. A4, 8 por hoja, listas para recortar.`
- **H1:** `Tarjetas educativas para imprimir`
- **Intro (answer-first, primer párrafo, visible en HTML estático):** `Seis juegos de tarjetas en PDF, gratis y listos para imprimir en A4: abecedario, vocales, sílabas, números del 1 al 20, colores y formas, días y meses. Cada hoja trae 8 tarjetas con línea de corte y tarjetas en blanco para que cada chico arme la suya. También sirven como flashcards en español.`
- **Keywords objetivo:** tarjetas educativas para imprimir, tarjetas educativas para imprimir pdf, tarjetas educativas para niños pdf, flashcards en español para imprimir gratis, flashcards para imprimir pdf en español.
- **Grilla:** card por juego (toda la card es el link), miniatura `<slug>-pagina-1.webp` sobre fondo `celeste-50`, título, "N tarjetas · N págs. · nivel", chips, "Ver y descargar PDF →". 3 columnas desktop, 2 tablet, 1 móvil.
- **Filtros** (Todas, Nivel inicial, 1.º grado, 2.º grado, Lectoescritura, Matemática): opcionales. Si se hacen, que sean links/anclas o un island chiquito `client:idle`; las cards tienen que estar en el HTML estático igual.
- **"Cómo usarlas en el aula":** 3 cards: *Imprimí y recortá* ("Cada PDF viene en A4 con línea punteada. Sale bien en blanco y negro."), *Hacelas durar* ("Pegalas en cartulina o plastificalas si las van a usar todo el año."), *Jugá* ("Memotest, ordenar en fila, buscar la tarjeta que nombra la seño o armar el friso del aula.").
- **FAQ del hub** (visible + FAQPage):
  1. **¿Las tarjetas son gratis?** Sí. Todos los PDF se descargan gratis y sin registro. Podés imprimirlos para tu aula o tu casa todas las veces que quieras.
  2. **¿Qué diferencia hay entre tarjetas educativas y flashcards?** Ninguna en la práctica: "flashcards" es el nombre en inglés de las tarjetas con una letra, número o palabra que se muestran rápido para repasar. Acá están en español y pensadas para la escuela argentina.
  3. **¿Se pueden imprimir en blanco y negro?** Sí. Los colores son suaves y las letras quedan en azul oscuro, así que se leen bien en una impresora común.
  4. **¿En qué tamaño se imprimen?** En hoja A4 vertical, 8 tarjetas por hoja (unos 9 × 6,5 cm cada una). Si usás hoja carta, elegí "Ajustar al tamaño de la página" en la impresora.
  5. **¿Qué son las tarjetas "Mi tarjeta"?** Son tarjetas en blanco con un recuadro para dibujar y dos renglones para escribir. Completan la última hoja de cada PDF para que cada chico arme su propia tarjeta.
- **Schema:** `CollectionPage` (name, description, url, inLanguage `es-AR`, isPartOf WebSite Aulita) con `mainEntity` = `ItemList` de los 6 juegos (`ListItem` con position, url, name); `BreadcrumbList` (Inicio › Tarjetas educativas); `FAQPage`.
- **Enlaces internos (bloque "Otros recursos de Aulita"):** `/sopa-de-letras/`, `/caligrafia/`, `/tablas-y-operaciones/`, `/laminas/`, `/etiquetas-escolares/`.

## 5. Página de cada juego `/tarjetas-educativas/[slug]/`
Estructura (ver `mockups/set-abecedario-desk.png`):
1. Migas: Inicio › Tarjetas educativas › {titulo}.
2. Columna izquierda: H1, intro answer-first, 4 datos en cards (Tarjetas, Páginas, Nivel, Formato "PDF · N KB"), **botón grande "Descargar PDF gratis"** (`bg-sol text-azul font-bold`, alto mínimo 48 px, ancho completo en móvil, `<a href={pdf} download>`), y debajo "Sin registro. Se imprime bien en blanco y negro."
3. Columna derecha: vista previa en fondo `celeste-50` con 3 imágenes (portada, página 1, página 2); en móvil, 2. El botón tiene que verse sin scrollear en móvil: en móvil la vista previa va **debajo** del botón.
4. "Qué trae" (lista de contenido en chips).
5. "Cómo usarlas en el aula" (lista numerada con los usos).
6. FAQ (details/summary, la primera abierta).
7. "Seguí practicando": 2 juegos relacionados + 2 herramientas reales de Aulita.

**Schema por juego:** `LearningResource` (name, description, url, inLanguage `es-AR`, `learningResourceType` "Flashcard", `educationalLevel` = nivel, `isAccessibleForFree` true, `encoding`/`associatedMedia` MediaObject con `contentUrl` del PDF y `encodingFormat` `application/pdf`, `image` = portada absoluta, `publisher` Aulita, `datePublished`), `FAQPage` y `BreadcrumbList` (Inicio › Tarjetas educativas › {titulo}).

**Open Graph:** `og:image` = `<slug>-portada.webp` absoluta; `og:type` website.

## 6. Contenido de cada juego (copiar tal cual al archivo de datos)

### abecedario
- **pdf:** `/pdf/tarjetas/tarjetas-abecedario-aulita.pdf` · 5 págs. · 27 tarjetas + 5 en blanco · Nivel inicial y 1.º grado · Lectoescritura
- **title:** `Tarjetas del abecedario para imprimir en PDF gratis | Aulita`
- **description:** `Tarjetas del abecedario para imprimir gratis: las 27 letras con Ñ, en mayúscula y minúscula, con una palabra de ejemplo. PDF A4, 8 por hoja, listo para recortar.`
- **H1:** `Tarjetas del abecedario para imprimir`
- **intro:** `PDF gratis con las 27 letras del abecedario en español, incluida la Ñ. Cada tarjeta tiene la letra en mayúscula y minúscula y una palabra de ejemplo. Son 8 tarjetas por hoja A4, con línea de corte y 5 tarjetas en blanco para completar.`
- **keywords:** tarjetas del abecedario para imprimir pdf gratis, tarjetas del abecedario mayúsculas y minúsculas para imprimir, abecedario para imprimir y recortar pdf, abecedario para imprimir letra por letra, flashcards abecedario español pdf
- **Qué trae:** A avión, B barco, C casa, D dedo, E elefante, F flor, G gato, H helado, I isla, J jirafa, K kiwi, L luna, M mano, N nube, Ñ ñandú, O oso, P pelota, Q queso, R ratón, S sol, T tren, U uva, V vaca, W wafle, X xilofón, Y yacaré, Z zapato.
- **Usos:** Friso del abecedario (pegalas en fila arriba del pizarrón para que estén siempre a la vista). · ¿Con qué letra empieza? (mostrá una tarjeta, tapá la palabra y que digan otras palabras con esa letra). · Ordenar el abecedario (repartí las tarjetas mezcladas y armen la fila de la A a la Z en el piso). · Mi tarjeta (cada chico completa una en blanco con la letra de su nombre y un dibujo).
- **FAQ:**
  1. **¿Cuántas letras tiene el abecedario en español?** 27 letras: las 26 del alfabeto latino más la Ñ. La CH y la LL son dígrafos, no letras, según la Real Academia Española desde 2010.
  2. **¿Se pueden imprimir en blanco y negro?** Sí. Las letras están en azul oscuro y los colores son suaves, así que se leen bien en una impresora común.
  3. **¿Sirven como flashcards del abecedario en español?** Sí, son lo mismo: tarjetas para mostrar y repasar. Están en español rioplatense, con palabras como ñandú y yacaré.
  4. **¿Conviene empezar con mayúscula o minúscula?** En primer grado se suele empezar con imprenta mayúscula. Por eso cada tarjeta trae las dos: la mayúscula grande y la minúscula al lado.
- **relacionados:** vocales, silabas · **enlacesAulita:** `/caligrafia/` (Hojas de caligrafía, Generador), `/sopa-de-letras/` (Sopa de letras, Generador)

### vocales
- **pdf:** `/pdf/tarjetas/tarjetas-vocales-aulita.pdf` · 2 págs. · 5 tarjetas + 3 en blanco · Nivel inicial · Lectoescritura
- **title:** `Tarjetas de las vocales para imprimir en PDF gratis | Aulita`
- **description:** `Tarjetas de las vocales para imprimir gratis: A, E, I, O, U en mayúscula y minúscula, con tres palabras de ejemplo cada una. PDF A4 listo para recortar.`
- **H1:** `Tarjetas de las vocales para imprimir`
- **intro:** `PDF gratis con las 5 vocales en tarjetas grandes: cada una trae la vocal en mayúscula y minúscula y tres palabras que empiezan con ella. Son 8 tarjetas por hoja A4, con 3 tarjetas en blanco para completar.`
- **keywords:** tarjetas de vocales para imprimir, tarjetas de vocales para imprimir pdf, tarjetas de vocales mayúsculas y minúsculas, vocales para imprimir y recortar pdf, vocales para imprimir pdf gratis
- **Qué trae:** A (avión, abeja, árbol), E (elefante, escoba, estrella), I (isla, iglú, imán), O (oso, ojo, ola), U (uva, uno, uña).
- **Usos:** ¿Qué vocal suena? (decí una palabra y que levanten la tarjeta de la vocal con la que empieza). · Vocal del día (una tarjeta en el pizarrón y cada uno busca palabras que la tengan). · Rincón de las vocales (pegalas a la altura de los chicos para tocarlas y nombrarlas). · Mi tarjeta (que dibujen algo que empiece con su vocal favorita).
- **FAQ:**
  1. **¿Cuáles son las vocales en español?** Son cinco: A, E, I, O, U. La Y suena como vocal en palabras como "y" o "rey", pero es una consonante.
  2. **¿A qué edad se enseñan las vocales?** En general en sala de 4 y sala de 5, y se repasan al empezar primer grado. Las tarjetas sirven para las tres etapas.
  3. **¿Las palabras de ejemplo tienen dibujo?** No. Son tarjetas tipográficas, sin ilustraciones, para que se impriman bien y los chicos puedan dibujar en las tarjetas en blanco.
  4. **¿Se pueden imprimir en blanco y negro?** Sí. La vocal está en azul oscuro y se lee bien con cualquier impresora.
- **relacionados:** abecedario, silabas · **enlacesAulita:** `/caligrafia/`, `/sopa-de-letras/`

### silabas
- **pdf:** `/pdf/tarjetas/tarjetas-silabas-aulita.pdf` · 3 págs. · 16 tarjetas · 1.º grado · Lectoescritura
- **title:** `Tarjetas de sílabas para imprimir en PDF: ma me mi mo mu | Aulita`
- **description:** `Tarjetas de sílabas directas para imprimir gratis: ma me mi mo mu, pa pe pi po pu, sa se si so su y 13 familias más, en imprenta mayúscula y minúscula. PDF A4.`
- **H1:** `Tarjetas de sílabas para imprimir`
- **intro:** `PDF gratis con 16 familias de sílabas directas (consonante + vocal), de ma me mi mo mu a ya ye yi yo yu. Cada tarjeta trae la familia en imprenta mayúscula, en minúscula y una palabra de ejemplo. Son 8 por hoja A4, listas para recortar.`
- **keywords:** tarjetas de sílabas para imprimir, tarjetas de sílabas ma me mi mo mu para imprimir, tarjetas de silabas pa pe pi po pu para imprimir, sílabas para imprimir en imprenta mayúscula, silabas para imprimir pdf gratis, silabas para imprimir primer grado
- **Qué trae:** M (mesa), P (pato), S (sopa), L (luna), T (torta), N (nido), D (dedo), F (foca), B (bote), R (rosa), V (vela), J (jugo), Ñ (ñandú), LL (lluvia), CH (chupetín), Y (yema).
- **Usos:** Leer la familia (de corrido y salteado: mo, ma, mu…). · Armar palabras (juntá dos tarjetas y buscá sílabas que formen una palabra: ma + no = mano). · Familia del día (una tarjeta por día en el pizarrón).. · Memotest de sílabas (dos copias del PDF, tarjetas boca abajo, se arman pares leyendo en voz alta).
- **FAQ:**
  1. **¿Qué son las sílabas directas?** Son las que empiezan con consonante y terminan con vocal, como ma, pe o lu. Son las primeras que se enseñan para aprender a leer.
  2. **¿Por qué en imprenta mayúscula?** Porque en primer grado en Argentina se suele empezar a leer y escribir en imprenta mayúscula. Cada tarjeta trae también la minúscula para el paso siguiente.
  3. **¿Por qué no están ca, ga, ce o ci?** Porque la C y la G cambian de sonido según la vocal (ca/ce, ga/ge) y conviene enseñarlas aparte. Este juego tiene solo familias que suenan parejo.
  4. **¿Hay tarjetas de sílabas trabadas?** Todavía no. Este juego es de sílabas directas. Las trabadas (bla, pra, tre…) van a venir en otro juego.
- **relacionados:** abecedario, vocales · **enlacesAulita:** `/caligrafia/`, `/sopa-de-letras/`

### numeros-1-al-20
- **pdf:** `/pdf/tarjetas/tarjetas-numeros-1-al-20-aulita.pdf` · 4 págs. · 20 tarjetas + 4 en blanco · Nivel inicial y 1.º grado · Matemática
- **title:** `Tarjetas de números del 1 al 20 para imprimir en PDF | Aulita`
- **description:** `Tarjetas de números del 1 al 20 para imprimir gratis: el número, su nombre escrito y puntos para contar en cuadros de diez. PDF A4, 8 por hoja, listo para recortar.`
- **H1:** `Tarjetas de números del 1 al 20 para imprimir`
- **intro:** `PDF gratis con los números del 1 al 20. Cada tarjeta trae el número grande, su nombre escrito (uno, dos, tres…) y la cantidad en puntos sobre un cuadro de diez, para contar y comparar. Son 8 por hoja A4, con 4 tarjetas en blanco.`
- **keywords:** tarjetas de números del 1 al 20 para imprimir pdf, tarjetas de numeros para imprimir, números del 1 al 20 para imprimir y recortar, numeros del 1 al 20 para imprimir pdf, tarjetas educativas de números, flashcards números del 1 al 20
- **Qué trae:** 1 uno … 10 diez, 11 once, 12 doce, 13 trece, 14 catorce, 15 quince, 16 dieciséis, 17 diecisiete, 18 dieciocho, 19 diecinueve, 20 veinte.
- **Usos:** Contar puntos (tapá el número y que cuenten los puntos del cuadro). · Ordenar la recta (repartí las tarjetas y armen la fila del 1 al 20). · Antes y después (mostrá una tarjeta y que digan el número anterior y el siguiente). · Mi tarjeta (que escriban un número y dibujen esa cantidad).
- **FAQ:**
  1. **¿Qué es el cuadro de diez?** Es una grilla de 2 filas por 5 que ayuda a ver las cantidades de un vistazo: 7 es "un cinco y dos más". Del 11 al 20 hay dos cuadros: uno lleno y otro con lo que falta.
  2. **¿Cómo se escribe 16 en letras?** Dieciséis, con tilde. Del 16 al 19 se escriben en una sola palabra: dieciséis, diecisiete, dieciocho, diecinueve.
  3. **¿Hay tarjetas del 0 o del 1 al 100?** Este juego va del 1 al 20. Para practicar cuentas podés usar el generador de tablas y operaciones de Aulita.
  4. **¿Se pueden imprimir en blanco y negro?** Sí. Los puntos llenos son círculos rellenos y los vacíos solo tienen borde, así que se distinguen bien aunque se impriman en gris.
- **relacionados:** colores-y-formas, dias-y-meses · **enlacesAulita:** `/tablas-y-operaciones/` (Tablas y operaciones, Generador), `/sopa-de-letras/`

### colores-y-formas
- **pdf:** `/pdf/tarjetas/tarjetas-colores-y-formas-aulita.pdf` · 4 págs. · 20 tarjetas + 4 en blanco · Nivel inicial · Conocimiento del mundo
- **title:** `Tarjetas de colores y formas para imprimir en PDF | Aulita`
- **description:** `Tarjetas de colores y figuras geométricas para imprimir gratis: 12 colores y 8 formas con su nombre en español. PDF A4, 8 por hoja, para nombrar y clasificar.`
- **H1:** `Tarjetas de colores y formas para imprimir`
- **intro:** `PDF gratis con 12 colores y 8 figuras geométricas, cada una con su nombre en español. Sirven para nombrar, clasificar y jugar en sala y en primer grado. Son 8 tarjetas por hoja A4, con 4 tarjetas en blanco.`
- **keywords:** tarjetas de colores para imprimir, tarjetas de colores para imprimir pdf, tarjetas de formas para imprimir, tarjetas de figuras geométricas, tarjetas de formas y colores, tarjetas de colores para niños
- **Qué trae:** Colores: rojo, azul, amarillo, verde, naranja, violeta, rosa, celeste, marrón, negro, blanco, gris. Formas: círculo, cuadrado, triángulo, rectángulo, óvalo, rombo, estrella, hexágono.
- **Usos:** Buscar en el aula (mostrá un color y que traigan algo de ese color). · Clasificar (separar tarjetas de colores y de formas, o formas con lados y sin lados). · Contar lados (con las formas: ¿cuántos lados tiene el triángulo?). · Mi tarjeta (que dibujen una forma y la pinten del color que quieran).
- **FAQ:**
  1. **¿Conviene imprimir este juego a color?** Sí. Es el único juego donde el color es el contenido, así que conviene imprimir a color. Las formas se entienden igual en blanco y negro.
  2. **¿Por qué dice celeste y no azul claro?** Porque en Argentina decimos celeste, como el de la bandera. También usamos marrón y violeta.
  3. **¿Qué figuras geométricas trae?** Círculo, cuadrado, triángulo, rectángulo, óvalo, rombo, estrella y hexágono: las que se trabajan en el nivel inicial.
  4. **¿El blanco se ve en la tarjeta?** Sí, la muestra blanca tiene un borde gris para que se distinga del papel.
- **relacionados:** numeros-1-al-20, dias-y-meses · **enlacesAulita:** `/laminas/` (Láminas para colorear, Imprimibles), `/sopa-de-letras/`

### dias-y-meses
- **pdf:** `/pdf/tarjetas/tarjetas-dias-y-meses-aulita.pdf` · 4 págs. · 19 tarjetas + 5 en blanco · Nivel inicial a 2.º grado · Conocimiento del mundo
- **title:** `Tarjetas de los días de la semana y meses del año para imprimir | Aulita`
- **description:** `Tarjetas de los días de la semana y los meses del año para imprimir gratis, numeradas en orden y con abreviatura. PDF A4 para armar el calendario del aula.`
- **H1:** `Tarjetas de los días de la semana y los meses del año`
- **intro:** `PDF gratis con los 7 días de la semana y los 12 meses del año en tarjetas grandes. Cada una dice qué número de día o de mes es y trae la abreviatura (LUN, ENE…), para armar la rutina y el calendario del aula. Son 8 por hoja A4, con 5 tarjetas en blanco.`
- **keywords:** tarjetas de los días de la semana para imprimir, tarjetas de los meses del año para imprimir, días de la semana para imprimir pdf, días de la semana para imprimir preescolar, meses del año para imprimir, tarjetas de los dias de la semana para niños
- **Qué trae:** lunes, martes, miércoles, jueves, viernes, sábado, domingo; enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre.
- **Usos:** Ronda de la mañana (¿qué día es hoy? ¿qué día fue ayer?). · Calendario del aula (la tarjeta del mes arriba y la del día que se cambia cada mañana). · Ordenar (mezclá los meses y que los pongan en orden). · Mi tarjeta (que escriban su mes de cumpleaños y lo decoren).
- **FAQ:**
  1. **¿La semana empieza el lunes o el domingo?** En la escuela argentina se trabaja de lunes a viernes, por eso el lunes es el día 1. Si en tu aula preferís empezar por el domingo, las tarjetas se pueden ordenar como quieras.
  2. **¿Se escribe septiembre o setiembre?** Las dos formas son correctas según la RAE. Usamos septiembre, que es la más común en Argentina.
  3. **¿Los días y meses van con mayúscula?** No. En español los días de la semana y los meses se escriben con minúscula, salvo al principio de una oración.
  4. **¿Sirven para trabajar las efemérides?** Sí. Combinalas con el calendario de efemérides de Aulita para ver qué se recuerda en cada mes.
- **relacionados:** numeros-1-al-20, colores-y-formas · **enlacesAulita:** `/efemerides/` (Efemérides escolares), `/calendario-escolar-2027/` (Calendario escolar 2027)

## 7. Analítica de descargas
El sitio usa Google Tag Manager. En el click del botón de descarga empujá al dataLayer:
```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: "descarga_pdf", recurso: "tarjetas", set: "<slug>", archivo: "<pdf>" });
```
Con un `<script>` inline mínimo que escuche clicks en `[data-descarga]` (sin framework). No bloquear la navegación.

## 8. Performance
- Cero JS de framework en estas páginas (salvo filtros opcionales del hub con `client:idle`).
- Imágenes: `<img>` con `width`/`height` explícitos (600×849), `loading="lazy"` y `decoding="async"` salvo la primera vista previa del set (que va `fetchpriority="high"` solo en desktop; en móvil el LCP tiene que ser el H1/intro, que van en HTML estático).
- El intro y el botón no pueden depender de JS ni de fuentes cargadas (mismo criterio que el fix de performance del planificador): reservar alturas, `font-display: swap` como el resto del sitio.
- Objetivo Lighthouse móvil ≥ 90 en hub y en un set.

## 9. Navegación e internos
- Header: sumar **"Tarjetas educativas"** al menú **Imprimibles** (desktop y móvil) con href `/tarjetas-educativas/`, arriba de "Láminas para colorear".
- Home: sumar una card "Tarjetas educativas para imprimir" en el bloque de imprimibles que ya existe, con la miniatura `abecedario-pagina-1.webp`.
- Enlazar desde `/caligrafia/` y `/sopa-de-letras/` (un link de texto "Tarjetas del abecedario para imprimir" en su sección de recursos relacionados, si existe) y desde `/efemerides/` a `/tarjetas-educativas/dias-y-meses/` solo si hay un bloque de relacionados; no inventar secciones nuevas en esas páginas.
- Sitemap: que las 7 URL nuevas salgan en `sitemap-0.xml`.

## 10. Criterios de aceptación
- 7 páginas nuevas, 200, canonical correcto, un solo H1 cada una.
- Los 6 PDF bajan desde `/pdf/tarjetas/…` con `Content-Type: application/pdf`.
- Schema válido en el Rich Results Test (CollectionPage + ItemList + FAQPage + BreadcrumbList en el hub; LearningResource + FAQPage + BreadcrumbList en cada set).
- Sin scroll horizontal a 390 px; botón de descarga visible sin scrollear en móvil.
- Agregar un juego nuevo = copiar PDF + miniaturas + un objeto en `src/data/tarjetas.ts`.
