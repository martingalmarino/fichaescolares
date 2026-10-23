/** Mayúsculas, sin tildes salvo la Ñ, y sin espacios ni signos. */
export function normalizeWord(input: string): string {
	const upper = input.toLocaleUpperCase('es-AR');
	let word = '';

	for (const char of upper) {
		if (char === 'Ñ') {
			word += 'Ñ';
			continue;
		}

		const base = char.normalize('NFD').replace(/\p{M}/gu, '');
		word += base;
	}

	return word.replace(/[^A-ZÑ]/g, '');
}
