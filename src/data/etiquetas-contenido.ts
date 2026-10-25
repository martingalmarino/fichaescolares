export const pasosEtiquetas = [
	{ name: 'Escribí el nombre', text: 'Completá nombre y apellido. El grado, la escuela y el turno son opcionales.' },
	{ name: 'Elegí tamaño y diseño', text: 'Cuaderno, carpeta o útiles chicos. Si hace falta, tildá una materia por etiqueta.' },
	{ name: 'Imprimí la hoja', text: 'Usá Imprimir o Descargar PDF. Los datos no salen de tu compu.' },
] as const;

export const preguntasGenerales = [
	{
		q: '¿En qué papel conviene imprimirlas?',
		a: 'En papel autoadhesivo A4, o en hoja común y después cubiertas con contact. El autoadhesivo se despega y se pega en la tapa. La hoja común se recorta por la línea punteada y el contact la afirma y la protege del roce.',
	},
	{
		q: '¿Qué tamaño va en un cuaderno ABC?',
		a: 'El de cuaderno, de 9 × 5 cm. Entra en la tapa de un ABC y también en la de un Rivadavia si la pegás centrada, sin llegar al borde.',
	},
	{
		q: '¿Se guardan los datos de mi hijo?',
		a: 'No. Los datos no salen de tu compu: no hay cuenta ni servidor. Si marcás recordar, el navegador los deja solo en ese aparato, y el botón de borrar los elimina.',
	},
	{
		q: '¿Puedo hacer una por materia?',
		a: 'Sí. Tildá las materias y el generador arma una etiqueta por cada una, con el mismo nombre. En el tamaño de cuaderno entran hasta 10 por hoja.',
	},
	{
		q: '¿Cómo las protejo del agua?',
		a: 'Cubrilas con contact o con cinta adhesiva transparente. En lápices y fibras, la cinta evita que la etiqueta se despegue al sacarle punta o al lavarse las manos.',
	},
];

export const parrafosGenerales = [
	'La hoja es A4, con 10 mm de margen y líneas de corte punteadas. El tamaño de cuaderno mide 9 × 5 cm: dos columnas y cinco filas, diez etiquetas. El de carpeta mide 10 × 7 cm. En ese ancho, con el margen de la hoja, entra una sola columna y tres etiquetas. El de útiles mide 5 × 1,5 cm: tres columnas y dieciséis filas, 48 etiquetas para lápices, fibras, tijera y cartuchera.',
	'Para pegarlas sin engrudo, imprimí en papel autoadhesivo A4, el de hojas de etiquetas que se desprenden. Si usás hoja común, recortá por el punteado y pasá contact transparente por encima, con un margen de un par de milímetros hacia cada lado de la tapa. El contact también sirve encima del autoadhesivo cuando la mochila moja el cuaderno. En un lápiz, una vuelta de cinta adhesiva transparente deja el nombre legible y evita que el borde se levante.',
	'El renglón Rivadavia copia el margen rojo y las líneas azules del cuaderno de clase, para que la tapa se parezca al interior. La hoja cuadriculada es la de matemática, con cuadrícula de 5 mm. La guarda pampa es el borde geométrico de los tejidos, en negro sobre crudo, no un marco decorativo genérico. El pizarrón es verde, con letra clara: gasta más tinta, así que conviene reservarlo para una carpeta que se vea de lejos. La escarapela es celeste y blanca, dibujada en la etiqueta. El blanco y negro deja solo la letra y un filete: es el que menos tinta gasta si hay que marcar un curso entero.',
	'En un cuaderno ABC la tapa es un poco más chica que la de un Rivadavia de 48 hojas. Los 9 × 5 cm entran en las dos si la etiqueta queda centrada. En la carpeta, los 10 × 7 cm van en la cara o en el lomo, según el modelo: medí el lomo antes de imprimir una tanda. Si tildás varias materias, cada una sale una vez, con el mismo nombre, grado, escuela y turno. Matemática, Prácticas del Lenguaje, Ciencias Naturales, Ciencias Sociales, Inglés, Música, Plástica, Educación Física y Comunicados cubren la primaria. Destildá las que ese año no cursa.',
	'La imprenta mayúscula se lee de un vistazo en el aula. La cursiva usa Playwrite AR, la misma letra de la pauta de caligrafía, y la imprenta usa Andika. Las dos tienen licencia SIL Open Font License. Nada de lo que escribís viaja a un servidor. Recordar es opcional: el dato queda en el almacenamiento local de este navegador. Antes del inicio de clases, el calendario escolar muestra en qué semana conviene marcar los útiles de cada provincia.',
];

export const preguntasCuadernos = [
	{
		q: '¿Dónde se pega la etiqueta del cuaderno?',
		a: 'En el centro de la tapa, o en la franja superior si la tapa ya trae un recuadro. Dejá unos milímetros de margen para que el borde no se despegue al meter el cuaderno en la mochila.',
	},
	{
		q: '¿Qué materias lleva primaria?',
		a: 'En primaria suelen ir Matemática, Prácticas del Lenguaje, Ciencias Naturales, Ciencias Sociales e Inglés. Música, Plástica y Educación Física dependen del horario, y Comunicados sirve para la carpeta de notas.',
	},
	{
		q: '¿Sirve para cuaderno Rivadavia y ABC?',
		a: 'Sí. La etiqueta de 9 × 5 cm entra en la tapa de un Rivadavia y en la de un ABC. En el ABC, pegala centrada: la tapa es más chica y un borde que sobresale se engancha.',
	},
];

export const parrafosCuadernos = [
	'Esta página abre el generador en tamaño cuaderno y en modo una etiqueta por materia. Escribís el nombre una vez, tildás las materias y cada una sale con el mismo grado, la misma escuela y el mismo turno. En la hoja A4 entran diez etiquetas de 9 × 5 cm. Si tildás menos de diez, el resto de la hoja queda vacío, con la línea de corte, para que no imprimás copias de más.',
	'En la tapa de un Rivadavia, el lugar habitual es el centro o el recuadro que ya viene impreso. En un ABC, la tapa es más baja: los 9 × 5 cm entran si no los acercás al borde. Medí una tapa antes de imprimir para todo el curso. Si la etiqueta queda más ancha que el recuadro, achicá el diseño en la práctica pegándola y recortando el contact, no la letra.',
	'El papel autoadhesivo A4 se corta por el punteado y se pega directo. La hoja común pide tijera y contact. Pasá el contact de borde a borde de la tapa, no solo sobre la etiqueta: si el contact termina justo en el papel, el agua entra por esa línea. En carpetas de tela, el autoadhesivo agarra peor. Ahí conviene cinta de papel ancha o una etiqueta de tela, y usar esta hoja solo como guía del texto.',
	'El diseño de renglón Rivadavia muestra el margen rojo y las líneas azules, para que la tapa coincida con las hojas de adentro. La cuadriculada marca el cuaderno de matemática sin tener que escribir “Matemática” enorme. La guarda pampa y la escarapela distinguen materias cuando hay varios cuadernos del mismo color. El pizarrón se lee desde el banco de atrás, a costa de más tinta verde. Para un curso completo, el blanco y negro gasta menos y se fotocopia sin perder el celeste.',
	'Si el grupo todavía no lee cursiva, dejá la imprenta mayúscula. La cursiva escolar es la de la pauta de caligrafía del sitio, útil cuando el nombre ya se escribe así en el cuaderno. El grado puede ir como “3.º” o “sala de 5”. El turno evita mezclar la caja de la mañana con la de la tarde. El calendario escolar, en la página nacional, tiene el inicio de clases de cada provincia para marcar los cuadernos la semana anterior.',
];

export const preguntasUtiles = [
	{
		q: '¿Cómo marco los lápices para que no se despeguen?',
		a: 'Pegá la etiqueta a lo largo del lápiz y cubrila con una vuelta de cinta adhesiva transparente. La cinta toma la madera de los dos lados y el nombre sigue leyéndose.',
	},
	{
		q: '¿Cuántas entran por hoja?',
		a: 'Entran 48. Cada una mide 5 × 1,5 cm, en tres columnas y dieciséis filas, con líneas de corte punteadas en una hoja A4.',
	},
	{
		q: '¿Qué útiles conviene marcar en jardín?',
		a: 'El lápiz negro, las fibras, la tijera con punta redonda, el pote de pegamento y la cartuchera. En sala de 3 y de 4 alcanza el nombre de pila, en imprenta mayúscula.',
	},
];

export const parrafosUtiles = [
	'Esta página abre el generador en el tamaño chico: 5 × 1,5 cm, 48 etiquetas por hoja A4. En ese alto entra el nombre y no el resto de los datos. Sirve para lápices, fibras, crayones, la tijera y el frente de la cartuchera. Para el cuaderno o la carpeta, el tamaño de 9 × 5 cm o el de 10 × 7 cm dejan lugar al grado y a la materia.',
	'En un lápiz, pegá la tira a lo largo, no en vuelta cerrada: el papel se arruga y el nombre se parte. Después, una vuelta de cinta adhesiva transparente toma la madera de los dos costados. Sin esa cinta, el borde se levanta al sacarle punta o cuando el lápiz vuelve mojado del lavamanos. En una fibra, la misma cinta va sobre el cuerpo de plástico, lejos de la tapa, para poder destaparla.',
	'La tijera y el pegamento no aceptan bien el autoadhesivo sobre goma o sobre un pote con relieve. Ahí la cinta transparente hace de etiqueta: se pega el papel y la cinta lo sella. En la cartuchera, una etiqueta de 5 × 1,5 cm queda corta. Podés usar dos seguidas con el mismo nombre, o pasar al tamaño de cuaderno si la cartuchera tiene una cara lisa.',
	'Imprimí en autoadhesivo A4 y cortá por el punteado. Si la hoja es común, el contact en tiritas tan chicas es incómodo: conviene la cinta. No uses el diseño de pizarrón para 48 etiquetas si querés ahorrar tinta: el verde cubre toda la tira. El blanco y negro, la escarapela chica o el renglón alcanzan para reconocer el útil. La imprenta mayúscula se lee mejor que la cursiva en 1,5 cm de alto.',
	'En jardín, marcá lo que se comparte en la mesa: lápiz, fibras, tijera y pegamento. El nombre de pila suele alcanzar. En primaria, el apellido evita dos “Juan” en la misma caja. Los datos no salen de tu compu. Si recordás el nombre en este navegador, queda en el aparato hasta que lo borres. Para los cuadernos del mismo chico, la página de etiquetas para cuadernos reutiliza el nombre y arma una por materia.',
];
