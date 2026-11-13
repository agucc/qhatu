// Decoración del mercado: fondos, toldos y vasos. Se compra con yapa y no cambia el juego.

import { obtener, guardar, gastarYapa } from './almacen.js';

export const FONDOS = [
  { id: 'noche', precio: 0, vars: { '--noche': '#17131f', '--puesto': '#221c2d', '--puesto-2': '#2c2539', '--borde': '#3d3450' } },
  { id: 'lago', precio: 150, vars: { '--noche': '#0f1b2d', '--puesto': '#17273d', '--puesto-2': '#1f3350', '--borde': '#2f4a6e' } },
  { id: 'cerro', precio: 150, vars: { '--noche': '#24130f', '--puesto': '#331c16', '--puesto-2': '#42261e', '--borde': '#5e382c' } },
  { id: 'yungas', precio: 150, vars: { '--noche': '#0f1f1a', '--puesto': '#172d26', '--puesto-2': '#1f3b32', '--borde': '#2f5547' } },
];

export const TOLDOS = [
  { id: 'mercado', precio: 0, colores: ['#ef476f', '#ffb520', '#1fb5a5', '#9a48b8', '#a6d63a', '#ffb520'] },
  { id: 'carnaval', precio: 100, colores: ['#ff5d8f', '#ffd23f', '#3bceac', '#7b2cbf', '#ff7b00', '#0ead69'] },
  { id: 'salar', precio: 100, colores: ['#f3ead2', '#8ecae6', '#f3ead2', '#219ebc', '#f3ead2', '#8ecae6'] },
  { id: 'wiphala', precio: 100, colores: ['#e4002b', '#ff8200', '#ffd100', '#ffffff', '#009a44', '#0057b8'] },
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
  return e.decoracion;
}

export function enUso(grupo) {
  return estado()[grupo];
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
  return (TOLDOS.find((x) => x.id === enUso('toldo')) || TOLDOS[0]).colores;
}

/** Pone en la página el fondo, el toldo y el vaso elegidos. */
export function aplicarDecoracion() {
  if (typeof document === 'undefined') return;
  const raiz = document.documentElement;
  const fondo = FONDOS.find((x) => x.id === enUso('fondo')) || FONDOS[0];
  for (const [k, v] of Object.entries(fondo.vars)) raiz.style.setProperty(k, v);
  coloresToldo().forEach((c, i) => raiz.style.setProperty(`--f${i + 1}`, c));
  raiz.dataset.vaso = enUso('vaso');
}
