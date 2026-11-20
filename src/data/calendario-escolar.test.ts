import { describe, expect, it } from 'vitest';
import { provincias } from './provincias';
import { calendarioVigente, erroresCalendario, vecinasDe } from './calendario-escolar';

describe('calendario escolar', () => {
	it('carga 2027 con CABA y Córdoba oficiales y el resto a confirmar, sin fechas inventadas', () => {
		expect(calendarioVigente.anio).toBe(2027);
		expect(calendarioVigente.actualizado).toBe('2026-11-20');
		expect(calendarioVigente.cfeInvierno).toBeNull();
		expect(Object.keys(calendarioVigente.jurisdicciones)).toHaveLength(24);
		expect(calendarioVigente.jurisdicciones.caba).toMatchObject({
			estado: 'oficial',
			inicio: '2027-03-01',
			invierno: { desde: '2027-07-19', hasta: '2027-07-30' },
			fin: '2027-12-17',
			fuente: 'https://buenosaires.gob.ar/noticias/ciclo-lectivo-2027-las-clases-en-la-ciudad-comenzaran-el-1-de-marzo-y-terminaran-el-17-de',
			inicioSecundario: '2027-03-03',
			vueltaDocentes: '2027-02-10',
			actualizado: '2026-10-30',
			feriadosProvinciales: [],
			sinClases: [],
		});
		expect(calendarioVigente.jurisdicciones.cordoba).toMatchObject({
			estado: 'oficial',
			inicio: '2027-03-01',
			invierno: { desde: '2027-07-12', hasta: '2027-07-23' },
			fin: '2027-12-17',
			fuente: 'https://boletinoficial.cba.gov.ar/wp-content/4p96humuzp/2026/11/1_Secc_201126.pdf',
			notas:
				'Docentes y directivos se reincorporan el 15/2; Formación Situada 16–18/2; exámenes previos y libres 22–24/2; ambientación 25–26/2; fin de la primera etapa 8/7; mínimo 190 días de clases.',
			vueltaDocentes: '2027-02-15',
			actualizado: '2026-11-20',
			feriadosProvinciales: [],
			sinClases: [],
		});
		for (const provincia of provincias) {
			expect(vecinasDe(provincia.slug).length).toBeGreaterThan(0);
			if (provincia.slug === 'caba' || provincia.slug === 'cordoba') continue;
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
		copia.jurisdicciones.mendoza!.estado = 'oficial';
		expect(erroresCalendario(copia, slugs).some((error) => error.includes('mendoza'))).toBe(true);
		copia.jurisdicciones.mendoza = {
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
