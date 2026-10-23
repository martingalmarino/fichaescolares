# Prompt para Cursor: completar e implementar el calendario de efemérides (Aulita)

Contexto: el repo ya tiene `src/data/efemerides.json` (14 fechas), lo valida `src/data/efemerides.ts` (interfaz `Efemeride`) y también `scripts/validate-data.ts`. `src/lib/calendario.ts` tiene `proximasEfemerides()`, con su test en `calendario.test.ts`. La home (`src/pages/index.astro`, sección `#efemerides`) usa la isla `src/islands/ProximasEfemerides.tsx` con `client:load`: arma la lista en el build y la recalcula en el cliente con `new Date()`. No existe la página `/efemerides`; el Header apunta a `/#efemerides`. Te adjunto `@efemerides-referencia.json` como lista de referencia (cada fila tiene `fuente`, `norma`, `verificado` y `nota`; educ.ar estaba en mantenimiento y no se usó como fuente).

Reglas: trabajá por fases. Al terminar cada una, mostrame el diff y un resumen y esperá mi OK. No cambies las claves de localStorage `fp:*`. No inventes fechas: cargá solo las que tienen `verificado: true` en la referencia y dejame las demás en un listado aparte.

## Fase 1: Modelo de datos
- Extendé `Efemeride` sin romper lo que ya existe (sopa, crucigrama y EnlacesFechas usan `slug`, `vocabulario` y `proceres`). Campos nuevos:
  - `id`
  - `tipo`: `"feriado" | "acto-escolar" | "conmemoracion" | "no-laborable"`
  - `nivel`: `("inicial" | "primaria")[]`
  - `feriado`: `{ es: boolean, regla: "inamovible" | "trasladable" | "movil" | null }`
  - `movil`: una regla opcional, por ejemplo `"pascua-47"`, `"pascua-2"` o `"domingo-3-oct"`
  - `recursos`: `{ fichas: string[], laminas: string[] }`
  - Dejá `vocabulario`, `tema` y `linea` como opcionales para las fechas sin ficha.
- Actualizá `isEfemeride` y `scripts/validate-data.ts`. Validá que no haya slugs duplicados, que el día exista en el mes y que haya al menos una fuente.

## Fase 2: Completar los datos
- Agregá a `efemerides.json` las fechas verificadas de la referencia que faltan, con un resumen corto escrito para adultos (docentes y familias).
- Las 14 que ya están conservan su slug.
- Para las fechas móviles (Carnaval, Viernes Santo, Día de las Infancias y Acoso Escolar; Madre y Padre solo si se verifican), poné `dia`/`mes` en null y completá `movil`.

## Fase 3: Lógica de fechas (reglas: Ley 27.399 art. 6 para trasladables; acoso escolar = primer jueves de noviembre; días turísticos por resolución anual, en 2026 23/3, 10/7 y 7/12)
- En `calendario.ts`, agregá `fechaDelAnio(e, anio)`: resuelve las móviles (Pascua con el algoritmo de Meeus) y los "N° domingo del mes".
- Agregá también `proximasEfemerides(lista, desde, n)` para que use esa función, y `efemeridesDelMes(lista, mes, anio)`.
- Los feriados trasladables se muestran en su fecha conmemorativa, con la nota "el feriado puede trasladarse". El día exacto del feriado no se calcula.
- Calculá todo con la hora de Argentina (`America/Argentina/Buenos_Aires`).
- Escribí tests para Pascua 2026/2027, para el cambio de año (fines de diciembre) y para el "hoy cuenta".

## Fase 4: Páginas
- `/efemerides/`: un índice con 12 secciones por mes. Arriba, la isla de próximas efemérides (reutilizá `ProximasEfemerides` con una prop `cantidad`).
- `/efemerides/[mes]/` (ej. `/efemerides/junio/`): la vista del mes.
- `/efemerides/[slug]/`: la página de cada efeméride. Lleva la fecha, el tipo y el chip de feriado, el resumen, recursos relacionados (links a sopa, crucigrama y láminas con `?e=slug`), las efemérides cercanas y las fuentes.
- Cambiá el link del Header a `/efemerides/` y sumalo a la navegación.
- Isla: el HTML del build trae una lista inicial y la isla la recalcula al cargar (ya funciona así en la home).

## Fase 5: SEO y schema
- Cada página de efeméride lleva JSON-LD `Event`: `name`, `startDate` de la próxima ocurrencia (calculada en el build), `eventAttendanceMode` online, `location` `VirtualLocation` con la URL de la página, `description` y `organizer` Aulita. Agregá además `BreadcrumbList`.
- Como el `startDate` se calcula en el build, se desactualiza: dejá el rebuild semanal de la fase 6.
- El índice y los meses llevan `ItemList`. Sumá todo al sitemap y a `llms.txt`.

## Fase 6: Rebuild programado (opcional)
- Creá `.github/workflows/rebuild.yml`: un cron semanal (lunes 06:00 ART, `0 9 * * 1` UTC) que hace POST al secret `VERCEL_DEPLOY_HOOK`. Explicame cómo creo el hook en Vercel.

## Fase 7: Control final
- Corré `npm run build` y `npm test`. Mostrame cuántas efemérides quedaron, cuáles quedaron pendientes por no estar verificadas y capturas de la home, `/efemerides/` y una ficha.
