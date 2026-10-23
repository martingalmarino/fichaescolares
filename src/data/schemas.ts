import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const procerSchema = z
	.object({
		slug,
		nombre: z.string().min(3),
		nacimiento: fecha.nullable(),
		fallecimiento: fecha.nullable(),
		pistas: z.array(z.string().min(12)).min(3).max(5),
		palabras: z.array(z.string().min(3)).min(3),
		fuentes: z.array(z.string().url()).min(1),
		verificado: z.boolean(),
	})
	.superRefine((item, contexto) => {
		if (item.pistas.length !== item.palabras.length) {
			contexto.addIssue({
				code: 'custom',
				path: ['palabras'],
				message: 'cada pista tiene que tener su palabra, en el mismo orden',
			});
		}
	});

export const efemerideSchema = z
	.object({
		slug,
		dia: z.number().int().min(1).max(31),
		mes: z.number().int().min(1).max(12),
		nombre: z.string().min(3),
		titulo: z.string().min(3),
		tema: z.string().min(3),
		linea: z.string().min(10).max(160),
		resumen: z.string().min(80),
		vocabulario: z.array(z.string().min(2)).min(6),
		proceres: z.array(slug),
		laminas: z.array(slug),
		fuentes: z.array(z.string().url()).min(1),
		verificado: z.boolean(),
	})
	.superRefine((item, contexto) => {
		const ultimo = new Date(2024, item.mes, 0).getDate();
		if (item.dia > ultimo) {
			contexto.addIssue({
				code: 'custom',
				path: ['dia'],
				message: `el mes ${item.mes} no tiene día ${item.dia}`,
			});
		}
	});

export const proceresSchema = z.array(procerSchema).min(1);
export const efemeridesSchema = z.array(efemerideSchema).min(1);

export const fraseSchema = z.object({
	id: slug,
	texto: z.string().min(8),
	origen: z.string().min(8),
});

export const provinciaSchema = z.object({
	slug,
	nombre: z.string().min(3),
	capital: z.string().min(3).nullable(),
	region: z.string().min(3).nullable(),
	superficie: z.string().min(2).nullable(),
	poblacion: z.string().min(2).nullable(),
	simbolos: z.object({
		flor: z.string().nullable(),
		arbol: z.string().nullable(),
		bandera: z.string().nullable(),
		escudo: z.string().nullable(),
	}),
	datos_para_investigar: z.array(z.string().min(10)).min(2),
	fuentes: z.array(z.string().url()).min(1),
	verificado: z.boolean(),
});

export const afiliadoSchema = z.object({
	id: slug,
	nombre: z.string().min(3),
	detalle: z.string().min(3),
	url: z.string().url().or(z.literal('')),
});

export const creditoSchema = z.object({
	nombre: z.string().min(2),
	autor: z.string().min(2),
	licencia: z.string().min(2),
	enlace: z.string().url(),
	archivo: z.string().min(2),
});

export const frasesSchema = z.array(fraseSchema).min(1);
export const provinciasSchema = z.array(provinciaSchema);
export const afiliadosSchema = z.array(afiliadoSchema);
export const creditosSchema = z.array(creditoSchema).min(1);

export interface OpcionesValidacion {
	allowDraft: boolean;
}

function mensajes(archivo: string, error: z.ZodError): string[] {
	return error.issues.map((issue) => `${archivo}: ${issue.path.join('.') || '(raíz)'} — ${issue.message}`);
}

function slugsRepetidos(slugs: string[], archivo: string): string[] {
	const vistos = new Set<string>();
	const errores: string[] = [];
	for (const item of slugs) {
		if (vistos.has(item)) errores.push(`${archivo}: slug repetido «${item}»`);
		vistos.add(item);
	}
	return errores;
}

export interface DatosExtra {
	frases: unknown;
	provincias: unknown;
	afiliados: unknown;
	creditos: unknown;
}

export function validarDatos(
	efemerides: unknown,
	proceres: unknown,
	opciones: OpcionesValidacion,
	extras?: DatosExtra,
): string[] {
	const errores: string[] = [];
	const efemeridesParseadas = efemeridesSchema.safeParse(efemerides);
	const proceresParseados = proceresSchema.safeParse(proceres);

	if (!efemeridesParseadas.success) errores.push(...mensajes('efemerides.json', efemeridesParseadas.error));
	if (!proceresParseados.success) errores.push(...mensajes('proceres.json', proceresParseados.error));
	if (!efemeridesParseadas.success || !proceresParseados.success) return errores;

	errores.push(...slugsRepetidos(efemeridesParseadas.data.map((item) => item.slug), 'efemerides.json'));
	errores.push(...slugsRepetidos(proceresParseados.data.map((item) => item.slug), 'proceres.json'));

	const slugs = new Set(proceresParseados.data.map((item) => item.slug));
	for (const fecha of efemeridesParseadas.data) {
		for (const procer of fecha.proceres) {
			if (!slugs.has(procer)) {
				errores.push(`efemerides.json: ${fecha.slug} cita al prócer «${procer}», que no está en proceres.json`);
			}
		}
	}

	if (extras) {
		const frasesParseadas = frasesSchema.safeParse(extras.frases);
		const provinciasParseadas = provinciasSchema.safeParse(extras.provincias);
		const afiliadosParseados = afiliadosSchema.safeParse(extras.afiliados);
		const creditosParseados = creditosSchema.safeParse(extras.creditos);
		if (!frasesParseadas.success) errores.push(...mensajes('frases.json', frasesParseadas.error));
		if (!provinciasParseadas.success) errores.push(...mensajes('provincias.json', provinciasParseadas.error));
		if (!afiliadosParseados.success) errores.push(...mensajes('afiliados.json', afiliadosParseados.error));
		if (!creditosParseados.success) errores.push(...mensajes('creditos.json', creditosParseados.error));
		if (provinciasParseadas.success) {
			errores.push(...slugsRepetidos(provinciasParseadas.data.map((item) => item.slug), 'provincias.json'));
			if (!opciones.allowDraft) {
				for (const provincia of provinciasParseadas.data) {
					if (!provincia.verificado) {
						errores.push(`${provincia.slug} está sin verificar. Usá --allow-draft para un build de borrador.`);
					}
				}
			}
		}
	}

	if (!opciones.allowDraft) {
		for (const fecha of efemeridesParseadas.data) {
			if (!fecha.verificado) {
				errores.push(`${fecha.slug} está sin verificar. Usá --allow-draft para un build de borrador.`);
			}
		}
		for (const procer of proceresParseados.data) {
			if (!procer.verificado) {
				errores.push(`${procer.slug} está sin verificar. Usá --allow-draft para un build de borrador.`);
			}
		}
	}

	return errores;
}
