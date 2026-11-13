// Pasar el progreso a otro dispositivo sin cuenta ni servidor: un código para copiar y pegar.

import { obtener, estadoInicial } from './almacen.js';

const PREFIJO = 'QHATU1-';

function suma(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function aBase64(texto) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function deBase64(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function codigoDe(estado) {
  const json = JSON.stringify(estado);
  return `${PREFIJO}${suma(json)}-${aBase64(json)}`;
}

export function exportar() {
  return codigoDe(obtener());
}

/** Lee un código. Devuelve el estado o null si el código no es válido. */
export function leerCodigo(codigo) {
  const limpio = String(codigo || '').replace(/\s+/g, '');
  if (!limpio.startsWith(PREFIJO)) return null;
  const resto = limpio.slice(PREFIJO.length);
  const guion = resto.indexOf('-');
  if (guion < 0) return null;
  try {
    const json = deBase64(resto.slice(guion + 1));
    if (suma(json) !== resto.slice(0, guion)) return null;
    const datos = JSON.parse(json);
    if (typeof datos !== 'object' || typeof datos.yapa !== 'number') return null;
    return { ...estadoInicial(), ...datos };
  } catch {
    return null;
  }
}
