import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type AreaTarjetas = 'Lectoescritura' | 'Matemática' | 'Conocimiento del mundo';

export interface SetTarjetas {
	slug: string;
	titulo: string;
	h1: string;
	title: string;
	description: string;
	intro: string;
	pdf: string;
	pesoKB: number;
	paginas: number;
	tarjetas: number;
	enBlanco: number;
	nivel: string;
	area: AreaTarjetas;
	chips: string[];
	keywords: string[];
	contenido: { titulo: string; items: string[] };
	usos: { titulo: string; texto: string }[];
	faqs: { q: string; a: string }[];
	relacionados: string[];
	enlacesAulita: { href: string; texto: string; detalle: string }[];
	imagenes: { src: string; alt: string }[];
	fechaPublicacion: string;
}

export const HUB_TARJETAS = {
	title: 'Tarjetas educativas para imprimir en PDF gratis | Aulita',
	description:
		'Tarjetas educativas para imprimir gratis en PDF: abecedario, vocales, sílabas, números del 1 al 20, colores y formas, días y meses. A4, 8 por hoja, listas para recortar.',
	h1: 'Tarjetas educativas para imprimir',
	intro:
		'Seis juegos de tarjetas en PDF, gratis y listos para imprimir en A4: abecedario, vocales, sílabas, números del 1 al 20, colores y formas, días y meses. Cada hoja trae 8 tarjetas con línea de corte y tarjetas en blanco para que cada chico arme la suya. También sirven como flashcards en español.',
	keywords: [
		'tarjetas educativas para imprimir',
		'tarjetas educativas para imprimir pdf',
		'tarjetas educativas para niños pdf',
		'flashcards en español para imprimir gratis',
		'flashcards para imprimir pdf en español',
	],
};

export const FAQ_HUB: { q: string; a: string }[] = [
	{
		q: '¿Las tarjetas son gratis?',
		a: 'Sí. Todos los PDF se descargan gratis y sin registro. Podés imprimirlos para tu aula o tu casa todas las veces que quieras.',
	},
	{
		q: '¿Qué diferencia hay entre tarjetas educativas y flashcards?',
		a: 'Ninguna en la práctica: "flashcards" es el nombre en inglés de las tarjetas con una letra, número o palabra que se muestran rápido para repasar. Acá están en español y pensadas para la escuela argentina.',
	},
	{
		q: '¿Se pueden imprimir en blanco y negro?',
		a: 'Sí. Los colores son suaves y las letras quedan en azul oscuro, así que se leen bien en una impresora común.',
	},
	{
		q: '¿En qué tamaño se imprimen?',
		a: 'En hoja A4 vertical, 8 tarjetas por hoja (unos 9 × 6,5 cm cada una). Si usás hoja carta, elegí "Ajustar al tamaño de la página" en la impresora.',
	},
	{
		q: '¿Qué son las tarjetas "Mi tarjeta"?',
		a: 'Son tarjetas en blanco con un recuadro para dibujar y dos renglones para escribir. Completan la última hoja de cada PDF para que cada chico arme su propia tarjeta.',
	},
];

export const USOS_HUB: { titulo: string; texto: string }[] = [
	{ titulo: 'Imprimí y recortá', texto: 'Cada PDF viene en A4 con línea punteada. Sale bien en blanco y negro.' },
	{ titulo: 'Hacelas durar', texto: 'Pegalas en cartulina o plastificalas si las van a usar todo el año.' },
	{ titulo: 'Jugá', texto: 'Memotest, ordenar en fila, buscar la tarjeta que nombra la seño o armar el friso del aula.' },
];

export const ENLACES_HUB: { href: string; texto: string }[] = [
	{ href: '/sopa-de-letras/', texto: 'Sopa de letras' },
	{ href: '/caligrafia/', texto: 'Hojas de caligrafía' },
	{ href: '/tablas-y-operaciones/', texto: 'Tablas y operaciones' },
	{ href: '/laminas/', texto: 'Láminas para colorear' },
	{ href: '/etiquetas-escolares/', texto: 'Etiquetas escolares' },
];

const FECHA = '2026-10-29';

const caligrafia = { href: '/caligrafia/', texto: 'Hojas de caligrafía', detalle: 'Generador' };
const sopa = { href: '/sopa-de-letras/', texto: 'Sopa de letras', detalle: 'Generador' };

function imagenesDe(slug: string, alts: string[], conSegunda = true): { src: string; alt: string }[] {
	const fuentes = [`${slug}-portada.webp`, `${slug}-pagina-1.webp`, ...(conSegunda ? [`${slug}-pagina-2.webp`] : [])];
	return fuentes.map((archivo, indice) => ({ src: `/tarjetas/${archivo}`, alt: alts[indice] ?? '' }));
}

const crudas: SetTarjetas[] = [
	{
		slug: 'abecedario',
		titulo: 'Abecedario',
		h1: 'Tarjetas del abecedario para imprimir',
		title: 'Tarjetas del abecedario para imprimir en PDF gratis | Aulita',
		description:
			'Tarjetas del abecedario para imprimir gratis: las 27 letras con Ñ, en mayúscula y minúscula, con una palabra de ejemplo. PDF A4, 8 por hoja, listo para recortar.',
		intro:
			'PDF gratis con las 27 letras del abecedario en español, incluida la Ñ. Cada tarjeta tiene la letra en mayúscula y minúscula y una palabra de ejemplo. Son 8 tarjetas por hoja A4, con línea de corte y 5 tarjetas en blanco para completar.',
		pdf: '/pdf/tarjetas/tarjetas-abecedario-aulita.pdf',
		pesoKB: 357,
		paginas: 5,
		tarjetas: 27,
		enBlanco: 5,
		nivel: 'Inicial y 1.º grado',
		area: 'Lectoescritura',
		chips: ['Letras', 'Mayúscula y minúscula', 'Con Ñ'],
		keywords: [
			'tarjetas del abecedario para imprimir pdf gratis',
			'tarjetas del abecedario mayúsculas y minúsculas para imprimir',
			'abecedario para imprimir y recortar pdf',
			'abecedario para imprimir letra por letra',
			'flashcards abecedario español pdf',
		],
		contenido: {
			titulo: 'Qué trae',
			items: [
				'A avión',
				'B barco',
				'C casa',
				'D dedo',
				'E elefante',
				'F flor',
				'G gato',
				'H helado',
				'I isla',
				'J jirafa',
				'K kiwi',
				'L luna',
				'M mano',
				'N nube',
				'Ñ ñandú',
				'O oso',
				'P pelota',
				'Q queso',
				'R ratón',
				'S sol',
				'T tren',
				'U uva',
				'V vaca',
				'W wafle',
				'X xilofón',
				'Y yacaré',
				'Z zapato',
			],
		},
		usos: [
			{ titulo: 'Friso del abecedario', texto: 'pegalas en fila arriba del pizarrón para que estén siempre a la vista.' },
			{ titulo: '¿Con qué letra empieza?', texto: 'mostrá una tarjeta, tapá la palabra y que digan otras palabras con esa letra.' },
			{ titulo: 'Ordenar el abecedario', texto: 'repartí las tarjetas mezcladas y armen la fila de la A a la Z en el piso.' },
			{ titulo: 'Mi tarjeta', texto: 'cada chico completa una en blanco con la letra de su nombre y un dibujo.' },
		],
		faqs: [
			{
				q: '¿Cuántas letras tiene el abecedario en español?',
				a: '27 letras: las 26 del alfabeto latino más la Ñ. La CH y la LL son dígrafos, no letras, según la Real Academia Española desde 2010.',
			},
			{
				q: '¿Se pueden imprimir en blanco y negro?',
				a: 'Sí. Las letras están en azul oscuro y los colores son suaves, así que se leen bien en una impresora común.',
			},
			{
				q: '¿Sirven como flashcards del abecedario en español?',
				a: 'Sí, son lo mismo: tarjetas para mostrar y repasar. Están en español rioplatense, con palabras como ñandú y yacaré.',
			},
			{
				q: '¿Conviene empezar con mayúscula o minúscula?',
				a: 'En primer grado se suele empezar con imprenta mayúscula. Por eso cada tarjeta trae las dos: la mayúscula grande y la minúscula al lado.',
			},
		],
		relacionados: ['vocales', 'silabas'],
		enlacesAulita: [caligrafia, sopa],
		imagenes: imagenesDe('abecedario', [
			'Portada de las tarjetas del abecedario para imprimir',
			'Hoja de tarjetas del abecedario, de la A a la H',
			'Hoja de tarjetas del abecedario, de la I a la P',
		]),
		fechaPublicacion: FECHA,
	},
	{
		slug: 'vocales',
		titulo: 'Vocales',
		h1: 'Tarjetas de las vocales para imprimir',
		title: 'Tarjetas de las vocales para imprimir en PDF gratis | Aulita',
		description:
			'Tarjetas de las vocales para imprimir gratis: A, E, I, O, U en mayúscula y minúscula, con tres palabras de ejemplo cada una. PDF A4 listo para recortar.',
		intro:
			'PDF gratis con las 5 vocales en tarjetas grandes: cada una trae la vocal en mayúscula y minúscula y tres palabras que empiezan con ella. Son 8 tarjetas por hoja A4, con 3 tarjetas en blanco para completar.',
		pdf: '/pdf/tarjetas/tarjetas-vocales-aulita.pdf',
		pesoKB: 180,
		paginas: 2,
		tarjetas: 5,
		enBlanco: 3,
		nivel: 'Inicial',
		area: 'Lectoescritura',
		chips: ['Vocales', 'Palabras de ejemplo'],
		keywords: [
			'tarjetas de vocales para imprimir',
			'tarjetas de vocales para imprimir pdf',
			'tarjetas de vocales mayúsculas y minúsculas',
			'vocales para imprimir y recortar pdf',
			'vocales para imprimir pdf gratis',
		],
		contenido: {
			titulo: 'Qué trae',
			items: ['A (avión, abeja, árbol)', 'E (elefante, escoba, estrella)', 'I (isla, iglú, imán)', 'O (oso, ojo, ola)', 'U (uva, uno, uña)'],
		},
		usos: [
			{ titulo: '¿Qué vocal suena?', texto: 'decí una palabra y que levanten la tarjeta de la vocal con la que empieza.' },
			{ titulo: 'Vocal del día', texto: 'una tarjeta en el pizarrón y cada uno busca palabras que la tengan.' },
			{ titulo: 'Rincón de las vocales', texto: 'pegalas a la altura de los chicos para tocarlas y nombrarlas.' },
			{ titulo: 'Mi tarjeta', texto: 'que dibujen algo que empiece con su vocal favorita.' },
		],
		faqs: [
			{
				q: '¿Cuáles son las vocales en español?',
				a: 'Son cinco: A, E, I, O, U. La Y suena como vocal en palabras como "y" o "rey", pero es una consonante.',
			},
			{
				q: '¿A qué edad se enseñan las vocales?',
				a: 'En general en sala de 4 y sala de 5, y se repasan al empezar primer grado. Las tarjetas sirven para las tres etapas.',
			},
			{
				q: '¿Las palabras de ejemplo tienen dibujo?',
				a: 'No. Son tarjetas tipográficas, sin ilustraciones, para que se impriman bien y los chicos puedan dibujar en las tarjetas en blanco.',
			},
			{
				q: '¿Se pueden imprimir en blanco y negro?',
				a: 'Sí. La vocal está en azul oscuro y se lee bien con cualquier impresora.',
			},
		],
		relacionados: ['abecedario', 'silabas'],
		enlacesAulita: [caligrafia, sopa],
		imagenes: imagenesDe(
			'vocales',
			['Portada de las tarjetas de las vocales para imprimir', 'Hoja de tarjetas de las vocales A, E, I, O y U'],
			false,
		),
		fechaPublicacion: FECHA,
	},
	{
		slug: 'silabas',
		titulo: 'Sílabas',
		h1: 'Tarjetas de sílabas para imprimir',
		title: 'Tarjetas de sílabas para imprimir en PDF: ma me mi mo mu | Aulita',
		description:
			'Tarjetas de sílabas directas para imprimir gratis: ma me mi mo mu, pa pe pi po pu, sa se si so su y 13 familias más, en imprenta mayúscula y minúscula. PDF A4.',
		intro:
			'PDF gratis con 16 familias de sílabas directas (consonante + vocal), de ma me mi mo mu a ya ye yi yo yu. Cada tarjeta trae la familia en imprenta mayúscula, en minúscula y una palabra de ejemplo. Son 8 por hoja A4, listas para recortar.',
		pdf: '/pdf/tarjetas/tarjetas-silabas-aulita.pdf',
		pesoKB: 232,
		paginas: 3,
		tarjetas: 16,
		enBlanco: 0,
		nivel: '1.º grado',
		area: 'Lectoescritura',
		chips: ['MA ME MI MO MU', 'Imprenta mayúscula'],
		keywords: [
			'tarjetas de sílabas para imprimir',
			'tarjetas de sílabas ma me mi mo mu para imprimir',
			'tarjetas de silabas pa pe pi po pu para imprimir',
			'sílabas para imprimir en imprenta mayúscula',
			'silabas para imprimir pdf gratis',
			'silabas para imprimir primer grado',
		],
		contenido: {
			titulo: 'Qué trae',
			items: [
				'M (mesa)',
				'P (pato)',
				'S (sopa)',
				'L (luna)',
				'T (torta)',
				'N (nido)',
				'D (dedo)',
				'F (foca)',
				'B (bote)',
				'R (rosa)',
				'V (vela)',
				'J (jugo)',
				'Ñ (ñandú)',
				'LL (lluvia)',
				'CH (chupetín)',
				'Y (yema)',
			],
		},
		usos: [
			{ titulo: 'Leer la familia', texto: 'de corrido y salteado: mo, ma, mu…' },
			{ titulo: 'Armar palabras', texto: 'juntá dos tarjetas y buscá sílabas que formen una palabra: ma + no = mano.' },
			{ titulo: 'Familia del día', texto: 'una tarjeta por día en el pizarrón.' },
			{ titulo: 'Memotest de sílabas', texto: 'dos copias del PDF, tarjetas boca abajo, se arman pares leyendo en voz alta.' },
		],
		faqs: [
			{
				q: '¿Qué son las sílabas directas?',
				a: 'Son las que empiezan con consonante y terminan con vocal, como ma, pe o lu. Son las primeras que se enseñan para aprender a leer.',
			},
			{
				q: '¿Por qué en imprenta mayúscula?',
				a: 'Porque en primer grado en Argentina se suele empezar a leer y escribir en imprenta mayúscula. Cada tarjeta trae también la minúscula para el paso siguiente.',
			},
			{
				q: '¿Por qué no están ca, ga, ce o ci?',
				a: 'Porque la C y la G cambian de sonido según la vocal (ca/ce, ga/ge) y conviene enseñarlas aparte. Este juego tiene solo familias que suenan parejo.',
			},
			{
				q: '¿Hay tarjetas de sílabas trabadas?',
				a: 'Todavía no. Este juego es de sílabas directas. Las trabadas (bla, pra, tre…) van a venir en otro juego.',
			},
		],
		relacionados: ['abecedario', 'vocales'],
		enlacesAulita: [caligrafia, sopa],
		imagenes: imagenesDe('silabas', [
			'Portada de las tarjetas de sílabas para imprimir',
			'Primera hoja de tarjetas de sílabas directas',
			'Segunda hoja de tarjetas de sílabas directas',
		]),
		fechaPublicacion: FECHA,
	},
	{
		slug: 'numeros-1-al-20',
		titulo: 'Números del 1 al 20',
		h1: 'Tarjetas de números del 1 al 20 para imprimir',
		title: 'Tarjetas de números del 1 al 20 para imprimir en PDF | Aulita',
		description:
			'Tarjetas de números del 1 al 20 para imprimir gratis: el número, su nombre escrito y puntos para contar en cuadros de diez. PDF A4, 8 por hoja, listo para recortar.',
		intro:
			'PDF gratis con los números del 1 al 20. Cada tarjeta trae el número grande, su nombre escrito (uno, dos, tres…) y la cantidad en puntos sobre un cuadro de diez, para contar y comparar. Son 8 por hoja A4, con 4 tarjetas en blanco.',
		pdf: '/pdf/tarjetas/tarjetas-numeros-1-al-20-aulita.pdf',
		pesoKB: 422,
		paginas: 4,
		tarjetas: 20,
		enBlanco: 4,
		nivel: 'Inicial y 1.º grado',
		area: 'Matemática',
		chips: ['Números', 'Cuadros de diez'],
		keywords: [
			'tarjetas de números del 1 al 20 para imprimir pdf',
			'tarjetas de numeros para imprimir',
			'números del 1 al 20 para imprimir y recortar',
			'numeros del 1 al 20 para imprimir pdf',
			'tarjetas educativas de números',
			'flashcards números del 1 al 20',
		],
		contenido: {
			titulo: 'Qué trae',
			items: [
				'1 uno',
				'2 dos',
				'3 tres',
				'4 cuatro',
				'5 cinco',
				'6 seis',
				'7 siete',
				'8 ocho',
				'9 nueve',
				'10 diez',
				'11 once',
				'12 doce',
				'13 trece',
				'14 catorce',
				'15 quince',
				'16 dieciséis',
				'17 diecisiete',
				'18 dieciocho',
				'19 diecinueve',
				'20 veinte',
			],
		},
		usos: [
			{ titulo: 'Contar puntos', texto: 'tapá el número y que cuenten los puntos del cuadro.' },
			{ titulo: 'Ordenar la recta', texto: 'repartí las tarjetas y armen la fila del 1 al 20.' },
			{ titulo: 'Antes y después', texto: 'mostrá una tarjeta y que digan el número anterior y el siguiente.' },
			{ titulo: 'Mi tarjeta', texto: 'que escriban un número y dibujen esa cantidad.' },
		],
		faqs: [
			{
				q: '¿Qué es el cuadro de diez?',
				a: 'Es una grilla de 2 filas por 5 que ayuda a ver las cantidades de un vistazo: 7 es "un cinco y dos más". Del 11 al 20 hay dos cuadros: uno lleno y otro con lo que falta.',
			},
			{
				q: '¿Cómo se escribe 16 en letras?',
				a: 'Dieciséis, con tilde. Del 16 al 19 se escriben en una sola palabra: dieciséis, diecisiete, dieciocho, diecinueve.',
			},
			{
				q: '¿Hay tarjetas del 0 o del 1 al 100?',
				a: 'Este juego va del 1 al 20. Para practicar cuentas podés usar el generador de tablas y operaciones de Aulita.',
			},
			{
				q: '¿Se pueden imprimir en blanco y negro?',
				a: 'Sí. Los puntos llenos son círculos rellenos y los vacíos solo tienen borde, así que se distinguen bien aunque se impriman en gris.',
			},
		],
		relacionados: ['colores-y-formas', 'dias-y-meses'],
		enlacesAulita: [{ href: '/tablas-y-operaciones/', texto: 'Tablas y operaciones', detalle: 'Generador' }, sopa],
		imagenes: imagenesDe('numeros-1-al-20', [
			'Portada de las tarjetas de números del 1 al 20',
			'Primera hoja de tarjetas de números del 1 al 20',
			'Segunda hoja de tarjetas de números del 1 al 20',
		]),
		fechaPublicacion: FECHA,
	},
	{
		slug: 'colores-y-formas',
		titulo: 'Colores y formas',
		h1: 'Tarjetas de colores y formas para imprimir',
		title: 'Tarjetas de colores y formas para imprimir en PDF | Aulita',
		description:
			'Tarjetas de colores y figuras geométricas para imprimir gratis: 12 colores y 8 formas con su nombre en español. PDF A4, 8 por hoja, para nombrar y clasificar.',
		intro:
			'PDF gratis con 12 colores y 8 figuras geométricas, cada una con su nombre en español. Sirven para nombrar, clasificar y jugar en sala y en primer grado. Son 8 tarjetas por hoja A4, con 4 tarjetas en blanco.',
		pdf: '/pdf/tarjetas/tarjetas-colores-y-formas-aulita.pdf',
		pesoKB: 262,
		paginas: 4,
		tarjetas: 20,
		enBlanco: 4,
		nivel: 'Inicial',
		area: 'Conocimiento del mundo',
		chips: ['Colores', 'Figuras geométricas'],
		keywords: [
			'tarjetas de colores para imprimir',
			'tarjetas de colores para imprimir pdf',
			'tarjetas de formas para imprimir',
			'tarjetas de figuras geométricas',
			'tarjetas de formas y colores',
			'tarjetas de colores para niños',
		],
		contenido: {
			titulo: 'Qué trae',
			items: [
				'rojo',
				'azul',
				'amarillo',
				'verde',
				'naranja',
				'violeta',
				'rosa',
				'celeste',
				'marrón',
				'negro',
				'blanco',
				'gris',
				'círculo',
				'cuadrado',
				'triángulo',
				'rectángulo',
				'óvalo',
				'rombo',
				'estrella',
				'hexágono',
			],
		},
		usos: [
			{ titulo: 'Buscar en el aula', texto: 'mostrá un color y que traigan algo de ese color.' },
			{ titulo: 'Clasificar', texto: 'separar tarjetas de colores y de formas, o formas con lados y sin lados.' },
			{ titulo: 'Contar lados', texto: 'con las formas: ¿cuántos lados tiene el triángulo?' },
			{ titulo: 'Mi tarjeta', texto: 'que dibujen una forma y la pinten del color que quieran.' },
		],
		faqs: [
			{
				q: '¿Conviene imprimir este juego a color?',
				a: 'Sí. Es el único juego donde el color es el contenido, así que conviene imprimir a color. Las formas se entienden igual en blanco y negro.',
			},
			{
				q: '¿Por qué dice celeste y no azul claro?',
				a: 'Porque en Argentina decimos celeste, como el de la bandera. También usamos marrón y violeta.',
			},
			{
				q: '¿Qué figuras geométricas trae?',
				a: 'Círculo, cuadrado, triángulo, rectángulo, óvalo, rombo, estrella y hexágono: las que se trabajan en el nivel inicial.',
			},
			{
				q: '¿El blanco se ve en la tarjeta?',
				a: 'Sí, la muestra blanca tiene un borde gris para que se distinga del papel.',
			},
		],
		relacionados: ['numeros-1-al-20', 'dias-y-meses'],
		enlacesAulita: [{ href: '/laminas/', texto: 'Láminas para colorear', detalle: 'Imprimibles' }, sopa],
		imagenes: imagenesDe('colores-y-formas', [
			'Portada de las tarjetas de colores y formas',
			'Primera hoja de tarjetas de colores y formas',
			'Segunda hoja de tarjetas de colores y formas',
		]),
		fechaPublicacion: FECHA,
	},
	{
		slug: 'dias-y-meses',
		titulo: 'Días y meses',
		h1: 'Tarjetas de los días de la semana y los meses del año',
		title: 'Tarjetas de los días de la semana y meses del año para imprimir | Aulita',
		description:
			'Tarjetas de los días de la semana y los meses del año para imprimir gratis, numeradas en orden y con abreviatura. PDF A4 para armar el calendario del aula.',
		intro:
			'PDF gratis con los 7 días de la semana y los 12 meses del año en tarjetas grandes. Cada una dice qué número de día o de mes es y trae la abreviatura (LUN, ENE…), para armar la rutina y el calendario del aula. Son 8 por hoja A4, con 5 tarjetas en blanco.',
		pdf: '/pdf/tarjetas/tarjetas-dias-y-meses-aulita.pdf',
		pesoKB: 266,
		paginas: 4,
		tarjetas: 19,
		enBlanco: 5,
		nivel: 'Inicial a 2.º grado',
		area: 'Conocimiento del mundo',
		chips: ['Días de la semana', 'Meses del año'],
		keywords: [
			'tarjetas de los días de la semana para imprimir',
			'tarjetas de los meses del año para imprimir',
			'días de la semana para imprimir pdf',
			'días de la semana para imprimir preescolar',
			'meses del año para imprimir',
			'tarjetas de los dias de la semana para niños',
		],
		contenido: {
			titulo: 'Qué trae',
			items: [
				'lunes',
				'martes',
				'miércoles',
				'jueves',
				'viernes',
				'sábado',
				'domingo',
				'enero',
				'febrero',
				'marzo',
				'abril',
				'mayo',
				'junio',
				'julio',
				'agosto',
				'septiembre',
				'octubre',
				'noviembre',
				'diciembre',
			],
		},
		usos: [
			{ titulo: 'Ronda de la mañana', texto: '¿qué día es hoy? ¿qué día fue ayer?' },
			{ titulo: 'Calendario del aula', texto: 'la tarjeta del mes arriba y la del día que se cambia cada mañana.' },
			{ titulo: 'Ordenar', texto: 'mezclá los meses y que los pongan en orden.' },
			{ titulo: 'Mi tarjeta', texto: 'que escriban su mes de cumpleaños y lo decoren.' },
		],
		faqs: [
			{
				q: '¿La semana empieza el lunes o el domingo?',
				a: 'En la escuela argentina se trabaja de lunes a viernes, por eso el lunes es el día 1. Si en tu aula preferís empezar por el domingo, las tarjetas se pueden ordenar como quieras.',
			},
			{
				q: '¿Se escribe septiembre o setiembre?',
				a: 'Las dos formas son correctas según la RAE. Usamos septiembre, que es la más común en Argentina.',
			},
			{
				q: '¿Los días y meses van con mayúscula?',
				a: 'No. En español los días de la semana y los meses se escriben con minúscula, salvo al principio de una oración.',
			},
			{
				q: '¿Sirven para trabajar las efemérides?',
				a: 'Sí. Combinalas con el calendario de efemérides de Aulita para ver qué se recuerda en cada mes.',
			},
		],
		relacionados: ['numeros-1-al-20', 'colores-y-formas'],
		enlacesAulita: [
			{ href: '/efemerides/', texto: 'Efemérides escolares', detalle: 'Calendario' },
			{ href: '/calendario-escolar-2027/', texto: 'Calendario escolar 2027', detalle: 'Por provincia' },
		],
		imagenes: imagenesDe('dias-y-meses', [
			'Portada de las tarjetas de los días de la semana y los meses',
			'Primera hoja de tarjetas de días y meses',
			'Segunda hoja de tarjetas de días y meses',
		]),
		fechaPublicacion: FECHA,
	},
];

function raizDelProyecto(): string {
	let dir = dirname(fileURLToPath(import.meta.url));
	for (let i = 0; i < 8; i++) {
		if (existsSync(join(dir, 'public', 'tarjetas'))) return dir;
		const padre = dirname(dir);
		if (padre === dir) break;
		dir = padre;
	}
	throw new Error('No encuentro public/tarjetas desde el módulo de datos');
}

const raiz = raizDelProyecto();

function existe(publico: string): number {
	const archivo = join(raiz, 'public', publico.replace(/^\//, ''));
	if (!existsSync(archivo)) throw new Error(`No existe ${publico}`);
	return statSync(archivo).size;
}

function validar(set: SetTarjetas, slugs: Set<string>) {
	if (slugs.has(set.slug)) throw new Error(`Slug repetido: ${set.slug}`);
	slugs.add(set.slug);
	if (set.pdf !== `/pdf/tarjetas/tarjetas-${set.slug}-aulita.pdf`) throw new Error(`PDF inesperado en ${set.slug}`);
	if (!set.imagenes[0]?.src.endsWith(`${set.slug}-portada.webp`)) throw new Error(`Falta la portada en ${set.slug}`);
	if (!set.imagenes.some((imagen) => imagen.src.endsWith(`${set.slug}-pagina-1.webp`))) throw new Error(`Falta la página 1 en ${set.slug}`);
	if (set.imagenes.some((imagen) => !imagen.alt.trim())) throw new Error(`Alt vacío en ${set.slug}`);
	const kb = Math.round(existe(set.pdf) / 1024);
	if (kb !== set.pesoKB) throw new Error(`${set.slug}: pesoKB ${set.pesoKB}, el archivo pesa ${kb} KB`);
	for (const imagen of set.imagenes) existe(imagen.src);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(set.fechaPublicacion)) throw new Error(`Fecha inválida en ${set.slug}`);
	if (set.relacionados.length !== 2 || set.enlacesAulita.length !== 2) throw new Error(`Relacionados incompletos en ${set.slug}`);
}

const slugs = new Set<string>();
for (const set of crudas) validar(set, slugs);
for (const set of crudas) {
	for (const slug of set.relacionados) {
		if (slug === set.slug || !slugs.has(slug)) throw new Error(`Relacionada inexistente: ${set.slug} → ${slug}`);
	}
}

export const TARJETAS: SetTarjetas[] = crudas;

export function tarjetaPorSlug(slug: string): SetTarjetas | undefined {
	return TARJETAS.find((set) => set.slug === slug);
}

export function relacionadasDe(set: SetTarjetas): SetTarjetas[] {
	return set.relacionados.map((slug) => {
		const otra = tarjetaPorSlug(slug);
		if (!otra) throw new Error(`Relacionada inexistente: ${set.slug} → ${slug}`);
		return otra;
	});
}

export function miniatura(set: SetTarjetas): { src: string; alt: string } {
	const pagina = set.imagenes.find((imagen) => imagen.src.endsWith('-pagina-1.webp'));
	if (!pagina) throw new Error(`Sin miniatura en ${set.slug}`);
	return pagina;
}

export function nivelesDe(set: SetTarjetas): string[] {
	const texto = set.nivel.toLocaleLowerCase('es-AR');
	const inicial = texto.includes('inicial');
	const hastaSegundo = inicial && texto.includes('2.º');
	return [inicial ? 'inicial' : '', texto.includes('1.º') || hastaSegundo ? 'primero' : '', texto.includes('2.º') ? 'segundo' : ''].filter(Boolean);
}

export function claveArea(area: AreaTarjetas): string {
	if (area === 'Lectoescritura') return 'lectoescritura';
	if (area === 'Matemática') return 'matematica';
	return 'mundo';
}

export function lineaSet(set: SetTarjetas): string {
	const blancos = set.enBlanco > 0 ? ` + ${set.enBlanco} en blanco` : '';
	return `${set.tarjetas} tarjetas${blancos} · ${set.paginas} págs. · ${set.nivel}`;
}

export function marcaContenido(texto: string): { marca: string; resto: string } | null {
	const match = texto.match(/^(\S+)\s+(.+)$/);
	if (!match || match[1].length > 4) return null;
	return { marca: match[1], resto: match[2] };
}
