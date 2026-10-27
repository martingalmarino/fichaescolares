Ajustes al planificador docente 2027 (no toques las páginas /calendario-escolar-2027/ ni sus títulos/H1/FAQ):

1. Titles exactos según docs/planificador-docente/0X (hoy están acortados):
   - /planificador-docente-2027/: "Planificador docente 2027 para imprimir, con feriados y días hábiles | Aulita"
   - /planificacion-anual/: "Planificación anual docente: plantilla para imprimir por trimestre | Aulita"
   - /registro-de-asistencia/: "Registro de asistencia de alumnos para imprimir (PDF A4) | Aulita"
   Si el layout recorta títulos largos, que estas páginas usen el title completo sin truncar. No cambies meta ni H1.

2. Lighthouse mobile 90+ (hoy 84 en planificador, 88 en asistencia; bloqueo del hilo principal 570 ms y 360 ms):
   - En el HTML inicial renderizá solo las primeras 2 hojas de la vista previa; el resto se genera en el cliente al imprimir o descargar (sobre todo en /agenda-docente-2027/, que hoy mete 56 hojas en el HTML).
   - Isla del generador con client:visible (o client:idle) y la librería de PDF importada dinámicamente solo al hacer clic en "Descargar PDF".
   - LCP (2,3 a 2,7 s): que el H1 y la respuesta directa no dependan de JS ni de fuentes bloqueantes (font-display: swap, precargar Inter).
   Verificá con Lighthouse mobile en las 4 páginas.

3. Períodos: hoy los trimestres se arman por meses enteros (61/53/76 días en Córdoba). Que los cortes de período salgan del dato del calendario de cada provincia cuando exista; mientras sea provisorio, repartí los días hábiles en partes parejas y marcalo "estimado".
