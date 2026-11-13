import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../shared/paises.js';
import { BEBIDAS, TODAS, saboresDe } from '../refresquera/bebidas.js';
import { ICONOS } from '../refresquera/iconos.js';
import { FRUTAS_PAIS, frutasDe, RADIOS } from '../frutera/frutas.js';
import { COMIDAS } from '../saltenera/comidas.js';
import { generarNivel, resolver } from '../refresquera/logica.js';
import { recetasDe, recetasNuevas, sumarNivel, nivelesEn } from '../refresquera/recetario.js';
import { estadoInicial } from '../shared/almacen.js';

const IDS = P.PAISES.map((p) => p.id);
const trio = (x) => Array.isArray(x) && x.length === 3 && x.every((s) => typeof s === 'string' && s.length > 0);

test('hay siete países y cada uno tiene todo lo que usan los puestos', () => {
  assert.deepEqual(IDS, ['bo', 'pe', 'mx', 'co', 'ar', 'br', 'us']);
  for (const p of P.PAISES) {
    assert.ok(trio(p.nombre) && trio(p.dato), `${p.id}: nombre y dato`);
    assert.ok(p.moneda && ['horno', 'parrilla'].includes(p.cocina), `${p.id}: moneda y cocina`);
    assert.ok(trio(p.comida.puesto) && trio(p.comida.plural) && COMIDAS[p.comida.dibujo], `${p.id}: comida`);
    assert.ok(trio(p.telar.nombre) && p.telar.paleta.length === 5, `${p.id}: telar`);
    for (const [color, hex] of p.telar.paleta) {
      assert.ok(trio(P.NOMBRES_COLORES[color]), `${p.id}: nombre del color ${color}`);
      assert.match(hex, /^#[0-9a-f]{6}$/i);
    }
    assert.equal(new Set(p.telar.paleta.map(([c]) => c)).size, 5, `${p.id}: colores de hilo distintos`);
    assert.ok(p.sombreros.length > 0);
    assert.ok(P.bandera(p.id).includes('<svg'));
  }
});

test('cada país tiene ocho bebidas con dibujo distinto (para quien no distingue colores)', () => {
  for (const id of IDS) {
    const lista = BEBIDAS[id];
    assert.equal(lista.length, 8, id);
    const iconos = lista.map(([, icono]) => icono);
    assert.equal(new Set(iconos).size, 8, `${id}: íconos repetidos`);
    for (const [bebida, icono, nombre, desc] of lista) {
      assert.ok(ICONOS[icono], `${bebida}: falta el ícono ${icono}`);
      assert.ok(trio(nombre) && trio(desc), `${bebida}: textos`);
    }
    const { SABORES, IDS_SABORES } = saboresDe(id);
    assert.equal(IDS_SABORES.length, 8);
    assert.equal(new Set(IDS_SABORES.map((s) => SABORES[s].color)).size, 8, `${id}: colores distintos`);
  }
  assert.equal(new Set(Object.keys(TODAS)).size, Object.keys(TODAS).length);
});

test('los niveles salen con solución con las bebidas de cada país', () => {
  for (const id of IDS) {
    const { IDS_SABORES } = saboresDe(id);
    for (const n of [1, 9, 14, 41]) assert.ok(resolver(generarNivel(n, IDS_SABORES), 200000), `${id} nivel ${n}`);
  }
});

test('cada país tiene diez frutas, de la más chica a la más grande', () => {
  for (const id of IDS) {
    assert.equal(FRUTAS_PAIS[id].length, 10, id);
    const frutas = frutasDe(id);
    frutas.forEach((f, k) => {
      assert.equal(f.r, RADIOS[k]);
      assert.ok(trio(f.nombre), `${id} ${f.id}: nombre`);
      assert.match(f.color, /^#[0-9a-f]{6}$/i);
      assert.match(f.sombra, /^#[0-9a-f]{6}$/i);
    });
  }
});

test('pasaporte: se elige el país de casa y los demás se abren con pasajes', () => {
  const e = estadoInicial();
  P.elegirPaisInicial(e, 'mx');
  assert.equal(P.paisActual(e), 'mx');
  assert.deepEqual(P.paisesAbiertos(e), ['mx']);
  assert.equal(P.pasajesLibres(e), 0);
  assert.equal(P.viajar(e, 'br'), false, 'sin pasaje no se viaja');
  e.puestos = { refresquera: { xp: P.PASAJES[0] } };
  assert.equal(P.pasajesLibres(e), 1);
  assert.equal(P.viajar(e, 'br'), true);
  assert.equal(P.paisActual(e), 'br');
  assert.equal(P.pasajesLibres(e), 0, 'el pasaje se usó');
  assert.equal(P.irA(e, 'mx'), true, 'se puede volver a casa');
  assert.equal(P.irA(e, 'us'), false, 'no se puede ir a un país cerrado');
  e.puestos.frutera = { xp: 10000 };
  assert.equal(P.pasajesLibres(e), P.PASAJES.length - 1);
  assert.equal(P.proximoPasaje(e), null);
});

test('el recetario avanza por separado en cada país', () => {
  const datos = { nivel: 6 };
  assert.equal(nivelesEn(datos, 'bo'), 5, 'Bolivia arranca con los niveles de antes');
  assert.equal(recetasNuevas(datos, 'bo').length, 4);
  assert.equal(recetasNuevas(datos, 'mx').length, 0);
  sumarNivel(datos, 'mx');
  assert.deepEqual(recetasNuevas(datos, 'mx').map((r) => r.id), ['mx-tuna']);
  assert.equal(recetasDe('bo').length, 12);
  assert.equal(recetasDe('us').length, 8);
});
