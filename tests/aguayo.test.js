import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../aguayo/logica.js';
import { azar } from '../refresquera/logica.js';

const p = (id) => A.pieza(id).celdas;

test('las piezas no se repiten y caben en el telar', () => {
  const formas = new Set();
  for (const pz of A.PIEZAS) {
    const k = JSON.stringify(pz.celdas);
    assert.ok(!formas.has(k), `${pz.id} repetida`);
    formas.add(k);
    assert.ok(A.hayLugar(A.crearTelar(), pz.celdas));
  }
});

test('una pieza no cabe fuera del telar ni encima de otra', () => {
  const t = A.crearTelar();
  assert.equal(A.cabe(t, p('tres-h'), 0, 6), false);
  assert.equal(A.cabe(t, p('tres-v'), 6, 0), false);
  const r = A.colocar(t, p('cuadro'), 0, 0, 'api');
  assert.equal(A.cabe(r.telar, p('uno'), 1, 1), false);
  assert.equal(A.cabe(r.telar, p('uno'), 2, 2), true);
});

test('completar una fila la teje, la vacía y da puntos', () => {
  let t = A.crearTelar();
  t = A.colocar(t, p('cuatro-h'), 7, 0, 'api').telar;
  const r = A.colocar(t, p('cuatro-h'), 7, 4, 'api');
  assert.equal(r.franjas.length, 1);
  assert.deepEqual(r.franjas[0], { tipo: 'fila', indice: 7, colores: Array(8).fill('api'), dominante: 'api' });
  assert.ok(r.telar[7].every((c) => c === null));
  assert.ok(r.lleno[7].every((c) => c === 'api'), 'lleno conserva la fila para animar');
  assert.equal(r.puntos, 4 + A.puntosLineas(1));
});

test('una fila y una columna a la vez se tejen juntas y valen más', () => {
  let t = A.crearTelar();
  for (let c = 0; c < 7; c++) t[0][c] = 'tumbo';
  for (let f = 1; f < 8; f++) t[f][7] = 'frutilla';
  const r = A.colocar(t, p('uno'), 0, 7, 'tumbo');
  assert.equal(r.franjas.length, 2);
  assert.equal(r.puntos, 1 + A.puntosLineas(2));
  assert.ok(A.puntosLineas(2) > 2 * A.puntosLineas(1));
  const fila = r.franjas.find((f) => f.tipo === 'fila');
  const col = r.franjas.find((f) => f.tipo === 'columna');
  assert.equal(fila.dominante, 'tumbo');
  assert.equal(col.dominante, 'frutilla');
});

test('el color dominante necesita al menos la mitad de la línea', () => {
  assert.equal(A.colorDominante(['api', 'api', 'api', 'api', 'tumbo', 'tumbo', 'limonada', 'frutilla']), 'api');
  assert.equal(A.colorDominante(['api', 'api', 'api', 'tumbo', 'tumbo', 'tumbo', 'limonada', 'frutilla']), null);
});

test('la mano trae tres piezas y procura que al menos una quepa', () => {
  const rnd = azar(5);
  const t = A.crearTelar();
  // Telar casi lleno: solo queda un hueco
  for (let f = 0; f < 8; f++) for (let c = 0; c < 8; c++) t[f][c] = (f + c) % 2 ? 'api' : null;
  for (let f = 0; f < 8; f++) for (let c = 0; c < 8; c++) if (t[f][c] === null) t[f][c] = 'tumbo';
  t[3][3] = null;
  const mano = A.nuevaMano(rnd, t);
  assert.equal(mano.length, 3);
  for (const m of mano) assert.ok(A.HILOS.includes(m.color));
  assert.ok(mano.some((m) => A.hayLugar(t, m.pieza.celdas)));
  assert.equal(A.estaTrabado(t, mano), false);
});

test('trabado cuando ninguna pieza de la mano cabe', () => {
  const t = A.crearTelar();
  for (let f = 0; f < 8; f++) for (let c = 0; c < 8; c++) t[f][c] = 'api';
  t[0][0] = null;
  const mano = [{ pieza: A.pieza('dos-h'), color: 'api' }, { pieza: A.pieza('cuadro'), color: 'api' }, null];
  assert.equal(A.estaTrabado(t, mano), true);
});
