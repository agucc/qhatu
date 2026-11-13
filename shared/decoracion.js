// Decoración del mercado: fondos, toldos y vasos. Se compra con yapa y no cambia el juego.

import { obtener, guardar, gastarYapa } from './almacen.js';
import { paisActual, pais as datosPais } from './paises.js';

// Cada fondo y toldo con `pais` es de ese país: solo se ve y se compra estando allí.
// Los que no tienen `pais` (Noche, Mercado y Carnaval) son de todos.
const fondo = (id, pais, noche, puesto, puesto2, borde) => ({ id, pais, precio: 150, vars: { '--noche': noche, '--puesto': puesto, '--puesto-2': puesto2, '--borde': borde } });

export const FONDOS = [
  { id: 'noche', precio: 0, vars: { '--noche': '#17131f', '--puesto': '#221c2d', '--puesto-2': '#2c2539', '--borde': '#3d3450' } },
  fondo('lago', 'bo', '#0f1b2d', '#17273d', '#1f3350', '#2f4a6e'),
  fondo('cerro', 'bo', '#24130f', '#331c16', '#42261e', '#5e382c'),
  fondo('yungas', 'bo', '#0f1f1a', '#172d26', '#1f3b32', '#2f5547'),
  fondo('valle', 'pe', '#10201a', '#183026', '#203c30', '#2f5a46'),
  fondo('colca', 'pe', '#221812', '#30221a', '#3c2b21', '#5a4030'),
  fondo('paracas', 'pe', '#0e1a26', '#152738', '#1c3247', '#2a4a68'),
  fondo('cenote', 'mx', '#0c1f22', '#133035', '#193c42', '#265a62'),
  fondo('cobre', 'mx', '#26150f', '#351e15', '#42271c', '#60392a'),
  fondo('xochimilco', 'mx', '#1d1328', '#2a1c3a', '#352347', '#4d3466'),
  fondo('canocristales', 'co', '#26101a', '#361725', '#431d2e', '#622b44'),
  fondo('cocora', 'co', '#0f1f16', '#172e21', '#1e3a2a', '#2c573f'),
  fondo('cartagena', 'co', '#241a10', '#342618', '#41301f', '#604730'),
  fondo('glaciar', 'ar', '#0f1a24', '#172838', '#1e3346', '#2e4d6a'),
  fondo('humahuaca', 'ar', '#22141c', '#311d29', '#3d2533', '#5a374c'),
  fondo('iguazu', 'ar', '#0e1d1e', '#152c2d', '#1b3839', '#285455'),
  fondo('amazonia', 'br', '#0d1e14', '#142d1e', '#1a3926', '#275539'),
  fondo('lencois', 'br', '#13202a', '#1c2f3d', '#233b4c', '#35586f'),
  fondo('pantanal', 'br', '#1b1e10', '#282c18', '#33381f', '#4c532e'),
  fondo('grancanon', 'us', '#261410', '#361d17', '#43251d', '#63372b'),
  fondo('smoky', 'us', '#141a24', '#1e2735', '#263142', '#384862'),
  fondo('everglades', 'us', '#121e17', '#1b2d22', '#22392b', '#335541'),
];

export const TOLDOS = [
  { id: 'mercado', precio: 0, colores: ['#ef476f', '#ffb520', '#1fb5a5', '#9a48b8', '#a6d63a', '#ffb520'] },
  { id: 'carnaval', precio: 100, colores: ['#ff5d8f', '#ffd23f', '#3bceac', '#7b2cbf', '#ff7b00', '#0ead69'] },
  { id: 'salar', pais: 'bo', precio: 100, colores: ['#f3ead2', '#8ecae6', '#f3ead2', '#219ebc', '#f3ead2', '#8ecae6'] },
  // La kantuta, flor de los Andes: pétalos rojos, garganta amarilla y hojas verdes.
  { id: 'kantuta', pais: 'bo', precio: 100, colores: ['#c8102e', '#ffd23f', '#e4572e', '#2e8b57', '#c8102e', '#ffd23f'] },
  { id: 'pallay', pais: 'pe', precio: 100, colores: ['#c8102e', '#f7f1e3', '#e4572e', '#1b6e5a', '#c8102e', '#f2b705'] },
  { id: 'papelpicado', pais: 'mx', precio: 100, colores: ['#e5007e', '#00a3e0', '#ffcd00', '#7ac143', '#f26522', '#8e44ad'] },
  { id: 'silleteros', pais: 'co', precio: 100, colores: ['#ff6f91', '#ffc75f', '#f9f871', '#ff9671', '#d65db1', '#00c9a7'] },
  { id: 'celesteblanco', pais: 'ar', precio: 100, colores: ['#74acdf', '#ffffff', '#74acdf', '#ffffff', '#74acdf', '#f6b40e'] },
  { id: 'bandeirinhas', pais: 'br', precio: 100, colores: ['#e63946', '#ffbe0b', '#3a86ff', '#2a9d8f', '#ff70a6', '#fb5607'] },
  { id: 'diner', pais: 'us', precio: 100, colores: ['#d62828', '#f1faee', '#2a9d8f', '#f1faee', '#d62828', '#f1faee'] },
];

export const VASOS = [
  { id: 'redondo', precio: 0 },
  { id: 'recto', precio: 80 },
  { id: 'copa', precio: 80 },
];

export const GRUPOS = { fondo: FONDOS, toldo: TOLDOS, vaso: VASOS };

function estado() {
  const e = obtener();
  e.decoracion ??= {};
  e.decoracion.fondo ??= 'noche';
  e.decoracion.toldo ??= 'mercado';
  e.decoracion.vaso ??= 'redondo';
  e.decoracion.mios ??= [];
  // El toldo "wiphala" ya no existe: quien lo tenía recibe la kantuta.
  if (e.decoracion.toldo === 'wiphala') e.decoracion.toldo = 'kantuta';
  e.decoracion.mios = e.decoracion.mios.map((m) => (m === 'toldo:wiphala' ? 'toldo:kantuta' : m));
  return e.decoracion;
}

export function enUso(grupo) {
  return estado()[grupo];
}

/** Lo que se ve en la tienda: lo de todos los países más lo del país donde está el jugador. */
export function disponibles(grupo, pais = paisActual(obtener())) {
  return GRUPOS[grupo].filter((x) => !x.pais || x.pais === pais);
}

/** Lo que se ve de verdad: si lo elegido es de otro país, se usa lo básico (sin perder la compra). */
function visible(grupo) {
  const lista = GRUPOS[grupo];
  const item = lista.find((x) => x.id === enUso(grupo)) || lista[0];
  return item.pais && item.pais !== paisActual(obtener()) ? lista[0] : item;
}

export function esMio(grupo, id) {
  const item = GRUPOS[grupo].find((x) => x.id === id);
  return Boolean(item) && (item.precio === 0 || estado().mios.includes(`${grupo}:${id}`));
}

/** Compra con yapa (si hace falta) y pone en uso. Devuelve false si no alcanza la yapa. */
export function usar(grupo, id) {
  const item = GRUPOS[grupo].find((x) => x.id === id);
  if (!item) return false;
  const d = estado();
  if (!esMio(grupo, id)) {
    if (!gastarYapa(item.precio)) return false;
    d.mios.push(`${grupo}:${id}`);
  }
  d[grupo] = id;
  guardar();
  aplicarDecoracion();
  return true;
}

export function coloresToldo() {
  return visible('toldo').colores;
}

/** Pone en la página el fondo, el toldo y el vaso elegidos. */
export function aplicarDecoracion() {
  if (typeof document === 'undefined') return;
  const raiz = document.documentElement;
  for (const [k, v] of Object.entries(visible('fondo').vars)) raiz.style.setProperty(k, v);
  coloresToldo().forEach((c, i) => raiz.style.setProperty(`--f${i + 1}`, c));
  raiz.dataset.vaso = enUso('vaso');
  // Franjas de arriba y abajo: con los colores del tejido del país, en otro orden en cada pantalla.
  const paleta = datosPais(paisActual(obtener())).telar.paleta.map(([, c]) => c);
  const pantallas = ['refresquera', 'frutera', 'aguayo', 'saltenera', 'tienda'];
  const giro = pantallas.findIndex((x) => location.pathname.includes(`/${x}/`)) + 1;
  paleta.forEach((_, i) => raiz.style.setProperty(`--t${i + 1}`, paleta[(i + giro) % paleta.length]));
}
