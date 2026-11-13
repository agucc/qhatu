// Compras con dinero real: packs de yapa y quitar anuncios.
// Precios claros, sin ofertas que presionan ni premios al azar.
// La compra real pasa por Google Play; hasta que la app esté publicada, la versión
// de prueba simula la compra sin cobrar y lo dice en pantalla.

import { obtener, guardar, sumarYapa } from './almacen.js';
import { EN_APP } from './config.js';

export const PRODUCTOS = [
  { id: 'yapa_150', tipo: 'yapa', yapa: 150, usd: 0.99 },
  { id: 'yapa_500', tipo: 'yapa', yapa: 500, usd: 2.99 },
  { id: 'yapa_1000', tipo: 'yapa', yapa: 1000, usd: 4.99 },
  { id: 'sin_anuncios', tipo: 'sin_anuncios', usd: 2.99 },
];

const demo = typeof location !== 'undefined' && new URLSearchParams(location.search).get('compras') === 'demo';

function complemento() {
  return typeof window !== 'undefined' ? window.Capacitor?.Plugins?.QhatuCompras : null;
}

/** 'play' (Google Play), 'prueba' (simulada, no cobra) o 'no' (no se puede comprar aquí). */
export function modoCompras() {
  if (complemento()) return 'play';
  if (EN_APP || demo) return 'prueba';
  return 'no';
}

export function precio(producto) {
  return `${producto.usd.toFixed(2)} USD`;
}

export function sinAnuncios() {
  return Boolean(obtener().sinAnuncios);
}

/** Entrega lo comprado. */
export function entregar(producto) {
  if (producto.tipo === 'yapa') sumarYapa(producto.yapa);
  else if (producto.tipo === 'sin_anuncios') {
    obtener().sinAnuncios = true;
    guardar();
  }
}

/** Devuelve true si la compra se completó. */
export async function comprar(id) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto) return false;
  if (producto.tipo === 'sin_anuncios' && sinAnuncios()) return false;
  const modo = modoCompras();
  if (modo === 'no') return false;
  if (modo === 'play') {
    try {
      const r = await complemento().comprar({ id });
      if (!r?.ok) return false;
    } catch {
      return false;
    }
  }
  entregar(producto);
  return true;
}
