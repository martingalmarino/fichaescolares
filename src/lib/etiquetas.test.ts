import { describe, expect, it } from 'vitest';
import { parrafosCuadernos, parrafosGenerales, parrafosUtiles } from '../data/etiquetas-contenido';
import { contarPalabras } from './meta';
import { cupoDe, hojasDeEtiquetas, pxDelNombre } from './etiquetas';

describe('etiquetas', () => {
	it('cuenta las etiquetas que entran en cada hoja', () => {
		expect(cupoDe('cuaderno')).toBe(10);
		expect(cupoDe('carpeta')).toBe(3);
		expect(cupoDe('utiles')).toBe(48);
	});

	it('repite la misma etiqueta para llenar la hoja', () => {
		const hojas = hojasDeEtiquetas({
			nombre: 'Ana Pérez',
			grado: '3.º',
			escuela: 'Escuela 5',
			turno: 'Mañana',
			materia: 'Matemática',
			materias: [],
			porMateria: false,
			tamano: 'cuaderno',
		});
		expect(hojas).toHaveLength(1);
		expect(hojas[0]).toHaveLength(10);
		expect(hojas[0]?.every((item) => item.nombre === 'Ana Pérez' && item.materia === 'Matemática')).toBe(true);
	});

	it('arma una etiqueta por materia y deja el resto de la hoja vacío', () => {
		const hojas = hojasDeEtiquetas({
			nombre: 'Ana Pérez',
			grado: '3.º',
			escuela: '',
			turno: '',
			materia: '',
			materias: ['Matemática', 'Inglés', 'Música'],
			porMateria: true,
			tamano: 'cuaderno',
		});
		expect(hojas[0]?.filter((item) => !item.vacia).map((item) => item.materia)).toEqual(['Matemática', 'Inglés', 'Música']);
		expect(hojas[0]?.filter((item) => item.vacia)).toHaveLength(7);
		expect(hojas[0]?.filter((item) => !item.vacia).every((item) => item.nombre === 'Ana Pérez')).toBe(true);
	});

	it('pasa a otra hoja cuando hay más materias que lugares', () => {
		const hojas = hojasDeEtiquetas({
			nombre: 'Ana Pérez',
			grado: '',
			escuela: '',
			turno: '',
			materia: '',
			materias: ['Matemática', 'Inglés', 'Música', 'Plástica'],
			porMateria: true,
			tamano: 'carpeta',
		});
		expect(hojas).toHaveLength(2);
		expect(hojas[1]?.filter((item) => !item.vacia)).toHaveLength(1);
	});

	it('deja cada texto entre 300 y 500 palabras', () => {
		for (const partes of [parrafosGenerales, parrafosCuadernos, parrafosUtiles]) {
			const palabras = contarPalabras(partes.join(' '));
			expect(palabras).toBeGreaterThanOrEqual(300);
			expect(palabras).toBeLessThanOrEqual(500);
		}
	});

	it('achica la letra cuando el nombre no entra en el ancho', () => {
		const corto = pxDelNombre('Ana', 40, 16, false);
		const largo = pxDelNombre('María Florencia Alessandrini', 40, 16, true);
		expect(corto).toBe(16);
		expect(largo).toBeLessThan(16);
		expect(largo).toBeGreaterThanOrEqual(7);
	});
});
