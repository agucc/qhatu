import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../saltenera/logica.js';
import { nivelDeXp, xpParaSubir, yapaPorNivel } from '../shared/progreso.js';
import { estadoInicial, anunciosYapaRestantes, cobrarAnuncioYapa, ANUNCIOS_YAPA_POR_DIA, YAPA_POR_ANUNCIO } from '../shared/almacen.js';

test('un toque vende y las mejoras suben lo que vende', () => {
  const e = S.estadoInicial();
  assert.equal(S.toque(e, 0), 1);
  e.ventas = 15;
  assert.equal(S.comprar(e, 'mano'), true);
  assert.equal(e.ventas, 0);
  assert.equal(S.porToque(e), 2);
  assert.equal(S.comprar(e, 'mano'), false, 'sin ventas no se compra');
});

test('el costo de cada mejora crece', () => {
  const e = S.estadoInicial();
  const c0 = S.costo(e, 'horno');
  e.ventas = 1e9;
  S.comprar(e, 'horno');
  assert.ok(S.costo(e, 'horno') > c0);
  assert.equal(S.porSegundo(e), 1);
});

test('la receta multiplica todo y tiene tope', () => {
  const e = S.estadoInicial();
  e.ventas = 1e30;
  S.comprar(e, 'horno');
  S.comprar(e, 'receta');
  assert.equal(S.porSegundo(e), 1.5);
  assert.equal(S.porToque(e), 1.5);
  while (S.comprar(e, 'receta'));
  assert.equal(S.cantidad(e, 'receta'), 12);
  assert.equal(S.alTope(e, 'receta'), true);
});

test('hora pico: todo vende el doble por un minuto', () => {
  const e = S.estadoInicial();
  e.mejoras.horno = 10;
  S.empezarPico(e, 1000);
  assert.equal(S.avanzar(e, 1, 2000), 20);
  assert.equal(S.avanzar(e, 1, 1000 + S.PICO_SEGUNDOS * 1000 + 1), 10);
});

test('fuera del juego vende a medio ritmo, con tope de horas', () => {
  const e = S.estadoInicial();
  e.mejoras.horno = 10;
  e.ultimaVez = 0;
  assert.equal(S.gananciaFuera(e, 30 * 1000), 0, 'menos de un minuto no cuenta');
  assert.equal(S.gananciaFuera(e, 3600 * 1000), 10 * 3600 * S.PARTE_FUERA);
  const tope = 10 * S.HORAS_FUERA_MAX * 3600 * S.PARTE_FUERA;
  assert.equal(S.gananciaFuera(e, 100 * 3600 * 1000), tope);
});

test('los hitos dan yapa una sola vez', () => {
  const e = S.estadoInicial();
  e.total = 1500;
  const h = S.revisarHitos(e);
  assert.deepEqual(h.map((x) => x.umbral), [100, 1000]);
  assert.deepEqual(S.revisarHitos(e), []);
});

test('el pedido del caserito se llena con toques y deja propina', () => {
  const e = S.estadoInicial();
  const p = S.nuevoPedido(e, 3);
  for (let i = 0; i < p.cantidad - 1; i++) S.toque(e, 0);
  assert.equal(S.pedidoListo(e), false);
  S.toque(e, 0);
  assert.equal(S.pedidoListo(e), true);
  assert.ok(S.entregarPedido(e) >= 20);
  assert.equal(e.pedido, null);
  assert.ok(S.nuevoPedido(e).cantidad > p.cantidad, 'el siguiente pide más');
});

test('formato de números grandes', () => {
  assert.equal(S.formato(999.9), '999');
  assert.equal(S.formato(1500), '1.5K');
  assert.equal(S.formato(2500000), '2.5M');
  assert.equal(S.formato(123456789), '123M');
});

test('nivel del puesto: sube con experiencia y cada nivel pide más', () => {
  assert.deepEqual(nivelDeXp(0), { nivel: 1, resto: 0, falta: 10 });
  assert.equal(nivelDeXp(9).nivel, 1);
  assert.equal(nivelDeXp(10).nivel, 2);
  assert.ok(xpParaSubir(5) > xpParaSubir(1));
  assert.ok(yapaPorNivel(5) > yapaPorNivel(2));
});

test('yapa por anuncios: tope diario que se renueva al día siguiente', () => {
  const e = estadoInicial();
  const y0 = e.yapa;
  for (let i = 0; i < ANUNCIOS_YAPA_POR_DIA; i++) assert.equal(cobrarAnuncioYapa(e, '2026-11-13'), YAPA_POR_ANUNCIO);
  assert.equal(cobrarAnuncioYapa(e, '2026-11-13'), 0);
  assert.equal(e.yapa, y0 + ANUNCIOS_YAPA_POR_DIA * YAPA_POR_ANUNCIO);
  assert.equal(anunciosYapaRestantes(e, '2026-11-14'), ANUNCIOS_YAPA_POR_DIA);
});
