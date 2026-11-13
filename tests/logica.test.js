import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../refresquera/logica.js';
import { IDS_SABORES } from '../refresquera/sabores.js';

const T = (vasos) => L.crearTablero(vasos, 4);

test('verter mueve todas las capas iguales de arriba que caben', () => {
  const t0 = T([['a', 'b', 'b'], ['b'], []]);
  const { tablero, cantidad } = L.verter(t0, 0, 1);
  assert.equal(cantidad, 2);
  assert.deepEqual(tablero.vasos, [['a'], ['b', 'b', 'b'], []]);
  assert.deepEqual(t0.vasos[0], ['a', 'b', 'b'], 'no modifica el original');
});

test('verter respeta la capacidad', () => {
  const { tablero, cantidad } = L.verter(T([['b', 'b', 'b'], ['a', 'a', 'b'], []]), 0, 1);
  assert.equal(cantidad, 1);
  assert.deepEqual(tablero.vasos[1], ['a', 'a', 'b', 'b']);
});

test('no se vierte sobre otro sabor ni en un vaso lleno', () => {
  const t0 = T([['a'], ['b'], ['a', 'a', 'a', 'a']]);
  assert.equal(L.puedeVerter(t0, 0, 1), false);
  assert.equal(L.puedeVerter(t0, 0, 2), false);
  assert.equal(L.puedeVerter(t0, 0, 0), false);
});

test('resuelto y atascado', () => {
  assert.equal(L.estaResuelto(T([['a', 'a', 'a', 'a'], []])), true);
  assert.equal(L.estaResuelto(T([['a', 'a', 'a'], ['a']])), false);
  assert.equal(L.estaAtascado(T([['a', 'b', 'a', 'b'], ['b', 'a', 'b', 'a']])), true);
  assert.equal(L.estaAtascado(T([['a', 'b'], ['b']])), false);
});

test('pasar un vaso de un solo sabor a uno vacío no cuenta como jugada útil', () => {
  const t0 = T([['a', 'a'], [], ['b', 'a']]);
  assert.equal(L.esMovimientoUtil(t0, 0, 1), false);
  assert.equal(L.esMovimientoUtil(t0, 2, 0), true);
});

test('el solucionador encuentra una solución válida', () => {
  const t0 = T([['a', 'b', 'a', 'b'], ['b', 'a', 'b', 'a'], [], []]);
  const sol = L.resolver(t0);
  assert.ok(sol);
  let t = t0;
  for (const [i, j] of sol) t = L.verter(t, i, j).tablero;
  assert.equal(L.estaResuelto(t), true);
});

test('los niveles son repetibles, tienen solución y crecen en dificultad', () => {
  for (const n of [1, 2, 5, 6, 12, 25, 50]) {
    const a = L.generarNivel(n, IDS_SABORES);
    const b = L.generarNivel(n, IDS_SABORES);
    assert.deepEqual(a, b, `nivel ${n} igual cada vez`);
    const { sabores, vacios } = L.dificultad(n);
    assert.equal(a.vasos.length, sabores + vacios);
    const cuenta = {};
    for (const s of a.vasos.flat()) cuenta[s] = (cuenta[s] || 0) + 1;
    assert.ok(Object.values(cuenta).every((c) => c === 4));
    assert.ok(L.resolver(a, 200000), `nivel ${n} tiene solución`);
  }
  assert.ok(L.dificultad(50).sabores > L.dificultad(1).sabores);
});

test('la pista propone un movimiento válido', () => {
  const t0 = L.generarNivel(8, IDS_SABORES);
  const [i, j] = L.pista(t0);
  assert.equal(L.puedeVerter(t0, i, j), true);
});
