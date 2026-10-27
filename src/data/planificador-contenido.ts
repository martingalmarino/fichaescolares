import { planDe } from '../lib/planificador';

const planAgenda = planDe('cordoba', 'trimestres');

/** Portada + 12 meses + una hoja por semana de clase + registro. */
export const hojasAgendaDefecto = 1 + planAgenda.mesesCiclo.length + planAgenda.semanas.length + 1;

export const seoPlanificador = {
	ruta: '/planificador-docente-2027/',
	title: 'Planificador docente 2027 para imprimir, con feriados y días hábiles | Aulita',
	description:
		'Armá tu planificador docente 2027 en A4: elegís provincia y grado y te arma los meses con feriados, efemérides y días hábiles ya contados. PDF gratis.',
	h1: 'Planificador docente 2027 para imprimir',
	keywords:
		'planificador docente 2027, planificador docente para imprimir, planificador docente pdf gratis, planificador anual 2027, planificador docente semanal',
};

export const respuestaPlanificador =
	'El planificador docente 2027 arma en A4 los meses con feriados, efemérides y días hábiles de tu provincia, más la planificación anual y el registro de asistencia. Es gratis: elegís nivel y grado, lo imprimís o lo guardás como PDF.';

export const parrafosPlanificador = [
	'El planificador docente 2027 junta en hojas A4 lo que suele quedar en varios archivos: doce meses con feriados y efemérides, los días hábiles de la provincia que elijas, una grilla de planificación anual y un registro de asistencia. Elegís provincia, nivel y grado o sala, y la vista previa se arma en el navegador. No hace falta una cuenta. Imprimir y Descargar PDF abren el cuadro de impresión del navegador: para guardar el archivo, el destino es “Guardar como PDF”. El archivo no queda publicado en Aulita.',
	'Un día hábil es un lunes, martes, miércoles, jueves o viernes que cae entre el inicio y el fin del ciclo y que no es feriado ni receso. El sábado y el domingo no se cuentan. Los feriados nacionales salen de la Ley 27.399, con el traslado al lunes cuando la ley lo pide. El Jueves Santo se resta porque es día no laborable, aunque no sea feriado. Si la provincia tiene feriados propios o días sin clases cargados, también se restan. Los puentes turísticos no entran en la cuenta hasta que exista un decreto de ese año: si no está publicado, no se inventa esa fecha.',
	'Mientras la provincia no publicó la resolución, el inicio, el receso de invierno y el cierre se muestran como provisorios. En la hoja aparece la etiqueta “(provisorio)” y el recuadro habla de días hábiles estimados. Esos números sirven para organizar carpetas, actos y secuencias, y no reemplazan la resolución. El aviso de arriba enlaza a la página de la provincia, que es la fuente. Cuando esa fuente pasa a fecha oficial, este planificador lee el mismo dato y deja de estimar, sin que tengas que rearmar la grilla. Los nombres de los alumnos, el docente y la escuela no viajan con ese dato: quedan solo en este navegador.',
	'Para la primera semana alcanza con imprimir la portada, el mes de inicio y la planificación anual. Completá docente, escuela y grado en el panel antes de imprimir, o dejalos en blanco y completalos a mano. En el mes, el recuadro de actos y reuniones sirve para anotar la reunión de familias y el acto que toque. Los cumpleaños que cargues, con el día y el mes, salen en la hoja de ese mes. Si no cargás ninguno, el recuadro queda con renglones. La lista de alumnos va al registro. Si preferís no dejarla guardada, “Borrar mis datos” la elimina de este navegador y Aulita no conserva una copia.',
	'La planificación anual trae las áreas del nivel y una columna por período, con los días hábiles ya sumados. En primaria podés organizar el año en trimestres o en dos cuatrimestres. En inicial, la grilla usa los ejes de la sala. Si no necesitás el año entero, destildá las hojas que sobran: la cantidad del botón de PDF cambia con lo que dejás marcado. La vista semana a semana suma una página por semana de clase, útil cuando querés anotar la secuencia al lado de la fecha. El menú, las opciones y este texto no salen en el papel.',
	'Las fechas de la provincia que elijas están en el <a href="/calendario-escolar-2027/">calendario escolar 2027</a>, y las conmemoraciones en el <a href="/efemerides/">calendario de efemérides</a>. Para una sola pieza están la <a href="/agenda-docente-2027/">agenda docente 2027</a>, la <a href="/planificacion-anual/">planificación anual</a> y el <a href="/registro-de-asistencia/">registro de asistencia</a>. El resto de las fichas está en el <a href="/">inicio</a>.',
];

export const preguntasPlanificador = [
	{
		q: '¿Es gratis?',
		a: 'Sí. El planificador se usa sin cuenta y sin pago. Imprimís las hojas en A4 o las guardás como PDF desde el cuadro de impresión del navegador.',
	},
	{
		q: '¿Cómo se cuentan los días hábiles?',
		a: 'Se cuentan los lunes a viernes entre el inicio y el fin del ciclo, y se restan feriados nacionales, feriados provinciales cargados, días sin clases y el receso de invierno. El sábado y el domingo no entran. Si las fechas de la provincia todavía son provisorias, el recuadro lo dice como días hábiles estimados.',
	},
	{
		q: '¿Qué pasa si mi provincia cambia el calendario?',
		a: 'La hoja vuelve a calcularse con el dato nuevo y, si la fecha pasa a oficial, desaparece la etiqueta provisorio. No tenés que rearmar nada. Los nombres que cargaste siguen guardados en este navegador.',
	},
	{
		q: '¿Puedo cargar mi lista de alumnos?',
		a: 'Sí. Los nombres, los cumpleaños, el docente y la escuela se guardan solo en este navegador. No se envían a un servidor. Con “Borrar mis datos” se eliminan de esta computadora.',
	},
	{
		q: '¿Sirve para nivel inicial?',
		a: 'Sí. Podés elegir inicial o primario, la sala o el grado, y el turno. En inicial, la planificación anual usa los ejes de la sala en lugar de las áreas de primaria.',
	},
];

export const pasosPlanificador = [
	{ name: 'Elegí la provincia', text: 'Elegí la provincia, el nivel, el grado o la sala y el turno.' },
	{ name: 'Elegí las secciones', text: 'Marcá portada, meses, planificación, asistencia y lo que quieras imprimir.' },
	{ name: 'Imprimí o guardá el PDF', text: 'Revisá la vista previa y tocá Imprimir o Descargar PDF. Para el archivo, elegí Guardar como PDF.' },
] as const;

export const seoAgenda = {
	ruta: '/agenda-docente-2027/',
	title: 'Agenda docente 2027 para imprimir en PDF gratis | Aulita',
	description:
		'Descargá tu agenda docente 2027 en A4, gratis: portada con tu nombre, meses con feriados y efemérides de tu provincia, semana a semana, cumpleaños y asistencia.',
	h1: 'Agenda docente 2027 para imprimir',
	keywords:
		'agenda docente 2027, agenda docente 2027 pdf, agenda docente 2027 para imprimir pdf gratis, agenda docente pdf gratis argentina, descargar agenda docente 2027',
};

export const respuestaAgenda =
	'La agenda docente 2027 arma en A4 la portada con tu nombre, los doce meses con feriados y efemérides, la semana a semana, los cumpleaños y el registro de asistencia. Es gratis: la imprimís o la guardás como PDF desde el cuadro de impresión del navegador.';

export const parrafosAgenda = [
	'La agenda docente 2027 es el cuaderno del año, listo para imprimir en A4. La portada deja el nombre del docente, la escuela, el grado o la sala y el año. Siguen los doce meses, con feriados, efemérides, el recuadro de días hábiles y espacio para actos, reuniones y cumpleaños. Cada semana de clase tiene su hoja, con los cinco días y renglones para la secuencia. Cierra el registro de asistencia, con una fila por alumno y una columna por mes. Elegís provincia, nivel, grado y turno. La vista previa se arma en el navegador, sin cuenta.',
	'Imprimir y Descargar PDF abren el cuadro de impresión. Para guardar el archivo, elegí “Guardar como PDF” como destino. Ese archivo no se publica en Aulita. Para anillarla, imprimí a doble faz y dejá libre el margen izquierdo: un anillado de oficina alcanza para el año. La hoja está pensada en A4. Si la querés como libro más chico, en el mismo cuadro elegí papel A5 o ajustar a la página y revisá una hoja de prueba, porque la letra se achica. En doble faz, el giro por el lado largo deja el cuaderno parejo.',
	'La agenda y el planificador docente 2027 usan el mismo motor y las mismas fechas, y no son la misma pieza. El planificador trae la planificación anual por área y deja la semana a semana sin marcar. La agenda hace al revés: la semana a semana viene marcada, porque es el cuaderno de todos los días, y la planificación anual queda destildada hasta que la sumes. Si la marcás, entra en el PDF y el botón cambia la cantidad de hojas. Docente, escuela, alumnos y cumpleaños quedan solo en este navegador. “Borrar mis datos” los elimina de esta computadora.',
	'Un día hábil es un lunes a viernes entre el inicio y el fin del ciclo, y no es feriado ni receso. Los feriados nacionales salen de la Ley 27.399, con el traslado cuando la ley lo pide. El Jueves Santo se resta porque es día no laborable. También se restan los feriados de la provincia y los días sin clases que estén cargados. Los puentes turísticos no entran hasta que exista un decreto de ese año. Si la provincia no publicó la resolución, el inicio, el receso de invierno y el cierre figuran como provisorios y la cuenta dice días hábiles estimados. Cuando el dato pasa a oficial, la agenda lo toma sola y deja de estimar.',
	`Con las secciones que vienen marcadas, esta agenda tiene ${hojasAgendaDefecto} hojas: la portada, los doce meses, una hoja por semana de clase y el registro de asistencia. El botón de PDF muestra el número de lo que dejes tildado. Las fechas de la provincia que elijas están en el <a href="/calendario-escolar-2027/">calendario escolar 2027</a>. Para organizar el año por áreas está el <a href="/planificador-docente-2027/">planificador docente 2027</a>, y por separado la <a href="/planificacion-anual/">planificación anual</a> y el <a href="/registro-de-asistencia/">registro de asistencia</a>. El resto de las fichas está en el <a href="/">inicio</a>.`,
];

export const preguntasAgenda = [
	{
		q: '¿Se puede imprimir en A5?',
		a: 'Sí. La vista está armada en A4. En el cuadro de impresión elegí tamaño A5 o ajustar a la página, a doble faz, y anillala por el lado izquierdo. Conviene mirar una hoja de prueba: al achicarla, la letra queda más chica.',
	},
	{
		q: '¿Trae los feriados de mi provincia?',
		a: 'Sí. Elegís la provincia y cada mes marca los feriados nacionales de la Ley 27.399, los feriados provinciales que estén cargados y las efemérides. Si la provincia todavía no publicó el ciclo, el inicio y el receso figuran como provisorios.',
	},
	{
		q: '¿Es editable?',
		a: 'Podés completar docente, escuela, alumnos y cumpleaños en el panel, y eso sale impreso. Los renglones de actos, reuniones y asistencia se completan a mano. No es un archivo de texto: es una hoja para imprimir. Los datos quedan solo en este navegador.',
	},
	{
		q: '¿Cuántas hojas tiene?',
		a: `Con lo que viene marcado son ${hojasAgendaDefecto} hojas: la portada, los doce meses, una hoja por semana de clase y el registro de asistencia. El botón de PDF muestra el número de lo que dejás tildado. Si sacás la semana a semana, el cuaderno queda en la portada, los meses y la asistencia.`,
	},
];

export const seoPlanificacion = {
	ruta: '/planificacion-anual/',
	title: 'Planificación anual docente: plantilla para imprimir por trimestre | Aulita',
	description:
		'Plantilla de planificación anual en A4 para primaria y nivel inicial: áreas por trimestre o cuatrimestre con los días hábiles de tu provincia ya calculados.',
	h1: 'Planificación anual para imprimir',
	keywords:
		'planificación anual, planificación anual para imprimir, planificación anual primer grado, planificación anual nivel inicial, planificación anual sala de 3 años, planificación anual educación física, planificación anual docente ejemplo',
};

export const respuestaPlanificacion =
	'La planificación anual para imprimir arma una grilla de áreas por trimestre o cuatrimestre, con los días hábiles de tu provincia ya contados. Completás contenidos, propósitos, actividades y evaluación, y la imprimís en A4.';

export const parrafosPlanificacion = [
	'Una planificación anual ordena el año antes de abrir las secuencias de la semana. En esta plantilla cada área tiene una fila y cada período una columna, con los días hábiles de la provincia que elijas ya sumados. En cada celda hay lugar para cuatro partes: contenidos, propósitos, actividades y evaluación. Abajo, la caja de proyectos y actos del año reúne las fechas patrias que suelen organizar la escuela, del 25 de Mayo al 12 de Octubre. Docente, escuela y grado se completan en el panel y salen en el encabezado.',
	'Para repartir los contenidos, mirá los días hábiles de cada período y no solo los meses del almanaque. Mientras la provincia no publicó el corte, los días de clase se reparten en partes parejas y cada tramo se marca como estimado. El primero alcanza para el diagnóstico y para los contenidos que el resto del año va a necesitar. El segundo sirve para desarrollar. El tercero queda para integrar, revisar y evaluar. Si preferís cuatrimestres, la hoja arma dos bloques de duración parecida. Cuando la provincia publique el corte, la grilla usa esa fecha. No hace falta volcar el programa entero en cada celda. Alcanza con los contenidos de ese tramo, el propósito, dos o tres actividades y cómo vas a mirar qué aprendieron.',
	'En primer grado el ejemplo no es una lista de temas sueltos. Primero y segundo forman una unidad pedagógica: la Res. CFE 174/12 establece que no se repite primer grado y que ese recorrido se cierra en segundo. La planificación de 1.er grado puede tomar el tramo inicial de lectura, escritura y números, y dejar en 2.º la continuidad, sin un cierre que parezca el fin del ciclo. Educación Física, Plástica, Música e Inglés entran en la misma grilla. Si solo necesitás una, destildá el resto y la hoja queda para esa área: sirve, por ejemplo, para armar sola la de Educación Física. Las escalas y el cierre de cada provincia están en <a href="/como-se-califica-en-primaria/">cómo se califica en primaria</a>. El detalle de la unidad pedagógica está en <a href="/como-se-califica-en-primaria/se-repite-primer-grado/">primer grado</a>.',
	'Los días de la grilla son los lunes a viernes entre el inicio y el fin del ciclo. Se restan los feriados nacionales de la Ley 27.399, con el traslado cuando la ley lo pide, los feriados provinciales cargados, los días sin clases y el receso. El Jueves Santo se resta porque es día no laborable. Los puentes turísticos no entran hasta que exista un decreto de ese año. Si la provincia todavía no publicó la resolución, el recuadro dice días hábiles estimados y la hoja se actualiza sola cuando el dato pasa a oficial. La orientación vertical imprime en A4 parado y reparte las áreas de a cuatro por hoja, para que cada celda tenga renglón. La horizontal imprime apaisada: cada período se abre en cuatro columnas y las áreas entran en una sola hoja.',
	'Con las ocho áreas de primaria, la orientación vertical arma dos hojas. En nivel inicial la grilla no usa las áreas de primaria: usa los ejes de la sala, y podés elegir sala de 3, 4 o 5 años. El grado viaja en la dirección de la página, así que podés compartir el de 1.er grado o el de sala de 3 sin armar una página distinta por curso. Las fechas de la provincia que elijas están en el <a href="/calendario-escolar-2027/">calendario escolar 2027</a>. El cuaderno completo está en el <a href="/planificador-docente-2027/">planificador docente 2027</a> y en la <a href="/agenda-docente-2027/">agenda docente 2027</a>. El resto de las fichas está en el <a href="/">inicio</a>.',
];

export const preguntasPlanificacion = [
	{
		q: '¿Qué partes tiene una planificación anual?',
		a: 'Las áreas o los ejes, los períodos con sus días hábiles, y en cada celda contenidos, propósitos, actividades y evaluación. También trae la caja de proyectos y actos del año, y el lugar para docente, escuela y grado.',
	},
	{
		q: '¿Trimestres o cuatrimestres?',
		a: 'Las dos. Mientras no haya un corte oficial, los trimestres parten los días hábiles en tres partes parejas y los cuatrimestres en dos. La hoja los marca como estimados. Si la provincia publica las fechas de cada período, la grilla usa esas fechas.',
	},
	{
		q: '¿Sirve para nivel inicial?',
		a: 'Sí. En inicial la grilla usa los ejes de la sala: identidad y convivencia, juego, comunicación y expresión, ambiente natural y social y educación física. Podés elegir sala de 3, 4 o 5 años.',
	},
	{
		q: '¿Cómo se cuentan los días de clase?',
		a: 'Se cuentan los lunes a viernes entre el inicio y el fin del ciclo, y se restan feriados nacionales, feriados provinciales cargados, días sin clases y el receso de invierno. Si las fechas todavía son provisorias, la hoja lo indica como días hábiles estimados.',
	},
];

export const pasosPlanificacion = [
	{ name: 'Elegí provincia y grado', text: 'Elegí la provincia, el nivel y el grado o la sala.' },
	{ name: 'Elegí períodos y áreas', text: 'Elegí trimestres o cuatrimestres, las áreas y si la hoja va vertical u horizontal.' },
	{ name: 'Imprimí o guardá el PDF', text: 'Revisá la vista previa e imprimí o guardá el PDF. Para el archivo, elegí Guardar como PDF.' },
] as const;

export const seoAsistencia = {
	ruta: '/registro-de-asistencia/',
	title: 'Registro de asistencia de alumnos para imprimir (PDF A4) | Aulita',
	description:
		'Planilla de asistencia por mes en A4: los días hábiles de tu provincia ya cargados, feriados marcados y tu lista de alumnos. Para primaria y secundaria.',
	h1: 'Registro de asistencia para imprimir',
	keywords:
		'registro de asistencia de alumnos para imprimir, registro de asistencia pdf, registro de asistencia primaria, registro de asistencia secundaria pdf, planilla de asistencia docente',
};

export const respuestaAsistencia =
	'El registro de asistencia arma una hoja A4 apaisada por mes: los días hábiles de tu provincia van en columnas, con feriados y receso tachados, y tus alumnos en filas. Pegás la lista, imprimís o la guardás como PDF, y los nombres quedan solo en esta computadora.';

export const parrafosAsistencia = [
	'El registro de asistencia es una planilla A4 apaisada, una por mes. Elegís la provincia, si es primaria o secundaria, el mes o el año completo y cuántas filas querés. Los nombres se pegan de a uno por línea. Si la lista es más larga que las filas, ese mes sigue en otra hoja con las mismas columnas. Imprimir y Descargar PDF abren el cuadro del navegador. Para guardar el archivo, el destino es “Guardar como PDF”. Ese PDF no se publica en Aulita.',
	'Cada columna es un lunes, martes, miércoles, jueves o viernes de ese mes. El sábado y el domingo no entran. Un feriado o un día de receso sigue en la grilla, pero tachado y sombreado: no se cuenta entre los días hábiles y no se marca asistencia ahí. Lo mismo pasa con los días que quedan fuera del ciclo. El número del encabezado dice cuántos días hábiles tiene el mes. Si la provincia todavía no publicó la resolución, ese número es estimado y la planilla se actualiza sola cuando el dato pasa a oficial.',
	'En cada celda se anota un código. P es presente, A es ausente, T es tarde y J es falta justificada, la de un alumno que avisó. Al final de la fila hay dos casilleros, P y A, para sumar los presentes y los ausentes del mes. T y J no tienen columna de total: se leen en el día. La referencia queda impresa al pie para no tener que recordarla.',
	'Los nombres, el docente y la escuela se guardan solo en este navegador. No viajan en el enlace ni se envían a un servidor. Si compartís la dirección, la otra persona ve la planilla vacía. “Borrar mis datos” los elimina de esta computadora. Aulita no guarda una copia. Secundaria usa la misma grilla de días que primaria y cambia el rótulo de la hoja. El año completo imprime doce hojas, de marzo a febrero. Para el cuaderno están el <a href="/planificador-docente-2027/">planificador docente 2027</a>, la <a href="/agenda-docente-2027/">agenda docente 2027</a> y la <a href="/planificacion-anual/">planificación anual</a>. El resto de las fichas está en el <a href="/">inicio</a>.',
];

export const preguntasAsistencia = [
	{
		q: '¿Se guardan los nombres de mis alumnos?',
		a: 'Solo en este navegador. No se envían a un servidor ni quedan en el enlace para compartir. “Borrar mis datos” los elimina de esta computadora, y Aulita no guarda una copia.',
	},
	{
		q: '¿Puedo imprimir todo el año?',
		a: 'Sí. Elegí Año completo y sale una hoja apaisada por mes, de marzo a febrero. Si la lista no entra en la cantidad de filas, ese mes continúa en otra hoja.',
	},
	{
		q: '¿Qué significa J?',
		a: 'J es falta justificada. P es presente, A es ausente y T es tarde. Las columnas P y A del final son para anotar el total de presentes y de ausentes de cada alumno.',
	},
	{
		q: '¿Sirve para secundaria?',
		a: 'Sí. Elegí secundaria y la hoja lo indica en el encabezado. Los días son los de la provincia, los mismos que usa primaria.',
	},
];
