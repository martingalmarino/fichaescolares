import { describe, expect, it } from 'vitest';
import { provincias } from './provincias';
import { calendarioVigente, erroresCalendario, vecinasDe } from './calendario-escolar';

describe('calendario escolar', () => {
	it('carga 2027 con CABA oficial y el resto a confirmar, sin fechas inventadas', () => {
		expect(calendarioVigente.anio).toBe(2027);
		expect(calendarioVigente.actualizado).toBe('2026-10-30');
		expect(Object.keys(calendarioVigente.jurisdicciones)).toHaveLength(24);
		expect(calendarioVigente.jurisdicciones.caba).toMatchObject({
			estado: 'oficial',
			inicio: '2027-03-01',
			invierno: { desde: '2027-07-19', hasta: '2027-07-30' },
			fin: '2027-12-17',
			fuente: 'https://buenosaires.gob.ar/noticias/ciclo-lectivo-2027-las-clases-en-la-ciudad-comenzaran-el-1-de-marzo-y-terminaran-el-17-de',
			inicioSecundario: '2027-03-03',
			vueltaDocentes: '2027-02-10',
			feriadosProvinciales: [],
			sinClases: [],
		});
		for (const provincia of provincias) {
			expect(vecinasDe(provincia.slug).length).toBeGreaterThan(0);
			if (provincia.slug === 'caba') continue;
			const jurisdiccion = calendarioVigente.jurisdicciones[provincia.slug];
			expect(jurisdiccion?.estado, provincia.slug).toBe('a-confirmar');
			expect(jurisdiccion?.inicio).toBeNull();
			expect(jurisdiccion?.fin).toBeNull();
			expect(jurisdiccion?.fuente).toBeNull();
			expect(jurisdiccion?.invierno).toEqual({ desde: null, hasta: null });
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
