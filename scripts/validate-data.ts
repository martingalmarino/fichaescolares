import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarDatos } from '../src/data/schemas.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
function leer(nombre: string) {
	return JSON.parse(readFileSync(join(raiz, 'src/data', nombre), 'utf8'));
}

const allowDraft = process.argv.includes('--allow-draft');
const errores = validarDatos(leer('efemerides.json'), leer('proceres.json'), { allowDraft }, {
	frases: leer('frases.json'),
	provincias: leer('provincias.json'),
	afiliados: leer('afiliados.json'),
	creditos: leer('creditos.json'),
});

if (errores.length > 0) {
	console.error(errores.join('\n'));
	process.exit(1);
}

console.log(allowDraft ? 'Datos válidos (borradores permitidos).' : 'Datos válidos.');
