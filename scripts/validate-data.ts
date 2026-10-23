import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicarProvincias } from '../src/data/publicar-provincias.ts';
import { validarDatos } from '../src/data/schemas.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
function leer(nombre: string) {
	return JSON.parse(readFileSync(join(raiz, 'src/data', nombre), 'utf8'));
}

const allowDraft = process.argv.includes('--allow-draft');
const siluetas = new Set(Object.keys(leer('siluetas.json') as Record<string, string>));
const errores = validarDatos(leer('efemerides.json'), leer('proceres.json'), { allowDraft }, {
	frases: leer('frases.json'),
	provincias: publicarProvincias(leer('provincias.fuente.json'), siluetas),
	afiliados: leer('afiliados.json'),
	creditos: leer('creditos.json'),
	mapas: leer('mapas-ign.json'),
});

if (errores.length > 0) {
	console.error(errores.join('\n'));
	process.exit(1);
}

console.log(allowDraft ? 'Datos válidos (borradores permitidos).' : 'Datos válidos.');
