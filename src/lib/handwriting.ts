export type Pauta = 'grande' | 'media' | 'chica';
export type ModoCaligrafia = 'calcar' | 'copiar' | 'mixto';
export type TipoPauta = 'simple' | 'doble';

export function altoDeX(pauta: Pauta): number {
	if (pauta === 'grande') return 34;
	if (pauta === 'chica') return 16;
	return 24;
}

/** La pauta simple marca base y media. La doble suma ascendentes y descendentes. */
export function lineasDePauta(tipo: TipoPauta, x: number): number[] {
	if (tipo === 'simple') return [x, x * 2];
	return [x * 0.5, x * 1.5, x * 2.5, x * 3.5];
}

export function altoDeRenglon(tipo: TipoPauta, x: number): number {
	return (tipo === 'simple' ? x * 2 : x * 4) + 10;
}

/** Achica el trazo para que la frase entre en el renglón sin cortarse. */
export function tamanoDeTrazo(frase: string, x: number, cursiva: boolean, disponible: number): number {
	const ideal = x * 1.05;
	const caracteres = Math.max([...frase].length, 1);
	const factor = cursiva ? 0.75 : 0.55;
	if (disponible <= 0) return Math.min(ideal, 8);
	const cabe = disponible / (caracteres * factor);
	return Math.min(ideal, cabe);
}

export function muestraTexto(modo: ModoCaligrafia, renglon: number): boolean {
	if (modo === 'calcar') return true;
	if (modo === 'copiar') return false;
	return renglon % 2 === 0;
}
