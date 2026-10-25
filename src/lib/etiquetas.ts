export const MATERIAS = [
	'Matemática',
	'Prácticas del Lenguaje',
	'Ciencias Naturales',
	'Ciencias Sociales',
	'Inglés',
	'Música',
	'Plástica',
	'Ed. Física',
	'Comunicados',
] as const;

export const DISENOS = [
	{ id: 'rivadavia', nombre: 'Renglón Rivadavia' },
	{ id: 'cuadricula', nombre: 'Hoja cuadriculada' },
	{ id: 'guarda', nombre: 'Guarda pampa' },
	{ id: 'pizarron', nombre: 'Pizarrón' },
	{ id: 'escarapela', nombre: 'Escarapela' },
	{ id: 'minimal', nombre: 'Blanco y negro' },
] as const;

export const TAMANOS = {
	cuaderno: { id: 'cuaderno', nombre: 'Cuaderno', detalle: '9 × 5 cm · 10 por hoja', ancho: 90, alto: 50, columnas: 2, filas: 5 },
	carpeta: { id: 'carpeta', nombre: 'Carpeta', detalle: '10 × 7 cm · 3 por hoja', ancho: 100, alto: 70, columnas: 1, filas: 3 },
	utiles: { id: 'utiles', nombre: 'Útiles chicos', detalle: '5 × 1,5 cm · 48 por hoja', ancho: 50, alto: 15, columnas: 3, filas: 16 },
} as const;

export type Materia = (typeof MATERIAS)[number];
export type DisenoId = (typeof DISENOS)[number]['id'];
export type TamanoId = keyof typeof TAMANOS;
export type LetraEtiqueta = 'imprenta' | 'cursiva';
export type PresetEtiquetas = 'general' | 'cuadernos' | 'utiles';

export interface DatosEtiqueta {
	nombre: string;
	grado: string;
	materia: string;
	escuela: string;
	turno: string;
	vacia: boolean;
}

export interface PreferenciasEtiquetas {
	nombre: string;
	grado: string;
	escuela: string;
	turno: string;
	materia: string;
	materias: string[];
	porMateria: boolean;
	tamano: TamanoId;
	diseno: DisenoId;
	letra: LetraEtiqueta;
}

const CLAVE = 'fp-etiquetas';

export function cupoDe(tamano: TamanoId): number {
	const spec = TAMANOS[tamano];
	return spec.columnas * spec.filas;
}

export function pxDelNombre(texto: string, anchoMm: number, base: number, cursiva: boolean): number {
	const caracteres = Math.max([...texto].length, 1);
	const anchoPx = Math.max(anchoMm, 8) * (96 / 25.4);
	const factor = cursiva ? 0.62 : 0.52;
	const cabe = anchoPx / (caracteres * factor);
	return Math.max(7, Math.min(base, cabe));
}

function celda(parcial: Partial<DatosEtiqueta> & Pick<DatosEtiqueta, 'nombre'>): DatosEtiqueta {
	return {
		nombre: parcial.nombre,
		grado: parcial.grado ?? '',
		materia: parcial.materia ?? '',
		escuela: parcial.escuela ?? '',
		turno: parcial.turno ?? '',
		vacia: parcial.vacia ?? false,
	};
}

function vacia(): DatosEtiqueta {
	return celda({ nombre: '', vacia: true });
}

/** Arma las hojas. En modo por materia, una etiqueta por materia tildada. Si no hay materias, repite el nombre para que la vista previa se vea. */
export function hojasDeEtiquetas(entrada: {
	nombre: string;
	grado: string;
	escuela: string;
	turno: string;
	materia: string;
	materias: readonly string[];
	porMateria: boolean;
	tamano: TamanoId;
}): DatosEtiqueta[][] {
	const cupo = cupoDe(entrada.tamano);
	const comun = {
		nombre: entrada.nombre.trim(),
		grado: entrada.grado.trim(),
		escuela: entrada.escuela.trim(),
		turno: entrada.turno.trim(),
	};
	const materias = entrada.materias.map((item) => item.trim()).filter(Boolean);
	let items: DatosEtiqueta[];
	if (entrada.porMateria && materias.length > 0) {
		items = materias.map((materia) => celda({ ...comun, materia }));
	} else {
		items = Array.from({ length: cupo }, () => celda({ ...comun, materia: entrada.porMateria ? '' : entrada.materia.trim() }));
	}
	const hojas: DatosEtiqueta[][] = [];
	for (let inicio = 0; inicio < items.length; inicio += cupo) {
		const hoja = items.slice(inicio, inicio + cupo);
		while (hoja.length < cupo) hoja.push(vacia());
		hojas.push(hoja);
	}
	return hojas;
}

function esTamano(valor: unknown): valor is TamanoId {
	return valor === 'cuaderno' || valor === 'carpeta' || valor === 'utiles';
}

function esDiseno(valor: unknown): valor is DisenoId {
	return DISENOS.some((item) => item.id === valor);
}

function esLetra(valor: unknown): valor is LetraEtiqueta {
	return valor === 'imprenta' || valor === 'cursiva';
}

export function leerEtiquetas(): PreferenciasEtiquetas | null {
	try {
		const crudo = localStorage.getItem(CLAVE);
		if (!crudo) return null;
		const datos = JSON.parse(crudo) as Partial<PreferenciasEtiquetas>;
		if (!esTamano(datos.tamano) || !esDiseno(datos.diseno) || !esLetra(datos.letra)) return null;
		return {
			nombre: typeof datos.nombre === 'string' ? datos.nombre : '',
			grado: typeof datos.grado === 'string' ? datos.grado : '',
			escuela: typeof datos.escuela === 'string' ? datos.escuela : '',
			turno: typeof datos.turno === 'string' ? datos.turno : '',
			materia: typeof datos.materia === 'string' ? datos.materia : '',
			materias: Array.isArray(datos.materias) ? datos.materias.filter((item) => typeof item === 'string') : [],
			porMateria: Boolean(datos.porMateria),
			tamano: datos.tamano,
			diseno: datos.diseno,
			letra: datos.letra,
		};
	} catch {
		return null;
	}
}

export function guardarEtiquetas(datos: PreferenciasEtiquetas): void {
	try {
		localStorage.setItem(CLAVE, JSON.stringify(datos));
	} catch {
		/* el navegador puede rechazar el almacenamiento */
	}
}

export function borrarEtiquetas(): void {
	try {
		localStorage.removeItem(CLAVE);
	} catch {
		/* nada que borrar */
	}
}
