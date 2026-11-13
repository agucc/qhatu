import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../refresquera/pedidos.js';
import { azar, crearTablero, estaCompleto } from '../refresquera/logica.js';
import { IDS_SABORES } from '../refresquera/sabores.js';

function totales(e) {
  const c = {};
  for (const s of [...e.tablero.vasos.flat(), ...e.reserva]) c[s] = (c[s] || 0) + 1;
  return c;
}

test('la partida empieza con dos caseritos y sabores en múltiplos de 4', () => {
  const e = P.nuevaPartida({ ids: IDS_SABORES, rnd: azar(1), semilla: 1 });
  assert.equal(e.fila.length, 2);
  assert.ok(Object.values(totales(e)).every((n) => n % 4 === 0));
});

test('servir quita al caserito, entra un vaso nuevo y se conservan los totales', () => {
  const rnd = azar(7);
  const e = P.nuevaPartida({ ids: IDS_SABORES, rnd, semilla: 3 });
  const sabor = e.fila[0].sabor;
  // Se arma a mano un vaso completo del sabor pedido.
  const otros = e.tablero.vasos.flat().filter((s) => s !== sabor);
  const vasos = [[sabor, sabor, sabor, sabor]];
  for (let i = 0; i < otros.length; i += 4) vasos.push(otros.slice(i, i + 4));
  vasos.push([]);
  e.tablero = crearTablero(vasos);
  const antes = totales(e);
  antes[sabor] -= 4;
  const servidos = P.servir(e, rnd);
  assert.equal(servidos.length, 1);
  assert.equal(e.atendidos, 1);
  assert.equal(e.fila.length, 1);
  assert.equal(e.tablero.vasos[0].length, 4);
  assert.equal(estaCompleto(e.tablero.vasos[0], 4), false, 'el vaso nuevo llega mezclado');
  const despues = totales(e);
  assert.ok(Object.values(despues).every((n) => n % 4 === 0));
});

test('la partida termina cuando llega alguien con la fila llena', () => {
  const rnd = azar(2);
  const e = P.nuevaPartida({ ids: IDS_SABORES, rnd, semilla: 9 });
  while (e.fila.length < P.FILA_MAX) P.llegaCaserito(e, rnd);
  assert.equal(e.terminado, false);
  P.llegaCaserito(e, rnd);
  assert.equal(e.terminado, true);
});

test('los caseritos llegan cada vez más seguido, con un mínimo', () => {
  assert.ok(P.intervaloLlegada(10) < P.intervaloLlegada(0));
  assert.equal(P.intervaloLlegada(1000), 6);
});
