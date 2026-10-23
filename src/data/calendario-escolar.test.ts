import { describe, expect, it } from 'vitest';
import { provincias } from './provincias';
import { calendarioVigente, erroresCalendario, vecinasDe } from './calendario-escolar';

describe('calendario escolar', () => {
	it('arranca 2027 con las 24 jurisdicciones a confirmar y sin fechas inventadas', () => {
		expect(calendarioVigente.anio).toBe(2027);
		expect(calendarioVigente.actualizado).toBe('2026-10-23');
		expect(Object.keys(calendarioVigente.jurisdicciones)).toHaveLength(24);
		for (const provincia of provincias) {
			const jurisdiccion = calendarioVigente.jurisdicciones[provincia.slug];
			expect(jurisdiccion?.estado, provincia.slug).toBe('a-confirmar');
			expect(jurisdiccion?.inicio).toBeNull();
			expect(jurisdiccion?.fin).toBeNull();
			expect(jurisdiccion?.fuente).toBeNull();
			expect(jurisdiccion?.invierno).toEqual({ desde: null, hasta: null });
			expect(vecinasDe(provincia.slug).length).toBeGreaterThan(0);
		}
	});

	it('rechaza un oficial sin fuente y una jurisdicción de más', () => {
		const slugs = provincias.map((provincia) => provincia.slug);
		const copia = structuredClone(calendarioVigente);
		copia.jurisdicciones.cordoba!.estado = 'oficial';
		expect(erroresCalendario(copia, slugs).some((error) => error.includes('cordoba'))).toBe(true);
		copia.jurisdicciones.cordoba = {
			estado: 'oficial',
			inicio: '2027-03-01',
			invierno: { desde: '2027-07-12', hasta: '2027-07-23' },
			fin: '2027-12-10',
			fuente: 'https://www.argentina.gob.ar/',
			notas: null,
			feriadosProvinciales: [],
			sinClases: [],
		};
		expect(erroresCalendario(copia, slugs)).toEqual([]);
		copia.jurisdicciones.inventada = copia.jurisdicciones.cordoba;
		expect(erroresCalendario(copia, slugs).some((error) => error.includes('inventada'))).toBe(true);
	});
});
