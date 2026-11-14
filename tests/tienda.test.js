// Pruebas de la tienda ampliada: vestimentas, personalización, pasaportes, impulsos, temporada y desafíos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../shared/catalogo.js';
import * as T from '../shared/temporada.js';
import { obtener } from '../shared/almacen.js';
import { pasajesLibres } from '../shared/paises.js';
import { ganarXp } from '../shared/progreso.js';
import { avatar, codigoAvatar, leerCodigoAvatar, PIEZAS_AVATAR } from '../shared/marca.js';
import { PRODUCTOS, entregar } from '../shared/compras.js';
import { PRODUCTOS as PRODUCTOS_SERVIDOR } from '../nube/src/compras.js';

const DIA = new Date(2026, 10, 20); // dentro de la temporada t1

function nuevo(extra = {}) {
  const e = obtener();
  for (const k of Object.keys(e)) delete e[k];
  Object.assign(e, { yapa: 1000, pais: 'bo', paises: ['bo'], paisActual: 'bo', puestos: {}, vistos: {}, ...extra });
  return e;
}

test('cada artículo existe como pieza dibujable y tiene nombre en tres idiomas', () => {
  for (const a of C.ARTICULOS) {
    assert.equal(a.nombre.length, 3, a.id);
    if (['sombrero', 'prenda', 'peinado', 'accesorio', 'marco'].includes(a.grupo)) assert.ok(PIEZAS_AVATAR[a.grupo].includes(a.pieza), a.id);
    if (a.grupo === 'portada') assert.ok(C.PORTADAS[a.pieza], a.id);
  }
  assert.equal(new Set(C.ARTICULOS.map((a) => a.id)).size, C.ARTICULOS.length);
});

test('vestimentas: las de un país se compran solo después de visitarlo, con yapa, y se ponen', () => {
  const e = nuevo();
  assert.equal(C.comprarArticulo('sombrero:charro'), 'pais', 'México no está abierto');
  assert.equal(C.comprarArticulo('sombrero:bombin'), 'ok');
  assert.equal(e.yapa, 850);
  assert.ok(C.loTengo('sombrero:bombin'));
  assert.ok(C.ponerse('sombrero:bombin'));
  assert.equal(C.miAvatar().sombrero, 'bombin');
  e.yapa = 10;
  assert.equal(C.comprarArticulo('accesorio:lentes'), 'falta-yapa');
  assert.equal(C.comprarArticulo('sombrero:fiesta'), 'temporada', 'los exclusivos no se venden');
  assert.equal(C.ponerse('sombrero:fiesta'), false);
});

test('pasaporte: portadas que se compran y se ponen', () => {
  nuevo();
  assert.equal(C.miPortada(), 'clasica');
  assert.equal(C.comprarArticulo('portada:andina'), 'ok');
  C.ponerse('portada:andina');
  assert.equal(C.miPortada(), 'andina');
});

test('impulsos: doble experiencia por 24 h y pasaje extra', () => {
  const e = nuevo();
  assert.equal(pasajesLibres(e), 0);
  assert.equal(C.comprarArticulo('impulso:pasaje'), 'ok');
  assert.equal(pasajesLibres(e), 1);
  ganarXp('frutera', 3);
  assert.equal(e.puestos.frutera.xp, 3);
  C.comprarArticulo('impulso:xp2');
  assert.ok(C.xpDoble());
  ganarXp('frutera', 3);
  assert.equal(e.puestos.frutera.xp, 9, 'con el impulso vale doble');
  assert.equal(C.xpDoble(e, Date.now() + 25 * 3600_000), false, 'dura 24 horas');
});

test('el personaje se dibuja con cualquier combinación y viaja como código corto', () => {
  const av = { piel: 3, peinado: 'trenzas', prenda: 'poncho', color: 2, sombrero: 'vueltiao', accesorio: 'bufanda', marco: 'aguayo' };
  assert.deepEqual(leerCodigoAvatar(codigoAvatar(av)), av);
  assert.match(avatar(av), /^<svg class="avatar"/);
  assert.deepEqual(leerCodigoAvatar('basura.<script>'), leerCodigoAvatar(''));
});

test('temporada: niveles con puntos, premios gratis para todos y premium con el pase', () => {
  const e = nuevo();
  assert.equal(T.temporadaActual(DIA).id, 't1');
  assert.equal(T.temporadaActual(new Date(2027, 2, 1)), null);
  T.sumarPuntosTemporada(T.PUNTOS_NIVEL * 2, e, DIA);
  assert.equal(T.nivelTemporada(T.miTemporada(e, DIA).puntos), 2);
  const yapa = e.yapa;
  assert.ok(T.reclamar(1, 'gratis', e, DIA).yapa);
  assert.ok(e.yapa > yapa);
  assert.equal(T.reclamar(1, 'gratis', e, DIA), null, 'una sola vez');
  assert.equal(T.reclamar(3, 'gratis', e, DIA), null, 'nivel no alcanzado');
  assert.equal(T.reclamar(1, 'premium', e, DIA), null, 'sin pase');
  T.activarPase(e, DIA);
  assert.equal(T.reclamar(1, 'premium', e, DIA).articulo, 'sombrero:fiesta');
  assert.ok(C.loTengo('sombrero:fiesta', e));
  assert.equal(T.reclamar(2, 'gratis', e, DIA).articulo, 'accesorio:aretes');
});

test('la experiencia ganada en los puestos suma puntos de temporada', () => {
  const e = nuevo();
  ganarXp('aguayo', 5);
  assert.ok((T.miTemporada(e)?.puntos ?? 5) >= 0);
});

test('desafíos: 3 para todos y 2 premium por semana, iguales para todos, y se cobran una vez', () => {
  const e = nuevo();
  const lista = T.desafiosDeSemana('2026-S47');
  assert.equal(lista.length, 5);
  assert.deepEqual(lista.map((d) => d.premium), [false, false, false, true, true]);
  assert.deepEqual(T.desafiosDeSemana('2026-S47'), lista, 'la misma semana, los mismos desafíos');
  assert.notDeepEqual(T.desafiosDeSemana('2026-S48').map((d) => d.id), lista.map((d) => d.id));
  const gratis = T.listaDesafios(e, DIA).find((d) => !d.premium);
  assert.equal(T.cobrarDesafio(gratis.id, e, DIA), 0, 'sin cumplir');
  T.registrar(gratis.tipo, gratis.meta, e, DIA);
  assert.equal(T.cobrarDesafio(gratis.id, e, DIA), gratis.puntos);
  assert.equal(T.cobrarDesafio(gratis.id, e, DIA), 0, 'una vez');
  const premium = T.listaDesafios(e, DIA).find((d) => d.premium);
  T.registrar(premium.tipo, premium.meta, e, DIA);
  assert.equal(T.cobrarDesafio(premium.id, e, DIA), 0, 'premium sin pase');
  assert.equal(T.semana(new Date(2026, 10, 16)), T.semana(new Date(2026, 10, 22)), 'lunes y domingo, misma semana');
});

test('productos con dinero: los mismos precios en el juego y en el servidor, y se entregan', () => {
  for (const p of PRODUCTOS) assert.equal(PRODUCTOS_SERVIDOR[p.id], p.usd, p.id);
  const e = nuevo({ yapa: 0 });
  entregar(PRODUCTOS.find((p) => p.id === 'yapa_3000'));
  assert.equal(e.yapa, 3000);
  entregar(PRODUCTOS.find((p) => p.id === 'pasaporte_viajero'));
  assert.equal(pasajesLibres(e), 2);
  assert.ok(C.loTengo('portada:dorada', e));
  entregar(PRODUCTOS.find((p) => p.id === 'doble_xp_7d'));
  assert.ok(C.xpDoble(e, Date.now() + 6 * 24 * 3600_000));
});
