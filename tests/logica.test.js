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

// ---------- Vasos especiales ----------

test('vaso con tapa: solo acepta su sabor', () => {
  const t0 = L.crearTablero([['a', 'b'], ['b'], []], 4, { solo: [null, null, 'a'] });
  assert.equal(L.puedeVerter(t0, 1, 2), false, 'b no entra en el vaso de a');
  assert.equal(L.puedeVerter(t0, 0, 1), true);
  const { tablero } = L.verter(t0, 0, 1);
  assert.equal(L.puedeVerter(tablero, 0, 2), true, 'a sí entra');
});

test('vaso chico: le caben tres capas', () => {
  const t0 = L.crearTablero([['a', 'a', 'a', 'a'], []], 4, { caps: [4, 3] });
  const { tablero, cantidad } = L.verter(t0, 0, 1);
  assert.equal(cantidad, 3);
  assert.deepEqual(tablero.vasos, [['a'], ['a', 'a', 'a']]);
  assert.equal(L.estaResuelto(tablero), false, 'un sabor partido en dos vasos no está resuelto');
});

test('hielo: las capas tapadas se descongelan al quedar arriba', () => {
  const t0 = L.crearTablero([['a', 'b', 'c', 'd'], [], []], 4, { hielo: [2, 0, 0] });
  assert.equal(L.capaOculta(t0, 0, 0), true);
  assert.equal(L.capaOculta(t0, 0, 1), true);
  assert.equal(L.capaOculta(t0, 0, 2), false);
  let r = L.verter(t0, 0, 1); // sale d
  assert.equal(r.revelada, false);
  r = L.verter(r.tablero, 0, 2); // sale c: queda b arriba, se descongela
  assert.equal(r.revelada, true);
  assert.equal(L.capaOculta(r.tablero, 0, 1), false);
  assert.equal(L.capaOculta(r.tablero, 0, 0), true, 'la de abajo sigue con hielo');
});

test('los niveles con vasos especiales tienen solución', () => {
  let conHielo = 0;
  let conTapa = 0;
  let conChico = 0;
  for (let n = 1; n <= 60; n++) {
    const t = L.generarNivel(n, IDS_SABORES);
    const { especial } = L.dificultad(n);
    if (especial.hielo) {
      conHielo++;
      assert.ok(t.hielo.some((h) => h > 0), `nivel ${n} trae hielo`);
    }
    if (especial.tapa) {
      conTapa++;
      assert.ok(t.solo.some(Boolean), `nivel ${n} trae tapa`);
    }
    if (especial.chico) {
      conChico++;
      assert.ok(t.caps.includes(L.CAPACIDAD_CHICO), `nivel ${n} trae vaso chico`);
    }
    if (especial.hielo || especial.tapa || especial.chico) assert.ok(L.resolver(t, 200000), `nivel ${n} tiene solución`);
  }
  assert.ok(conHielo > 5 && conTapa > 5 && conChico > 3);
  for (let n = 1; n <= 8; n++) {
    const e = L.dificultad(n).especial;
    assert.ok(!e.hielo && !e.tapa && !e.chico, 'los primeros niveles son simples');
  }
});

test('agregar un vaso extra conserva las reglas de los demás', () => {
  const t0 = L.crearTablero([['a'], []], 4, { solo: [null, 'a'], hielo: [0, 0] });
  const t1 = L.agregarVacio(L.clonar(t0));
  assert.equal(t1.vasos.length, 3);
  assert.deepEqual(t1.solo, [null, 'a', null]);
  assert.equal(t0.vasos.length, 2, 'el original no cambia');
});
