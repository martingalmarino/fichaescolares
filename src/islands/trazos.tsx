interface Trazo {
	grosor: number;
}

export const laminas = [
	{ id: 'escarapela', nombre: 'Escarapela' },
	{ id: 'bandera', nombre: 'Bandera' },
	{ id: 'sol', nombre: 'Sol de mayo' },
	{ id: 'cabildo', nombre: 'Cabildo' },
	{ id: 'casa-de-tucuman', nombre: 'Casa de Tucumán' },
	{ id: 'mapa', nombre: 'Recuadro para un mapa' },
] as const;

export type LaminaId = (typeof laminas)[number]['id'];

export function TrazoLamina({ id, grosor }: { id: LaminaId; grosor: number }) {
	if (id === 'escarapela') return <Escarapela grosor={grosor} />;
	if (id === 'bandera') return <Bandera grosor={grosor} />;
	if (id === 'sol') return <Sol grosor={grosor} />;
	if (id === 'cabildo') return <Cabildo grosor={grosor} />;
	if (id === 'casa-de-tucuman') return <Tucuman grosor={grosor} />;
	return <Mapa grosor={grosor} />;
}

function Escarapela({ grosor }: Trazo) {
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor}>
			<circle cx="80" cy="70" r="46" />
			<circle cx="80" cy="70" r="30" />
			<circle cx="80" cy="70" r="14" />
			<path d="M34 70h92M80 24v92" />
		</g>
	);
}

function Bandera({ grosor }: Trazo) {
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor} stroke-linejoin="round">
			<rect x="28" y="28" width="104" height="66" />
			<path d="M28 50h104M28 72h104" />
			<circle cx="80" cy="61" r="8" />
		</g>
	);
}

function Sol({ grosor }: Trazo) {
	const rayos = Array.from({ length: 16 }, (_, index) => {
		const angulo = (Math.PI * 2 * index) / 16;
		return `M${80 + Math.cos(angulo) * 16} ${70 + Math.sin(angulo) * 16} L${80 + Math.cos(angulo) * 34} ${70 + Math.sin(angulo) * 34}`;
	});
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor} stroke-linecap="round">
			<circle cx="80" cy="70" r="12" />
			{rayos.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
	);
}

function Cabildo({ grosor }: Trazo) {
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor} stroke-linejoin="round">
			<rect x="24" y="48" width="112" height="52" />
			<path d="M24 48 80 24l56 24" />
			{[40, 62, 84, 106].map((x) => (
				<path key={x} d={`M${x} 100 v-28 a10 10 0 0 1 20 0 v28`} />
			))}
		</g>
	);
}

function Tucuman({ grosor }: Trazo) {
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor} stroke-linejoin="round">
			<rect x="36" y="58" width="88" height="46" />
			<path d="M28 58h104L80 30z" />
			<rect x="70" y="74" width="16" height="30" />
			<path d="M48 78h12M100 78h12" />
		</g>
	);
}

function Mapa({ grosor }: Trazo) {
	return (
		<g fill="none" stroke="#1d3557" stroke-width={grosor} stroke-dasharray="3 2">
			<rect x="36" y="24" width="88" height="100" rx="8" />
		</g>
	);
}
