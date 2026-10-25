import { useMemo, useState } from 'preact/hooks';
import { calificacionDe, jurisdiccionesCalificacion, type JurisdiccionCalificacion } from '../data/calificacion-primaria';
import { evaluarNotas } from '../lib/promedio-primaria';

const grupos: { id: JurisdiccionCalificacion['modo']; titulo: string }[] = [
	{ id: 'numero', titulo: 'Con nota numérica' },
	{ id: 'conceptual', titulo: 'Escala conceptual' },
	{ id: 'sin-datos', titulo: 'Sin datos oficiales publicados' },
];

export default function CalculadoraPromedio() {
	const inicial = calificacionDe('mendoza')?.slug ?? jurisdiccionesCalificacion[0]?.slug ?? '';
	const [slug, setSlug] = useState(inicial);
	const [notas, setNotas] = useState(['', '', '']);
	const jurisdiccion = useMemo(() => calificacionDe(slug), [slug]);

	function cambiarNota(indice: number, valor: string) {
		setNotas((actual) => actual.map((nota, i) => (i === indice ? valor : nota)));
	}

	const hayNotas = notas.some((nota) => nota.trim());
	const evaluacion = jurisdiccion?.modo === 'numero' && hayNotas ? evaluarNotas(jurisdiccion, notas) : null;

	return (
		<div class="rounded-card border border-borde bg-white p-4 shadow-card sm:p-6">
			<label class="block text-sm font-medium text-azul" for="provincia-promedio">
				Provincia
			</label>
			<select
				id="provincia-promedio"
				class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
				value={slug}
				onChange={(event) => setSlug(event.currentTarget.value)}
			>
				{grupos.map((grupo) => (
					<optgroup key={grupo.id} label={grupo.titulo}>
						{jurisdiccionesCalificacion
							.filter((item) => item.modo === grupo.id)
							.map((item) => (
								<option key={item.slug} value={item.slug}>
									{item.nombre}
									{item.slug === 'buenos-aires' ? ' (desde 4.º)' : ''}
								</option>
							))}
					</optgroup>
				))}
			</select>

			{jurisdiccion?.aviso && <p class="mt-4 rounded-control bg-sol-50 px-3 py-3 text-sm leading-relaxed text-azul">{jurisdiccion.aviso}</p>}

			{jurisdiccion?.modo === 'numero' && (
				<>
					<fieldset class="mt-4">
						<legend class="text-sm font-medium text-azul">Notas</legend>
						<p class="mt-1 text-sm text-muted">
							Escala de {jurisdiccion.min} a {jurisdiccion.max}. Se aprueba con {jurisdiccion.aprueba}.
							{jurisdiccion.truncar ? ' El promedio se muestra con dos decimales, sin redondear.' : ''}
							{jurisdiccion.detalle ? ` ${jurisdiccion.detalle}` : ''}
						</p>
						<div class="mt-3 grid gap-2 sm:grid-cols-3">
							{notas.map((nota, indice) => (
								<label key={indice} class="block text-sm">
									<span class="text-muted">Nota {indice + 1}</span>
									<input
										class="mt-1 w-full rounded-control border border-borde px-3 py-2"
										inputMode="decimal"
										value={nota}
										onInput={(event) => cambiarNota(indice, event.currentTarget.value)}
									/>
								</label>
							))}
						</div>
						<button type="button" class="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-azul underline" onClick={() => setNotas((actual) => [...actual, ''])}>
							Agregar nota
						</button>
					</fieldset>
					{evaluacion?.error && <p class="mt-4 text-sm text-azul">{evaluacion.error}</p>}
					{evaluacion?.resultado && (
						<div class="mt-4 rounded-control border border-borde p-4">
							<p class="text-sm text-muted">Promedio</p>
							<p class="text-3xl font-bold text-azul">{evaluacion.resultado.promedio}</p>
							<p class={`mt-2 text-sm font-semibold ${evaluacion.resultado.aprueba ? 'text-azul' : 'text-azul'}`}>
								{evaluacion.resultado.aprueba ? `Aprueba: llega a ${jurisdiccion.aprueba}.` : `No aprueba: no llega a ${jurisdiccion.aprueba}.`}
							</p>
							{jurisdiccion.detalle && <p class="mt-2 text-sm leading-relaxed text-muted">{jurisdiccion.detalle}</p>}
						</div>
					)}
				</>
			)}

			{jurisdiccion?.modo === 'conceptual' && (
				<div class="mt-4 text-sm leading-relaxed">
					<p class="font-semibold text-azul">Esta escala no se promedia acá.</p>
					<p class="mt-2">1.º ciclo: {jurisdiccion.ciclo1}</p>
					<p class="mt-2">2.º ciclo: {jurisdiccion.ciclo2}</p>
					<p class="mt-2">Aprueba con: {jurisdiccion.aprueba}</p>
					{jurisdiccion.detalle && <p class="mt-2">{jurisdiccion.detalle}</p>}
					<p class="mt-2 text-muted">Fuente: {jurisdiccion.norma}</p>
				</div>
			)}

			{jurisdiccion?.modo === 'sin-datos' && (
				<p class="mt-4 text-sm leading-relaxed text-azul">Sin datos oficiales publicados para {jurisdiccion.nombre}. Esta ficha no completa la escala ni la nota de aprobación.</p>
			)}
		</div>
	);
}
