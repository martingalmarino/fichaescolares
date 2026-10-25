import { describe, expect, it } from 'vitest';
import { evaluarNotas } from '../lib/promedio-primaria';
import { calificacionDe, jurisdiccionesCalificacion } from './calificacion-primaria';

describe('calificación de primaria', () => {
	it('cubre las 24 jurisdicciones y no inventa números donde no hay datos', () => {
		expect(jurisdiccionesCalificacion).toHaveLength(24);
		const slugs = jurisdiccionesCalificacion.map((item) => item.slug);
		expect(new Set(slugs).size).toBe(24);
		for (const item of jurisdiccionesCalificacion.filter((fila) => fila.modo === 'sin-datos')) {
			expect(item.ciclo1).toBe('Sin datos oficiales publicados');
			expect(item.ciclo2).toBe('Sin datos oficiales publicados');
			expect(item.aprueba).toBe('Sin datos oficiales publicados');
			expect(item.apruebaCon).toBeUndefined();
			expect(`${item.ciclo1} ${item.aprueba}`).not.toMatch(/\d/);
		}
	});

	it('deja Neuquén sin una lista de conceptos que no fue publicada acá', () => {
		const neuquen = calificacionDe('neuquen');
		expect(neuquen?.norma).toBe('Res. 1398/14');
		expect(neuquen?.ciclo1).not.toMatch(/Logrado|Destacado|Sobresaliente/);
		expect(neuquen?.apruebaCon).toBeUndefined();
	});

	it('trunca el promedio de Mendoza sin redondear y aprueba desde 7', () => {
		const mendoza = calificacionDe('mendoza');
		expect(mendoza).toBeDefined();
		const justito = evaluarNotas(mendoza!, ['6,99', '7,00']);
		expect(justito.resultado?.promedio).toBe('6,99');
		expect(justito.resultado?.aprueba).toBe(false);
		const aprueba = evaluarNotas(mendoza!, ['7', '7,5']);
		expect(aprueba.resultado?.promedio).toBe('7,25');
		expect(aprueba.resultado?.aprueba).toBe(true);
	});

	it('no promedia un valor menor a 6 en Entre Ríos', () => {
		const entreRios = calificacionDe('entre-rios');
		expect(evaluarNotas(entreRios!, ['5']).error).toMatch(/En proceso de apropiación de contenidos/);
		expect(evaluarNotas(entreRios!, ['6', '8']).resultado?.aprueba).toBe(true);
	});

	it('avisa que en Buenos Aires la nota final no es el promedio', () => {
		expect(calificacionDe('buenos-aires')?.aviso).toMatch(/no es un promedio/);
	});
});
