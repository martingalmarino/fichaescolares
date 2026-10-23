import data from './provincias.json';

export interface Provincia {
	slug: string;
	nombre: string;
	capital: string | null;
	region: string | null;
	superficie: string | null;
	poblacion: string | null;
	simbolos: { flor: string | null; arbol: string | null; bandera: string | null; escudo: string | null };
	datos_para_investigar: string[];
	fuentes: string[];
	verificado: boolean;
}

export const provincias = data as Provincia[];
