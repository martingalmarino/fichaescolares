# Cargar calendario escolar 2027 OFICIAL de Córdoba

Fuente oficial: Resolución Ministerial N.º 197/2026, Ministerio de Educación de Córdoba, Boletín Oficial (20/11/2026). Respaldo: https://uepc.org.ar/2026/11/20/calendario-escolar-2027-fechas-clave-para-organizar-el-proximo-ciclo-lectivo/ y https://www.cadena3.com/noticia/sociedad/cordoba-ya-tiene-calendario-escolar-para-2027-las-fechas-clave-del-proximo-ciclo-lectivo_615134 . No inventes fechas; seguí exactamente el formato de 03-caba-oficial.md.

1) src/data/calendario-escolar/2027.json → Córdoba:
estado "oficial"; inicio "2027-03-01" (Inicial, Primario, Secundario y modalidades); invierno desde "2027-07-12" hasta "2027-07-23" (regreso 26/7); fin "2027-12-17"; fuente "Resolución Ministerial 197/2026 – Boletín Oficial de Córdoba"; notas: "Docentes y directivos se reincorporan el 15/2; Formación Situada 16–18/2; exámenes previos y libres 22–24/2; ambientación 25–26/2; fin de la primera etapa 8/7; mínimo 190 días de clases."

2) SEO página /calendario-escolar-2027/cordoba/ (ruta existente de la provincia):
- title: Calendario escolar 2027 Córdoba: inicio de clases, vacaciones de invierno y fin de ciclo (≤60 car. ajustar)
- meta: Calendario escolar 2027 oficial de Córdoba: las clases empiezan el 1 de marzo, vacaciones de invierno del 12 al 23 de julio y el ciclo termina el 17 de diciembre. Resolución 197/2026.
- H1: Calendario escolar 2027 en Córdoba (oficial)
- Respuesta directa: Las clases 2027 en Córdoba comienzan el lunes 1 de marzo y terminan el viernes 17 de diciembre. Las vacaciones de invierno son del 12 al 23 de julio, según la Resolución 197/2026 del Ministerio de Educación.
- FAQ: ¿Cuándo empiezan las clases 2027 en Córdoba? (1/3) · ¿Cuándo son las vacaciones de invierno 2027 en Córdoba? (12–23/7, vuelta 26/7) · ¿Cuándo terminan las clases 2027 en Córdoba? (17/12) · ¿Cuándo vuelven los docentes? (15/2) · ¿Cuántos días de clase hay? (mín. 190).
- Schema: FAQPage + BreadcrumbList + Article/WebPage con dateModified 2026-11-20.
- Keywords: calendario escolar 2027 córdoba, inicio de clases 2027 córdoba, vacaciones de invierno 2027 córdoba, fin de clases 2027 córdoba, resolución 197/2026.
- Enlaces internos: /calendario-escolar-2027/, /vacaciones-de-invierno-2027/, /calendario-escolar-2027/caba/, resto de provincias.

3) Página nacional /calendario-escolar-2027/: sumar Córdoba a la tabla de provincias oficiales (junto a CABA), badge "Oficial" en la grilla, y actualizar la FAQ "¿Qué provincias ya publicaron el calendario escolar 2027?" (CABA y Córdoba), meta y respuesta directa.

4) Verificar que /vacaciones-de-invierno-2027/ muestre Córdoba como oficial (12–23/7) y que su meta y respuesta directa la mencionen (junto a CABA 19–30/7).

5) Chequeo: npm run build y tests sin errores; revisar sitemap, canonical y que no queden textos "a confirmar" para Córdoba.
