Creá en Aulita (Astro, Vercel) el generador "Planificador docente 2027". Respetá el diseño actual del sitio (Inter, azul #1d3557, celeste #4aa3df, amarillo #f4a531, fondo #eef7fd, cards blancas con borde gris) y el layout de los generadores existentes (sopa de letras): opciones a la izquierda, botones Imprimir / Descargar PDF y vista previa A4 a la derecha. Mirá los mockups en docs/planificador-docente/ y leé docs/planificador-docente/README.md (reglas anti-canibalización obligatorias).

MOTOR (reutilizable por las páginas 02, 03 y 04)
- src/lib/planificador/: lee los datos que ya usan las páginas /calendario-escolar-2027/ (inicio, receso invernal, fin por jurisdicción, feriados nacionales) y las efemérides existentes del sitio. No dupliques datos: importá la misma fuente.
- Calcula días hábiles por mes y por período (lunes a viernes, menos feriados y receso) para la provincia elegida.
- Cada fecha tiene estado "oficial" o "provisoria" según el dato del calendario. Si es provisoria, la vista previa y el PDF muestran la etiqueta "(provisorio)" y el conteo dice "días hábiles estimados". Cuando el dato del calendario pase a oficial, el planificador se actualiza solo.
- Todo client-side (isla con client:visible), sin cuentas ni backend. Nombres de alumnos y datos del docente se guardan solo en localStorage, con botón "Borrar mis datos".
- Salida: impresión A4 con @page y PDF descargable. Los PDF no se indexan.

PÁGINA /planificador-docente-2027/
- Opciones: provincia (24), nivel (inicial, primario), grado o sala, turno, períodos (trimestres o cuatrimestres), y "Qué incluir": portada, 12 meses, semana a semana, planificación anual, registro de asistencia, cumpleaños, actos y reuniones.
- Hoja de mes: grilla del mes con feriados sombreados, efemérides, inicio/receso marcados, caja de días hábiles, cajas de actos/reuniones y cumpleaños, pie con aulita.com.ar y "Fechas oficiales: calendario escolar 2027 de [provincia]".
- Aviso amarillo arriba mientras haya fechas provisorias: "[Provincia] todavía no publicó su calendario 2027. Usamos fechas provisorias y las actualizamos cuando salga." con link a /calendario-escolar-2027/[provincia]/.
- Provincia y opciones van como parámetros en la URL (?prov=cordoba&nivel=primario). Canonical siempre a /planificador-docente-2027/.

SEO
- Title: Planificador docente 2027 para imprimir, con feriados y días hábiles | Aulita
- Meta: Armá tu planificador docente 2027 en A4: elegís provincia y grado y te arma los meses con feriados, efemérides y días hábiles ya contados. PDF gratis.
- H1: Planificador docente 2027 para imprimir
- Keywords: planificador docente 2027, planificador docente para imprimir, planificador docente pdf gratis, planificador anual 2027, planificador docente semanal
- Respuesta directa arriba (GEO/AEO, 2 oraciones): qué es y qué trae (meses con feriados, efemérides y días hábiles de tu provincia, planificación anual y asistencia), gratis en A4.
- Contenido de 400-600 palabras debajo: cómo se calculan los días hábiles, qué pasa con las fechas provisorias, ideas de uso para la primera semana. Sin FAQ de fechas de inicio de clases.
- FAQ: ¿Es gratis? ¿Cómo se cuentan los días hábiles? ¿Qué pasa si mi provincia cambia el calendario? ¿Puedo cargar mi lista de alumnos? ¿Sirve para nivel inicial?
- Schema: WebApplication (applicationCategory EducationalApplication, offers price 0, inLanguage es-AR) + HowTo (elegir provincia, elegir secciones, imprimir) + FAQPage + BreadcrumbList.
- Links internos: /calendario-escolar-2027/ y el de la provincia elegida (como fuente de fechas), /agenda-docente-2027/, /planificacion-anual/, /registro-de-asistencia/, calendario de efemérides, home.
- Agregar al menú de generadores y a la home. Sitemap solo con la URL limpia.
- En cada página /calendario-escolar-2027/[provincia]/ agregá UN solo CTA al final: "Armá tu planificador docente" -> /planificador-docente-2027/?prov=[provincia]. No cambies sus títulos, H1 ni FAQ.
- Lighthouse mobile 90+.
