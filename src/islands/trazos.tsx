interface Trazo {
	grosor: number;
}

export const laminas = [
	{ id: 'escarapela', nombre: 'Escarapela' },
	{ id: 'bandera', nombre: 'Bandera' },
	{ id: 'sol', nombre: 'Sol de mayo' },
	{ id: 'cabildo', nombre: 'Cabildo' },
	{ id: 'casa-de-tucuman', nombre: 'Casa de Tucumán' },
	{ id: 'mapa', nombre: 'Argentina' },
] as const;

export type LaminaId = (typeof laminas)[number]['id'];

export function TrazoLamina({ id, grosor }: { id: LaminaId; grosor: number }) {
	if (id === 'escarapela') return <Escarapela grosor={grosor} />;
	if (id === 'bandera') return <Bandera grosor={grosor} />;
	if (id === 'sol') return <Sol grosor={grosor} />;
	if (id === 'cabildo') return <Cabildo grosor={grosor} />;
	if (id === 'casa-de-tucuman') return <Tucuman grosor={grosor} />;
	return <Argentina grosor={grosor} />;
}

function trazo(grosor: number) {
	return {
		fill: 'none',
		stroke: '#1d3557',
		'stroke-width': grosor,
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round',
	} as const;
}

function Escarapela({ grosor }: Trazo) {
	const linea = trazo(grosor);
	return (
		<g {...linea}>
			<path d="M80 58 C62 58 48 46 40 34 C34 26 28 28 30 36 C34 52 52 64 70 66" />
			<path d="M80 58 C98 58 112 46 120 34 C126 26 132 28 130 36 C126 52 108 64 90 66" />
			<path d="M70 66 C58 78 46 96 42 112 C40 122 48 126 54 118 C62 104 72 86 78 74" />
			<path d="M90 66 C102 78 114 96 118 112 C120 122 112 126 106 118 C98 104 88 86 82 74" />
			<path d="M54 118 C48 128 58 136 70 128" />
			<path d="M106 118 C112 128 102 136 90 128" />
			<circle cx="80" cy="62" r="22" />
			<circle cx="80" cy="62" r="14" />
			<circle cx="80" cy="62" r="6" />
		</g>
	);
}

function Bandera({ grosor }: Trazo) {
	const linea = trazo(grosor);
	return (
		<g {...linea}>
			<line x1="34" y1="18" x2="34" y2="132" />
			<circle cx="34" cy="16" r="3.2" />
			<path d="M34 28 C70 24 110 32 132 28 L132 52 C110 56 70 48 34 52 Z" />
			<path d="M34 52 C70 48 110 56 132 52 L132 76 C110 80 70 72 34 76 Z" />
			<path d="M34 76 C70 72 110 80 132 76 L132 100 C110 104 70 96 34 100 Z" />
			<circle cx="82" cy="64" r="9" />
			<path d="M82 55 v4 M82 69 v4 M73 64 h4 M87 64 h4" />
		</g>
	);
}

function Sol({ grosor }: Trazo) {
	const linea = trazo(grosor);
	const rayos = Array.from({ length: 32 }, (_, index) => {
		const angulo = (Math.PI * 2 * index) / 32 - Math.PI / 2;
		const ondulado = index % 2 === 1;
		const c = Math.cos(angulo);
		const s = Math.sin(angulo);
		const px = -s;
		const py = c;
		const interno = 22;
		const externo = ondulado ? 46 : 54;
		const x1 = 80 + c * interno;
		const y1 = 74 + s * interno;
		const x4 = 80 + c * externo;
		const y4 = 74 + s * externo;
		if (!ondulado) return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x4.toFixed(1)} ${y4.toFixed(1)}`;
		const amp = 3.4;
		const x2 = 80 + c * 32 + px * amp;
		const y2 = 74 + s * 32 + py * amp;
		const x3 = 80 + c * 40 - px * amp;
		const y3 = 74 + s * 40 - py * amp;
		return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${x2.toFixed(1)} ${y2.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)} T${x4.toFixed(1)} ${y4.toFixed(1)}`;
	});
	return (
		<g {...linea}>
			<circle cx="80" cy="74" r="20" />
			<circle cx="73" cy="70" r="1.6" />
			<circle cx="87" cy="70" r="1.6" />
			<path d="M74 80 Q80 86 86 80" />
			{rayos.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
	);
}

function Cabildo({ grosor }: Trazo) {
	const linea = trazo(grosor);
	return (
		<g {...linea}>
			<path d="M18 118 h124" />
			<rect x="22" y="72" width="116" height="46" />
			<path d="M22 72 h116" />
			<path d="M48 72 V58 h64 V72" />
			<path d="M58 58 V46 h44 V58" />
			<path d="M70 46 V28 h20 V46" />
			<path d="M74 28 h12 l-6-10 z" />
			<circle cx="80" cy="36" r="4" />
			<path d="M76 40 h8" />
			{[34, 56, 78, 100, 122].map((x) => (
				<path key={x} d={`M${x - 8} 118 V96 a8 8 0 0 1 16 0 V118`} />
			))}
			<path d="M30 78 h10 M120 78 h10 M30 86 h10 M120 86 h10" />
			<path d="M48 64 h64" />
			{Array.from({ length: 9 }, (_, index) => (
				<line key={index} x1={52 + index * 7} y1="62" x2={52 + index * 7} y2="68" />
			))}
		</g>
	);
}

function Tucuman({ grosor }: Trazo) {
	const linea = trazo(grosor);
	return (
		<g {...linea}>
			<path d="M16 120 h128" />
			<path d="M24 120 V78 h112 V120" />
			<path d="M24 78 L80 42 L136 78" />
			<path d="M48 78 V58 h64 V78" />
			<path d="M70 58 V48 h20 V58" />
			<rect x="76" y="46" width="8" height="8" />
			<path d="M36 92 h16 v28 h-16 z M108 92 h16 v28 h-16 z" />
			<path d="M40 100 h8 M40 108 h8 M112 100 h8 M112 108 h8" />
			<path d="M68 120 V96 a12 12 0 0 1 24 0 V120" />
			<path d="M74 84 h12" />
			<circle cx="80" cy="88" r="1.4" />
			<path d="M28 78 h12 M120 78 h12" />
		</g>
	);
}

function Argentina({ grosor }: Trazo) {
	const linea = trazo(grosor);
	return (
		<g {...linea}>
			<path d="M86 14 L78 16 L74 22 L68 24 L64 30 L70 34 L66 40 L60 44 L64 50 L58 56 L54 66 L50 74 L48 86 L46 98 L44 110 L46 122 L50 132 L56 138 L60 134 L58 126 L62 118 L66 108 L70 98 L76 90 L84 84 L90 76 L96 68 L102 60 L108 52 L112 44 L106 38 L100 34 L104 28 L98 22 L92 18 Z" />
			<path d="M52 140 L58 138 L62 144 L56 146 Z" />
		</g>
	);
}
