import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoInicial, registrarJuego, rachaVigente, recibirRegalo, montoRegalo, diasEntre, YAPA_INICIAL } from '../shared/almacen.js';
import { tocaAnuncio } from '../shared/anuncios.js';

test('la racha sube con días seguidos y se corta si faltas', () => {
  const e = estadoInicial();
  registrarJuego(e, '2026-11-10');
  registrarJuego(e, '2026-11-10');
  assert.equal(e.racha, 1);
  registrarJuego(e, '2026-11-11');
  registrarJuego(e, '2026-11-12');
  assert.equal(e.racha, 3);
  assert.equal(rachaVigente(e, '2026-11-13'), 3);
  assert.equal(rachaVigente(e, '2026-11-14'), 0);
  registrarJuego(e, '2026-11-15');
  assert.equal(e.racha, 1);
});

test('la racha cruza fin de mes y de año', () => {
  assert.equal(diasEntre('2026-12-31', '2027-01-01'), 1);
  assert.equal(diasEntre('2026-02-28', '2026-03-01'), 1);
});

test('el regalo diario se da una vez al día y crece con la racha', () => {
  const e = estadoInicial();
  assert.equal(recibirRegalo(e, '2026-11-13'), montoRegalo(0));
  assert.equal(recibirRegalo(e, '2026-11-13'), 0);
  assert.equal(e.yapa, YAPA_INICIAL + montoRegalo(0));
  assert.ok(montoRegalo(3) > montoRegalo(1));
  assert.equal(montoRegalo(100), montoRegalo(6), 'tiene tope');
});

test('no hay anuncios obligatorios: solo los que elige el jugador', () => {
  for (let n = 1; n <= 60; n++) assert.equal(tocaAnuncio(n), false);
});

import { codigoDe, leerCodigo } from '../shared/transferir.js';

test('pasar el progreso: el código se lee igual y detecta cambios', () => {
  const e = { ...estadoInicial(), yapa: 777, racha: 4, puestos: { saltenera: { e: { ventas: 12 } } }, idioma: 'pt' };
  const codigo = codigoDe(e);
  const leido = leerCodigo(codigo);
  assert.equal(leido.yapa, 777);
  assert.equal(leido.racha, 4);
  assert.equal(leido.puestos.saltenera.e.ventas, 12);
  assert.equal(leerCodigo(`  ${codigo.slice(0, 40)}\n${codigo.slice(40)} `).yapa, 777, 'tolera espacios y saltos de línea');
  const tocado = codigo.slice(0, -6) + (codigo.endsWith('A') ? 'B' : 'A') + codigo.slice(-5);
  assert.equal(leerCodigo(tocado), null, 'un código alterado no se acepta');
  assert.equal(leerCodigo('hola'), null);
});
