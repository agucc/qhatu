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

test('anuncio obligatorio: nunca en los cinco primeros niveles y como máximo cada tres', () => {
  for (let n = 1; n <= 5; n++) assert.equal(tocaAnuncio(n), false);
  const con = [];
  for (let n = 1; n <= 30; n++) if (tocaAnuncio(n)) con.push(n);
  for (let i = 1; i < con.length; i++) assert.ok(con[i] - con[i - 1] >= 3);
});
