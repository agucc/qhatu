// Los mercados de las Américas. El jugador elige su país al entrar (su mercado de casa)
// y con la experiencia que gana en los puestos consigue pasajes para viajar a los demás.
// Los textos van en [español, inglés, portugués].

import { idioma } from './i18n.js';

const banderas = {
  bo: '<rect width="30" height="20" fill="#007934"/><rect width="30" height="13.34" fill="#f9e300"/><rect width="30" height="6.67" fill="#d52b1e"/>',
  pe: '<rect width="30" height="20" fill="#d91023"/><rect x="10" width="10" height="20" fill="#fff"/>',
  mx: '<rect width="30" height="20" fill="#ce1126"/><rect width="20" height="20" fill="#fff"/><rect width="10" height="20" fill="#006847"/><circle cx="15" cy="10" r="2.6" fill="#8c5a2b"/><path d="M12.6 11.6q2.4 1.8 4.8 0" stroke="#006847" stroke-width=".8" fill="none"/>',
  co: '<rect width="30" height="20" fill="#ce1126"/><rect width="30" height="15" fill="#003893"/><rect width="30" height="10" fill="#fcd116"/>',
  ar: '<rect width="30" height="20" fill="#74acdf"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2.2" fill="#f6b40e"/>',
  br: '<rect width="30" height="20" fill="#009c3b"/><path d="M15 2.2L27.5 10 15 17.8 2.5 10z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.8 9.2q4.4-1.4 8.4 1.2" stroke="#fff" stroke-width=".8" fill="none"/>',
  us: `<rect width="30" height="20" fill="#fff"/>${[0, 2, 4, 6, 8, 10, 12].map((k) => `<rect y="${(k * 20) / 13}" width="30" height="${20 / 13}" fill="#b22234"/>`).join('')}<rect width="12" height="10.77" fill="#3c3b6e"/>${[1.5, 4, 6.5, 9].map((y) => [1.5, 4.5, 7.5, 10.5].map((x) => `<circle cx="${x}" cy="${y}" r=".6" fill="#fff"/>`).join('')).join('')}`,
};

export const PAISES = [
  {
    id: 'bo',
    nombre: ['Bolivia', 'Bolivia', 'Bolívia'],
    moneda: 'Bs',
    cocina: 'horno',
    comida: { puesto: ['La Salteñera', 'La Salteñera', 'La Salteñera'], plural: ['salteñas', 'salteñas', 'salteñas'], dibujo: 'saltena' },
    telar: {
      nombre: ['El Aguayo', 'El Aguayo', 'El Aguayo'],
      textura: 'aguayo',
      paleta: [['rosado', '#ef476f'], ['amarillo', '#ffb520'], ['turquesa', '#1fb5a5'], ['morado', '#9a48b8'], ['verde', '#a6d63a']],
    },
    sombreros: ['bombin', 'chullo'],
    dato: [
      'La yapa viene del quechua: es lo que el casero regala de más.',
      'Yapa comes from Quechua: the little extra the seller gives you.',
      'Yapa vem do quéchua: é o extra que o vendedor dá de presente.',
    ],
  },
  {
    id: 'pe',
    nombre: ['Perú', 'Peru', 'Peru'],
    moneda: 'S/',
    cocina: 'parrilla',
    comida: { puesto: ['La Anticuchería', 'The Anticucho Stand', 'A Anticucheria'], plural: ['anticuchos', 'anticuchos', 'anticuchos'], dibujo: 'anticucho' },
    telar: {
      nombre: ['La Manta', 'The Manta', 'A Manta'],
      textura: 'manta',
      paleta: [['rojo', '#d7263d'], ['naranja', '#f77f00'], ['rosado', '#e0457b'], ['verde', '#2a9d63'], ['azul', '#4a6cb3']],
    },
    sombreros: ['chullo', 'sombrero'],
    dato: [
      'El Perú cultiva miles de variedades de papa nativa.',
      'Peru grows thousands of native potato varieties.',
      'O Peru cultiva milhares de variedades de batata nativa.',
    ],
  },
  {
    id: 'mx',
    nombre: ['México', 'Mexico', 'México'],
    moneda: '$',
    cocina: 'parrilla',
    comida: { puesto: ['La Taquería', 'The Taquería', 'A Taqueria'], plural: ['tacos', 'tacos', 'tacos'], dibujo: 'taco' },
    telar: {
      nombre: ['El Sarape', 'The Sarape', 'O Sarape'],
      textura: 'sarape',
      paleta: [['rosado', '#ff3d7f'], ['naranja', '#ff8a00'], ['amarillo', '#ffd100'], ['turquesa', '#00b3a6'], ['morado', '#8a4bb5']],
    },
    sombreros: ['sombrero', 'gorra'],
    dato: ['En México a la yapa le dicen pilón.', 'In Mexico, yapa is called pilón.', 'No México, a yapa se chama pilón.'],
  },
  {
    id: 'co',
    nombre: ['Colombia', 'Colombia', 'Colômbia'],
    moneda: '$',
    cocina: 'parrilla',
    comida: { puesto: ['La Arepería', 'The Arepa Stand', 'A Arepería'], plural: ['arepas', 'arepas', 'arepas'], dibujo: 'arepa' },
    telar: {
      nombre: ['La Mochila', 'The Mochila', 'A Mochila'],
      textura: 'mochila',
      paleta: [['amarillo', '#f2c200'], ['rojo', '#d7263d'], ['verde', '#1b998b'], ['azul', '#2e86ab'], ['naranja', '#f77f00']],
    },
    sombreros: ['vueltiao', 'gorra'],
    dato: ['En Colombia a la yapa le dicen ñapa.', 'In Colombia, yapa is called ñapa.', 'Na Colômbia, a yapa se chama ñapa.'],
  },
  {
    id: 'ar',
    nombre: ['Argentina', 'Argentina', 'Argentina'],
    moneda: '$',
    cocina: 'horno',
    comida: { puesto: ['Las Empanadas', 'The Empanada Stand', 'As Empanadas'], plural: ['empanadas', 'empanadas', 'empanadas'], dibujo: 'empanada' },
    telar: {
      nombre: ['El Poncho', 'The Poncho', 'O Poncho'],
      textura: 'poncho',
      paleta: [['rojo', '#d0202f'], ['vino', '#93204a'], ['crema', '#f3e3c3'], ['celeste', '#74acdf'], ['cafe', '#a0632d']],
    },
    sombreros: ['boina', 'gorra'],
    dato: [
      'El mate se comparte: pasa de mano en mano en la ronda.',
      'Mate is shared: it goes hand to hand around the circle.',
      'O mate é compartilhado: passa de mão em mão na roda.',
    ],
  },
  {
    id: 'br',
    nombre: ['Brasil', 'Brazil', 'Brasil'],
    moneda: 'R$',
    cocina: 'horno',
    comida: { puesto: ['La Padaria', 'The Padaria', 'A Padaria'], plural: ['panes de queso', 'cheese breads', 'pães de queijo'], dibujo: 'paodequeijo' },
    telar: {
      nombre: ['La Chita', 'The Chita', 'A Chita'],
      textura: 'chita',
      paleta: [['rojo', '#e63946'], ['amarillo', '#ffbe0b'], ['azul', '#3a86ff'], ['verde', '#2a9d8f'], ['rosado', '#ff70a6']],
    },
    sombreros: ['gorra', 'sombrero'],
    dato: ['El pão de queijo nació en Minas Gerais.', 'Pão de queijo was born in Minas Gerais.', 'O pão de queijo nasceu em Minas Gerais.'],
  },
  {
    id: 'us',
    nombre: ['Estados Unidos', 'United States', 'Estados Unidos'],
    moneda: 'US$',
    cocina: 'parrilla',
    comida: { puesto: ['El Puesto de Hot Dogs', 'The Hot Dog Stand', 'A Barraca de Cachorro-Quente'], plural: ['hot dogs', 'hot dogs', 'cachorros-quentes'], dibujo: 'hotdog' },
    telar: {
      nombre: ['El Quilt', 'The Quilt', 'A Colcha de Retalhos'],
      textura: 'quilt',
      paleta: [['rojo', '#c0392b'], ['azul', '#3657a8'], ['crema', '#f2e6c9'], ['amarillo', '#e1a730'], ['verde', '#7fa37b']],
    },
    sombreros: ['gorra', 'gorro'],
    dato: [
      'En Luisiana a la yapa le dicen lagniappe, una palabra que viene de la yapa andina.',
      'In Louisiana, yapa is called lagniappe, a word that comes from the Andean yapa.',
      'Na Luisiana, a yapa se chama lagniappe, palavra que vem da yapa andina.',
    ],
  },
];

/** Nombres de los colores de hilo, en femenino porque se habla de franjas. */
export const NOMBRES_COLORES = {
  rojo: ['roja', 'red', 'vermelha'],
  naranja: ['naranja', 'orange', 'laranja'],
  amarillo: ['amarilla', 'yellow', 'amarela'],
  verde: ['verde', 'green', 'verde'],
  turquesa: ['turquesa', 'teal', 'turquesa'],
  azul: ['azul', 'blue', 'azul'],
  morado: ['morada', 'purple', 'roxa'],
  rosado: ['rosada', 'pink', 'rosa'],
  crema: ['color crema', 'cream', 'creme'],
  cafe: ['café', 'brown', 'marrom'],
  vino: ['color vino', 'burgundy', 'vinho'],
  celeste: ['celeste', 'light blue', 'azul-clara'],
};

const INDICE = { es: 0, en: 1, pt: 2 };

/** Elige el texto del idioma actual en un trío [es, en, pt]. */
export function texto(trio) {
  if (!Array.isArray(trio)) return trio ?? '';
  return trio[INDICE[idioma()] ?? 0] ?? trio[0];
}

export function pais(id) {
  return PAISES.find((p) => p.id === id) || PAISES[0];
}

export function bandera(id, alto = 20) {
  return `<svg class="bandera" viewBox="0 0 30 20" height="${alto}" width="${(alto * 3) / 2}" aria-hidden="true">${banderas[id] || banderas.bo}</svg>`;
}

// ---------- Pasaporte (funciones puras sobre el estado guardado) ----------

/** Experiencia total que hace falta para cada pasaje nuevo. */
export const PASAJES = [10, 30, 60, 100, 150, 210];

export function xpTotal(estado) {
  return Object.values(estado.puestos || {}).reduce((suma, p) => suma + (p.xp || 0), 0);
}

export function paisesAbiertos(estado) {
  return estado.paises?.length ? estado.paises : [estado.pais || 'bo'];
}

export function paisActual(estado) {
  return estado.paisActual || estado.pais || 'bo';
}

export function pasajesGanados(xp) {
  return PASAJES.filter((u) => xp >= u).length;
}

/** Pasajes que el jugador puede usar ahora para viajar a un país nuevo. */
export function pasajesLibres(estado) {
  return Math.max(0, pasajesGanados(xpTotal(estado)) - (paisesAbiertos(estado).length - 1));
}

/** Experiencia del próximo pasaje, o null si ya se ganaron todos. */
export function proximoPasaje(estado) {
  const xp = xpTotal(estado);
  return PASAJES.find((u) => u > xp) ?? null;
}

/** Primer país: el mercado de casa. */
export function elegirPaisInicial(estado, id) {
  estado.pais = id;
  estado.paisActual = id;
  if (!estado.paises?.includes(id)) estado.paises = [id, ...(estado.paises || []).filter((p) => p !== id)];
}

/** Usa un pasaje para abrir un país nuevo y viajar a él. Devuelve true si se pudo. */
export function viajar(estado, id) {
  if (!PAISES.some((p) => p.id === id)) return false;
  const abiertos = paisesAbiertos(estado);
  if (abiertos.includes(id)) {
    estado.paisActual = id;
    return true;
  }
  if (pasajesLibres(estado) <= 0) return false;
  estado.paises = [...abiertos, id];
  estado.paisActual = id;
  return true;
}

/** Ir a un país ya abierto. */
export function irA(estado, id) {
  if (!paisesAbiertos(estado).includes(id)) return false;
  estado.paisActual = id;
  return true;
}
