export const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'] as const;

export interface FechaConmemorativa {
	dia: number;
	mes: number;
}

export function chipFecha(dia: number, mes: number): string {
	return `${dia} ${MESES_CORTOS[mes - 1] ?? ''}`;
}

/**
 * Próximas fechas conmemorativas a partir de un día.
 * El 17 de agosto, el 12 de octubre y el 20 de noviembre se cuentan en su día,
 * aunque el feriado nacional se traslade a otro.
 * Si la fecha es hoy, entra en la lista.
 */
export function proximasEfemerides<T extends FechaConmemorativa>(lista: T[], desde: Date, cantidad = 4): (T & { anio: number })[] {
	const mesHoy = desde.getMonth() + 1;
	const diaHoy = desde.getDate();
	const anioHoy = desde.getFullYear();

	return lista
		.map((item) => {
			const yaPaso = item.mes < mesHoy || (item.mes === mesHoy && item.dia < diaHoy);
			return { ...item, anio: yaPaso ? anioHoy + 1 : anioHoy };
		})
		.sort((a, b) => a.anio - b.anio || a.mes - b.mes || a.dia - b.dia)
		.slice(0, cantidad);
}
