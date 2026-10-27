# 08 · Performance mobile de las 4 páginas del planificador

Performance mobile de las 4 páginas del planificador (/planificador-docente-2027/, /agenda-docente-2027/, /planificacion-anual/, /registro-de-asistencia/). No cambies títulos, meta, H1, canonical, JSON-LD ni contenido.

Medido con Lighthouse mobile en producción: performance 49–74, LCP 4–5,6 s. En la misma sesión /sopa-de-letras/ da 92 (LCP 2,8 s) con el mismo CSS, fuentes y scripts. El elemento LCP es el párrafo de respuesta directa (main > article > div.no-print > p.mt-3) y el retraso es de render (3,2–4,1 s, contra 2,1 s en sopa). FCP 2,6–3,1 s contra 1,1 s.

1. Que el H1, la respuesta directa y el aviso amarillo se pinten con el HTML estático, sin esperar a la isla del generador: nada que los oculte o los mueva hasta la hidratación, ni scripts síncronos antes de ellos.
2. La vista previa (2 hojas) y el panel de opciones con client:visible o client:idle. El render completo de hojas y la lógica de impresión, con import() dinámico recién al tocar Imprimir o Descargar PDF. Que la isla no recalcule ni re-renderice todo al montar si el HTML ya trae lo mismo.
3. Reservá alto fijo (min-height o aspect-ratio A4) para el contenedor de la vista previa y para el aviso de consentimiento, así no hay saltos de layout. En /agenda-docente-2027/ hubo un CLS de 0,35 al cargar inter-latin-700: usá font-display: swap con fallback ajustado (size-adjust o la métrica de Inter) para que el cambio de fuente no mueva el body.
4. Compará con /sopa-de-letras/ (92) para igualar su forma de cargar: misma estrategia de island y de scripts.

Objetivo: Lighthouse mobile 90+ en las 4, y CLS < 0,1.
