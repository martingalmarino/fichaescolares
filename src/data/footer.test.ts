import { describe, expect, it } from 'vitest';
import { columnas, legales, proximasFooter } from './footer';

describe('pie', () => {
	it('enlaza hubs y no manda a herramientas que no existen', () => {
		const hrefs = [...columnas.flatMap((columna) => columna.links.map((enlace) => enlace.href)), ...legales.map((enlace) => enlace.href), ...proximasFooter.map((fecha) => fecha.href)];
		expect(hrefs.some((href) => /diploma|sorteador/.test(href))).toBe(false);
		expect(hrefs).toContain('/etiquetas-escolares/');
		expect(hrefs).toContain('/mapas/');
		expect(hrefs).toContain('/calendario-escolar-2027/');
		expect(hrefs.some((href) => href.startsWith('/provincias/'))).toBe(false);
		expect(proximasFooter).toHaveLength(6);
		expect(columnas).toHaveLength(4);
	});
});
