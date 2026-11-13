import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../frutera/fisica.js';
import { FRUTAS, ULTIMA, PUNTOS, PUNTOS_PAPAYAS, frutaAlAzar } from '../frutera/frutas.js';
import { azar } from '../refresquera/logica.js';

function correr(m, segundos) {
  const eventos = [];
  for (let i = 0; i < segundos * 60; i++) eventos.push(...F.paso(m, 1 / 60));
  return eventos;
}

test('las frutas van de chica a grande', () => {
  for (let i = 1; i < FRUTAS.length; i++) assert.ok(FRUTAS[i].r > FRUTAS[i - 1].r);
  assert.equal(FRUTAS[0].id, 'achachairu');
  assert.equal(FRUTAS[ULTIMA].id, 'papaya');
});

test('dos frutas iguales se juntan en la siguiente y suman puntos', () => {
  const m = F.crearMundo();
  F.agregarFruta(m, 2, 150, 500);
  F.agregarFruta(m, 2, 190, 500); // se tocan
  const eventos = correr(m, 2);
  const union = eventos.find((e) => e.tipo === 'union');
  assert.ok(union);
  assert.equal(union.nivel, 3);
  assert.equal(m.frutas.length, 1);
  assert.equal(m.frutas[0].nivel, 3);
  assert.equal(m.puntos, PUNTOS[3]);
});

test('dos papayas se venden juntas y dejan el canasto vacío', () => {
  const m = F.crearMundo();
  F.agregarFruta(m, ULTIMA, 110, 500);
  F.agregarFruta(m, ULTIMA, 250, 500); // se tocan
  const eventos = correr(m, 2);
  assert.ok(eventos.some((e) => e.tipo === 'papayas'));
  assert.equal(m.frutas.length, 0);
  assert.equal(m.puntos, PUNTOS_PAPAYAS);
});

test('frutas distintas no se juntan y ninguna sale del canasto', () => {
  const m = F.crearMundo();
  for (let i = 0; i < 5; i++) F.agregarFruta(m, i, 60 + i * 60, 300);
  correr(m, 4);
  assert.equal(m.frutas.length, 5);
  for (const f of m.frutas) {
    assert.ok(f.x - f.r >= F.CANASTO.izq - 0.5 && f.x + f.r <= F.CANASTO.der + 0.5);
    assert.ok(f.y + f.r <= F.CANASTO.piso + 0.5);
  }
});

test('muchas frutas al azar: quietas, sin encimarse y dentro del canasto', () => {
  const rnd = azar(9);
  const m = F.crearMundo();
  for (let k = 0; k < 35 && !m.terminado; k++) {
    F.soltar(m, frutaAlAzar(rnd), F.CANASTO.izq + rnd() * (F.CANASTO.der - F.CANASTO.izq));
    correr(m, 1);
  }
  correr(m, 3);
  for (const f of m.frutas) {
    assert.ok(f.x - f.r >= F.CANASTO.izq - 1 && f.x + f.r <= F.CANASTO.der + 1, 'dentro de las paredes');
    assert.ok(Math.hypot(f.vx, f.vy) < 60, 'quieta');
  }
  for (let i = 0; i < m.frutas.length; i++) {
    for (let j = i + 1; j < m.frutas.length; j++) {
      const a = m.frutas[i];
      const b = m.frutas[j];
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > a.r + b.r - 2, 'sin encimarse');
    }
  }
});

test('el canasto se llena si una fruta queda sobre el borde, y despejar lo arregla', () => {
  const m = F.crearMundo();
  // Una columna de papayas y piñas que no se juntan entre sí llega por encima del borde
  for (let i = 0; i < 6; i++) F.agregarFruta(m, i % 2 ? ULTIMA : ULTIMA - 1, 180, F.CANASTO.piso - 70 - i * 130);
  correr(m, F.TIEMPO_LLENO + 4);
  assert.equal(m.terminado, true);
  const quitadas = F.despejarBorde(m);
  assert.ok(quitadas > 0);
  assert.equal(m.terminado, false);
  for (const f of m.frutas) assert.ok(f.y - f.r >= F.CANASTO.borde);
});

test('solo caen las cinco frutas más chicas', () => {
  const rnd = azar(3);
  for (let i = 0; i < 500; i++) assert.ok(frutaAlAzar(rnd) <= 4);
});
