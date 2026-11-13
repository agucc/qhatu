// Modo pedidos: llegan caseritos pidiendo un sabor. Cada vaso completo de ese sabor
// se sirve solo y en su lugar entra un vaso nuevo mezclado. Se acaba cuando la fila se llena.
// Funciones puras: el tiempo y el azar llegan desde afuera.

import { barajar, estaCompleto, generarTablero, clonar, agregarVacio } from './logica.js';

export const FILA_MAX = 5;
export const YAPA_POR_PEDIDO = 2;
export const SABORES_INICIO = 5;

/** Segundos hasta el siguiente caserito: empieza tranquilo y se acelera poco a poco. */
export function intervaloLlegada(atendidos) {
  return Math.max(6, 14 - atendidos * 0.3);
}

export function nuevaPartida({ ids, rnd, semilla }) {
  const tablero = generarTablero({ semilla, sabores: SABORES_INICIO, vacios: 2, ids });
  const enJuego = [...new Set(tablero.vasos.flat())];
  const fuera = ids.filter((s) => !enJuego.includes(s));
  // La reserva trae los vasos nuevos. Junto con el tablero, cada sabor suma múltiplos de 4.
  const extras = barajar(fuera.length ? fuera : enJuego, rnd).slice(0, 2);
  const reserva = barajar(extras.flatMap((s) => Array(tablero.cap).fill(s)), rnd);
  const estado = {
    ids,
    tablero,
    reserva,
    fila: [],
    atendidos: 0,
    siguienteId: 1,
    terminado: false,
  };
  llegaCaserito(estado, rnd);
  llegaCaserito(estado, rnd);
  return estado;
}

function contarSabores(tablero) {
  const cuenta = {};
  for (const v of tablero.vasos) for (const s of v) cuenta[s] = (cuenta[s] || 0) + 1;
  return cuenta;
}

/** Elige qué pide el caserito: un sabor que se pueda completar y que no esté ya muy pedido. */
export function elegirPedido(estado, rnd) {
  const cuenta = contarSabores(estado.tablero);
  const pedidos = {};
  for (const c of estado.fila) pedidos[c.sabor] = (pedidos[c.sabor] || 0) + 1;
  const cap = estado.tablero.cap;
  let candidatos = Object.keys(cuenta).filter((s) => cuenta[s] >= cap && !pedidos[s]);
  if (!candidatos.length) candidatos = Object.keys(cuenta).filter((s) => cuenta[s] >= cap);
  if (!candidatos.length) candidatos = Object.keys(cuenta);
  if (!candidatos.length) candidatos = estado.ids;
  return candidatos[Math.floor(rnd() * candidatos.length)];
}

/** Llega un caserito. Si la fila ya estaba llena, la partida termina. */
export function llegaCaserito(estado, rnd) {
  if (estado.terminado) return null;
  if (estado.fila.length >= FILA_MAX) {
    estado.terminado = true;
    return null;
  }
  const caserito = { id: estado.siguienteId++, sabor: elegirPedido(estado, rnd), cara: Math.floor(rnd() * 1000) };
  estado.fila.push(caserito);
  return caserito;
}

/** Saca de la reserva las capas de un vaso nuevo y repone la reserva con un sabor al azar. */
function vasoNuevo(estado, rnd) {
  const cap = estado.tablero.cap;
  const nuevoSabor = estado.ids[Math.floor(rnd() * estado.ids.length)];
  estado.reserva = barajar(estado.reserva.concat(Array(cap).fill(nuevoSabor)), rnd);
  let capas = estado.reserva.slice(0, cap);
  estado.reserva = estado.reserva.slice(cap);
  // Que no llegue ya listo: si salió de un solo sabor, se cambia una capa con la reserva.
  if (capas.every((s) => s === capas[0])) {
    const k = estado.reserva.findIndex((s) => s !== capas[0]);
    if (k >= 0) {
      const tmp = capas[cap - 1];
      capas = capas.slice(0, cap - 1).concat(estado.reserva[k]);
      estado.reserva[k] = tmp;
    }
  }
  return capas;
}

/**
 * Sirve todos los vasos completos que algún caserito esté pidiendo.
 * Devuelve la lista de servicios [{ vaso, caserito }] para animarlos.
 */
export function servir(estado, rnd) {
  const servidos = [];
  let hubo = true;
  while (hubo) {
    hubo = false;
    const t = estado.tablero;
    for (let i = 0; i < t.vasos.length; i++) {
      const vaso = t.vasos[i];
      if (!estaCompleto(vaso, t.cap)) continue;
      const k = estado.fila.findIndex((c) => c.sabor === vaso[0]);
      if (k < 0) continue;
      const [caserito] = estado.fila.splice(k, 1);
      const nuevo = clonar(t);
      nuevo.vasos[i] = vasoNuevo(estado, rnd);
      nuevo.hielo[i] = 0;
      estado.tablero = nuevo;
      estado.atendidos++;
      servidos.push({ vaso: i, caserito });
      hubo = true;
      break;
    }
  }
  return servidos;
}

export function agregarVaso(estado) {
  estado.tablero = agregarVacio(clonar(estado.tablero));
}
