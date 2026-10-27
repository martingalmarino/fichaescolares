export const CALIFICACION_ACTUALIZADO = '2026-10-25';
export const CALIFICACION_ACTUALIZADO_TEXTO = 'octubre 2026';

export const NORMA_NACIONAL = 'Res. CFE 174/12';

export type ModoCalificacion = 'numero' | 'conceptual' | 'sin-datos';

export type GrupoHub = 'escala' | 'conceptos';

export interface EscalaNumeroHub {
	tipo: 'numero';
	desde: number;
	hasta: number;
	apruebaDesde: number;
}

export interface EscalaConceptoHub {
	tipo: 'concepto';
	items: readonly { texto: string; aprueba: boolean }[];
}

/** Presentación del hub. Los hechos (ciclo, aprueba, norma, modo) no cambian. */
export interface FichaHub {
	grupo: GrupoHub;
	orden: number;
	apruebaVisible?: string;
	apruebaDetalle?: string;
	/** Completa la frase «En [provincia] se aprueba con …». */
	apruebaFrase: string;
	viñetas?: readonly string[];
	conceptos?: string;
	escala?: EscalaNumeroHub | EscalaConceptoHub;
	guia?: string;
}

export interface JurisdiccionCalificacion {
	slug: string;
	nombre: string;
	ciclo1: string;
	ciclo2: string;
	aprueba: string;
	norma: string;
	modo: ModoCalificacion;
	/** Nota mínima de aprobación en la escala numérica. */
	apruebaCon?: number;
	min?: number;
	max?: number;
	/** Mendoza: el promedio se trunca a dos decimales, sin redondear. */
	truncar?: boolean;
	aviso?: string;
	detalle?: string;
	hub?: FichaHub;
}

const sinDatos = 'Sin datos oficiales publicados';

function vacia(slug: string, nombre: string): JurisdiccionCalificacion {
	return { slug, nombre, ciclo1: sinDatos, ciclo2: sinDatos, aprueba: sinDatos, norma: '—', modo: 'sin-datos' };
}

export const jurisdiccionesCalificacion: JurisdiccionCalificacion[] = [
	{
		slug: 'buenos-aires',
		nombre: 'Provincia de Buenos Aires',
		ciclo1: 'Desaprobado, Regular, Bueno, Muy bueno, Sobresaliente',
		ciclo2: 'De 1 a 10, desde 4.º',
		aprueba: 'Bueno / 7',
		norma: 'Res. DGCyE 1057/14 y 197/16',
		modo: 'numero',
		apruebaCon: 7,
		min: 1,
		max: 10,
		aviso: 'La nota final la define la escuela con el informe final, no es un promedio automático.',
		detalle: 'Trimestres más un informe final. La nota final no es un promedio.',
		hub: {
			grupo: 'escala',
			orden: 1,
			apruebaVisible: '7',
			apruebaDetalle: 'o Bueno',
			apruebaFrase: '7 o Bueno',
			viñetas: ['1.º a 3.º: Desaprobado · Regular · Bueno · Muy bueno · Sobresaliente', 'Desde 4.º: 1 a 10'],
			escala: { tipo: 'numero', desde: 1, hasta: 10, apruebaDesde: 7 },
			guia: '/como-se-califica-en-primaria/provincia-de-buenos-aires/',
		},
	},
	{
		slug: 'caba',
		nombre: 'Ciudad Autónoma de Buenos Aires',
		ciclo1: 'Destacado, Avanzado, Alcanzado, En proceso, No alcanzó. De 1.º a 3.º solo conceptual.',
		ciclo2: 'De 4.º a 7.º, número y concepto: Destacado (10), Avanzado (8-9), Alcanzado (6-7), En proceso (4-5), No alcanzó (1-3).',
		aprueba: 'Alcanzado',
		norma: 'Res. 2765/24',
		modo: 'conceptual',
		detalle: 'Escala vigente desde 2025.',
		hub: {
			grupo: 'escala',
			orden: 2,
			apruebaVisible: 'Alcanzado',
			apruebaDetalle: '6-7 desde 4.º',
			apruebaFrase: 'Alcanzado',
			viñetas: [
				'1.º a 3.º: solo conceptos',
				'4.º a 7.º: Destacado (10) · Avanzado (8-9) · Alcanzado (6-7) · En proceso (4-5) · No alcanzó (1-3)',
			],
			escala: {
				tipo: 'concepto',
				items: [
					{ texto: 'No alcanzó', aprueba: false },
					{ texto: 'En proceso', aprueba: false },
					{ texto: 'Alcanzado', aprueba: true },
					{ texto: 'Avanzado', aprueba: true },
					{ texto: 'Destacado', aprueba: true },
				],
			},
			guia: '/como-se-califica-en-primaria/caba/',
		},
	},
	{
		slug: 'catamarca',
		nombre: 'Catamarca',
		ciclo1: 'De 1 a 10, con nota conceptual, desde 2023',
		ciclo2: 'De 1 a 10, con nota conceptual, desde 2023',
		aprueba: '6',
		norma: 'Res. 168/23',
		modo: 'numero',
		apruebaCon: 6,
		min: 1,
		max: 10,
		hub: {
			grupo: 'escala',
			orden: 7,
			apruebaVisible: '6',
			apruebaFrase: '6',
			viñetas: ['1 a 10 con nota conceptual', 'Desde 2023'],
			escala: { tipo: 'numero', desde: 1, hasta: 10, apruebaDesde: 6 },
		},
	},
	vacia('chaco', 'Chaco'),
	{
		slug: 'chubut',
		nombre: 'Chubut',
		ciclo1: 'En proceso, Logrado, Logrado destacado, Logrado sobresaliente',
		ciclo2: 'En proceso, Logrado, Logrado destacado, Logrado sobresaliente',
		aprueba: 'Sin nota numérica publicada',
		norma: 'Circular 02/21',
		modo: 'conceptual',
		hub: {
			grupo: 'conceptos',
			orden: 1,
			apruebaFrase: 'la escala conceptual En proceso, Logrado, Logrado destacado y Logrado sobresaliente',
			conceptos: 'En proceso · Logrado · Logrado destacado · Logrado sobresaliente',
		},
	},
	vacia('cordoba', 'Córdoba'),
	vacia('corrientes', 'Corrientes'),
	{
		slug: 'entre-rios',
		nombre: 'Entre Ríos',
		ciclo1: 'De 6 a 10. Debajo de 6: En proceso de apropiación de contenidos',
		ciclo2: 'De 6 a 10. Debajo de 6: En proceso de apropiación de contenidos',
		aprueba: '6',
		norma: 'Res. 920/19 CGE',
		modo: 'numero',
		apruebaCon: 6,
		min: 6,
		max: 10,
		hub: {
			grupo: 'escala',
			orden: 6,
			apruebaVisible: '6',
			apruebaFrase: '6',
			viñetas: ['Escala de 6 a 10', 'Debajo de 6: En proceso de apropiación de contenidos'],
			escala: { tipo: 'numero', desde: 6, hasta: 10, apruebaDesde: 6 },
		},
	},
	vacia('formosa', 'Formosa'),
	{
		slug: 'jujuy',
		nombre: 'Jujuy',
		ciclo1: 'Destacado, Esperado, En proceso, De inicio',
		ciclo2: 'Destacado, Esperado, En proceso, De inicio',
		aprueba: 'Sin nota numérica publicada',
		norma: '—',
		modo: 'conceptual',
		hub: {
			grupo: 'conceptos',
			orden: 2,
			apruebaFrase: 'la escala conceptual Destacado, Esperado, En proceso y De inicio',
			conceptos: 'Destacado · Esperado · En proceso · De inicio',
		},
	},
	vacia('la-pampa', 'La Pampa'),
	vacia('la-rioja', 'La Rioja'),
	{
		slug: 'mendoza',
		nombre: 'Mendoza',
		ciclo1: 'De 1 a 10, con dos decimales, sin redondeo',
		ciclo2: 'De 1 a 10, con dos decimales, sin redondeo',
		aprueba: '7',
		norma: 'Res. DGE 1949/22, modificada por Res. 4778/26',
		modo: 'numero',
		apruebaCon: 7,
		min: 1,
		max: 10,
		truncar: true,
		detalle: 'La nota del período es el promedio exacto. Dos períodos más una evaluación integradora. Vigente desde agosto de 2026.',
		hub: {
			grupo: 'escala',
			orden: 3,
			apruebaVisible: '7',
			apruebaFrase: '7',
			viñetas: ['1 a 10 en todos los grados', 'Dos decimales, sin redondeo'],
			escala: { tipo: 'numero', desde: 1, hasta: 10, apruebaDesde: 7 },
		},
	},
	vacia('misiones', 'Misiones'),
	{
		slug: 'neuquen',
		nombre: 'Neuquén',
		ciclo1: 'Conceptual, sin detalle de conceptos en esta ficha',
		ciclo2: 'Conceptual, sin detalle de conceptos en esta ficha',
		aprueba: 'Sin nota numérica publicada',
		norma: 'Res. 1398/14',
		modo: 'conceptual',
		hub: {
			grupo: 'conceptos',
			orden: 4,
			apruebaFrase: 'una escala conceptual',
			conceptos: 'Conceptual',
		},
	},
	{
		slug: 'rio-negro',
		nombre: 'Río Negro',
		ciclo1: 'Destacado, Esperado, En proceso, De inicio',
		ciclo2: 'Destacado, Esperado, En proceso, De inicio',
		aprueba: 'Sin nota numérica publicada',
		norma: '—',
		modo: 'conceptual',
		hub: {
			grupo: 'conceptos',
			orden: 3,
			apruebaFrase: 'la escala conceptual Destacado, Esperado, En proceso y De inicio',
			conceptos: 'Destacado · Esperado · En proceso · De inicio',
		},
	},
	{
		slug: 'salta',
		nombre: 'Salta',
		ciclo1: 'Sobresaliente, Muy bueno, Bueno, Regular, Insatisfactorio',
		ciclo2: 'De 1 a 10, desde 4.º',
		aprueba: 'Bueno / 6',
		norma: 'Res. 1142/12',
		modo: 'numero',
		apruebaCon: 6,
		min: 1,
		max: 10,
		detalle: 'Trimestres.',
		hub: {
			grupo: 'escala',
			orden: 4,
			apruebaVisible: '6',
			apruebaDetalle: 'o Bueno',
			apruebaFrase: '6 o Bueno',
			viñetas: ['1.º a 3.º: Sobresaliente · Muy bueno · Bueno · Regular · Insatisfactorio', 'Desde 4.º: 1 a 10'],
			escala: { tipo: 'numero', desde: 1, hasta: 10, apruebaDesde: 6 },
		},
	},
	vacia('san-juan', 'San Juan'),
	vacia('san-luis', 'San Luis'),
	vacia('santa-cruz', 'Santa Cruz'),
	{
		slug: 'santa-fe',
		nombre: 'Santa Fe',
		ciclo1: 'Excelente, Muy bueno, Bueno, Satisfactorio, No satisfactorio (de 1.º a 6.º)',
		ciclo2: 'De 1 a 10 en 7.º',
		aprueba: 'Satisfactorio / 6',
		norma: 'Decretos 181/09 y 182/09',
		modo: 'conceptual',
		detalle: 'De 1.º a 6.º la escala es conceptual. En 7.º es de 1 a 10.',
		hub: {
			grupo: 'escala',
			orden: 5,
			apruebaVisible: '6',
			apruebaDetalle: 'o Satisfactorio',
			apruebaFrase: '6 o Satisfactorio',
			viñetas: ['1.º a 6.º: Excelente · Muy bueno · Bueno · Satisfactorio · No satisfactorio', '7.º: 1 a 10'],
			escala: { tipo: 'numero', desde: 1, hasta: 10, apruebaDesde: 6 },
		},
	},
	vacia('santiago-del-estero', 'Santiago del Estero'),
	vacia('tierra-del-fuego', 'Tierra del Fuego, Antártida e Islas del Atlántico Sur'),
	vacia('tucuman', 'Tucumán'),
];

export function calificacionDe(slug: string): JurisdiccionCalificacion | undefined {
	return jurisdiccionesCalificacion.find((item) => item.slug === slug);
}

export function normaCitada(norma: string): string {
	const limpia = norma.trim();
	return limpia === '' || limpia === '—' ? 'Sin norma citada' : limpia;
}

export function fraseAprobacion(item: JurisdiccionCalificacion): string {
	if (!item.hub) return '';
	return `En ${item.nombre} se aprueba con ${item.hub.apruebaFrase} (${normaCitada(item.norma)}).`;
}

export function ariaEscala(item: JurisdiccionCalificacion): string {
	const escala = item.hub?.escala;
	if (!escala) return '';
	if (escala.tipo === 'numero') return `Escala del ${escala.desde} al ${escala.hasta}, aprueba con ${escala.apruebaDesde}`;
	const conceptos = escala.items.map((concepto) => concepto.texto).join(', ');
	return `Escala conceptual, aprueba con ${item.hub?.apruebaVisible}. Conceptos: ${conceptos}`;
}

export function jurisdiccionesHub(grupo: GrupoHub): JurisdiccionCalificacion[] {
	return jurisdiccionesCalificacion.filter((item) => item.hub?.grupo === grupo).sort((a, b) => (a.hub?.orden ?? 0) - (b.hub?.orden ?? 0));
}

export function jurisdiccionesSinDatos(): JurisdiccionCalificacion[] {
	return jurisdiccionesCalificacion.filter((item) => item.modo === 'sin-datos');
}

export function urlFichaProvincia(item: JurisdiccionCalificacion, origen: string, rutaHub: string): string {
	if (item.hub?.guia) return `${origen}${item.hub.guia}`;
	return `${origen}${rutaHub}#${item.slug}`;
}

export const equivalenciasCaba = [
	{ concepto: 'Destacado', numeros: '10' },
	{ concepto: 'Avanzado', numeros: '8 y 9' },
	{ concepto: 'Alcanzado', numeros: '6 y 7' },
	{ concepto: 'En proceso', numeros: '4 y 5' },
	{ concepto: 'No alcanzó', numeros: '1, 2 y 3' },
] as const;

export const preguntasHub = [
	{
		q: '¿Con cuánto se aprueba en primaria?',
		a: 'No hay un número nacional: donde hay dato publicado, se aprueba con 6 o con 7. Provincia de Buenos Aires aprueba con Bueno o 7. CABA, con Alcanzado. Mendoza, con 7. Salta, con Bueno o 6. Santa Fe, con Satisfactorio o 6. Entre Ríos y Catamarca, con 6. Neuquén, Chubut, Río Negro y Jujuy no publican una nota numérica de aprobación en esta ficha. El resto de las provincias figura como sin datos oficiales publicados.',
	},
	{
		q: '¿Desde qué grado ponen notas con número?',
		a: 'Depende de la provincia: no hay un grado único en el país. En Provincia de Buenos Aires y en Salta el número empieza en 4.º. En CABA, de 1.º a 3.º es solo conceptual y de 4.º a 7.º van número y concepto. En Santa Fe el número está en 7.º; de 1.º a 6.º la escala es conceptual. Mendoza, Entre Ríos y Catamarca publican escala numérica sin un corte de grado en estos datos. Chubut, Río Negro y Jujuy usan conceptos.',
	},
	{
		q: '¿Se puede repetir 1.º grado?',
		a: 'No. La Res. CFE 174/12 crea la unidad pedagógica de 1.º y 2.º grado: no se repite 1.º.',
	},
	{
		q: '¿Qué significa "En proceso" en el boletín?',
		a: 'No significa lo mismo en todas las provincias. En CABA, En proceso equivale a 4 o 5. En Entre Ríos, debajo de 6 el registro es "En proceso de apropiación de contenidos". Chubut, Río Negro y Jujuy usan "En proceso" como concepto, sin un número publicado en esta ficha.',
	},
];

export const preguntasBuenosAires = [
	{
		q: '¿Con cuánto se aprueba en primaria en Provincia de Buenos Aires?',
		a: 'Se aprueba con Bueno en el 1.º ciclo y con 7 desde 4.º. La fuente es la Res. DGCyE 1057/14 y la 197/16.',
	},
	{
		q: '¿La nota final es el promedio de los trimestres?',
		a: 'No. El boletín tiene trimestres más un informe final, y la nota final no es un promedio.',
	},
	{
		q: '¿Desde qué grado la nota es un número?',
		a: 'Desde 4.º la escala es de 1 a 10. En el 1.º ciclo los conceptos son Desaprobado, Regular, Bueno, Muy bueno y Sobresaliente.',
	},
];

export const preguntasCaba = [
	{
		q: '¿Con cuánto se aprueba en primaria en CABA?',
		a: 'Se aprueba con Alcanzado. En la escala de 2025, Alcanzado equivale a 6 o 7.',
	},
	{
		q: '¿Desde qué grado el boletín trae número?',
		a: 'De 4.º a 7.º van el número y el concepto. De 1.º a 3.º el boletín es solo conceptual.',
	},
	{
		q: '¿Qué quiere decir En proceso en CABA?',
		a: 'En proceso equivale a 4 o 5, según la Res. 2765/24.',
	},
];

export const preguntasCalculadora = [
	{
		q: '¿El promedio es la nota del boletín?',
		a: 'En Mendoza, la nota del período es el promedio exacto, con dos decimales y sin redondeo. En Provincia de Buenos Aires la nota final no es un promedio automático: la cierra la escuela con el informe final.',
	},
	{
		q: '¿Con cuánto aprueba el promedio?',
		a: 'Mendoza y el segundo ciclo bonaerense aprueban con 7. Salta, Entre Ríos y Catamarca, con 6. Las escalas solo conceptuales no se promedian en esta calculadora.',
	},
	{
		q: '¿Sirve para el primer ciclo conceptual?',
		a: 'No calcula un número cuando la escala publicada es conceptual. En ese caso muestra los conceptos y la norma.',
	},
];

export const preguntasRepite = [
	{
		q: '¿Se repite primer grado en Argentina?',
		a: 'No. La Res. CFE 174/12 establece que 1.º y 2.º grado forman una unidad pedagógica y que no se repite 1.º.',
	},
	{
		q: '¿Qué pasa en segundo grado?',
		a: '1.º y 2.º se cursan como una unidad, así que el cierre no se decide al terminar 1.º. Esta ficha no trae una regla nacional sobre repetir 2.º: eso se confirma con la escuela y con la norma de la provincia.',
	},
];

export const preguntasBoletin = [
	{
		q: '¿Qué significa En proceso en el boletín?',
		a: 'Depende de la provincia. En CABA equivale a 4 o 5. En Entre Ríos, debajo de 6 se registra "En proceso de apropiación de contenidos".',
	},
	{
		q: '¿Cómo se lee el boletín de Provincia de Buenos Aires?',
		a: 'En el 1.º ciclo se lee el concepto: se aprueba con Bueno. Desde 4.º se lee el número de 1 a 10 y se aprueba con 7. La nota final no es el promedio de los trimestres.',
	},
	{
		q: '¿Cómo se lee el boletín de CABA?',
		a: 'Desde 2025 los conceptos son Destacado (10), Avanzado (8-9), Alcanzado (6-7), En proceso (4-5) y No alcanzó (1-3). Se aprueba con Alcanzado. De 1.º a 3.º no figura el número.',
	},
];
