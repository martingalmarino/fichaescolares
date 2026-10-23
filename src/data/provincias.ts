import fuente from './provincias.fuente.json';
import siluetas from './siluetas.json';
import { publicarProvincias, type Provincia } from './publicar-provincias';

export type { Provincia };

const disponibles = new Set(Object.keys(siluetas));

export const provincias = publicarProvincias(fuente, disponibles);
